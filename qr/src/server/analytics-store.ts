import { getStore } from "@netlify/blobs"

import {
  BROWSER_NAMES,
  DEVICE_TYPES,
  type BrowserName,
  type DeviceType,
  type ScanEvent,
} from "../shared/scan"
import { isCampaignId } from "../shared/campaign"
import type { ScanReport } from "../shared/report"
import { SCAN_TOKEN_PATTERN } from "../shared/scan-cookie"
import { addDays, campaignTimezone, zonedStamp, type CampaignTimezone } from "../shared/timezone"
import { blobStoreName, type BlobClient } from "./blobs-store"

export const RECENT_SCAN_LIMIT = 30
export const COUNTRY_LIMIT = 40
export const DAY_LIMIT = 400
export const CITY_PER_DAY_LIMIT = 20
export const TOKEN_LIMIT = 2000
export const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000
const KEY_PREFIX = "analytics/"
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export type CampaignStats = {
  recorded: number
  recent: ScanEvent[]
  countries: { label: string; count: number }[]
  devices: { label: string; count: number }[]
  browsers: { label: string; count: number }[]
}

type DayBucket = {
  scans: number
  repeats: number
  unknown: number
  recognized: number
  automated: number
  hours: number[]
  devices: Record<string, number>
  browsers: Record<string, number>
  cities: Record<string, number>
}

type SeenToken = {
  token: string
  expiresAt: string
  returned: boolean
}

type AnalyticsDocument = {
  recorded: number
  recent: ScanEvent[]
  countries: Record<string, number>
  devices: Record<string, number>
  browsers: Record<string, number>
  days: Record<string, DayBucket>
  tokens: SeenToken[]
  recognized: number
}

export type { ScanReport }

export type AnalyticsStore = {
  record(
    id: string,
    event: ScanEvent,
    cookieToken?: string,
    timezone?: string,
  ): Promise<{ token?: string }>
  get(id: string): Promise<CampaignStats | null>
  report(id: string, timezone: CampaignTimezone, from: string, to: string): Promise<ScanReport | null>
  delete(id: string): Promise<void>
  retain(ids: readonly string[]): Promise<void>
}

const emptyHours = () => Array.from({ length: 24 }, () => 0)

const emptyDay = (): DayBucket => ({
  scans: 0,
  repeats: 0,
  unknown: 0,
  recognized: 0,
  automated: 0,
  hours: emptyHours(),
  devices: {},
  browsers: {},
  cities: {},
})

const emptyDocument = (): AnalyticsDocument => ({
  recorded: 0,
  recent: [],
  countries: {},
  devices: {},
  browsers: {},
  days: {},
  tokens: [],
  recognized: 0,
})

const isDevice = (value: string): value is DeviceType =>
  (DEVICE_TYPES as readonly string[]).includes(value)

const isBrowser = (value: string): value is BrowserName =>
  (BROWSER_NAMES as readonly string[]).includes(value)

const tidyCounts = (value: unknown, allowed?: readonly string[]) => {
  if (!value || typeof value !== "object") return {}
  const counts: Record<string, number> = {}
  for (const [label, count] of Object.entries(value)) {
    if (allowed && !allowed.includes(label) && label !== "Other" && label !== "Unknown") continue
    if (label.length < 1 || label.length > 60) continue
    if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > Number.MAX_SAFE_INTEGER) {
      continue
    }
    counts[label] = count
  }
  return counts
}

const parseDocument = (value: unknown): AnalyticsDocument => {
  if (!value || typeof value !== "object") return emptyDocument()
  const record = value as Partial<AnalyticsDocument>
  const recent = Array.isArray(record.recent)
    ? record.recent.flatMap((item) => {
        if (!item || typeof item !== "object") return []
        const event = item as Partial<ScanEvent>
        if (typeof event.at !== "string" || Number.isNaN(Date.parse(event.at))) return []
        if (typeof event.city !== "string" || typeof event.country !== "string") return []
        if (typeof event.device !== "string" || !isDevice(event.device)) return []
        if (typeof event.browser !== "string" || !isBrowser(event.browser)) return []
        return [
          {
            at: new Date(event.at).toISOString(),
            city: event.city,
            country: event.country,
            device: event.device,
            browser: event.browser,
            uniqueness: (event.uniqueness === "repeat" ? "repeat" : "unknown") as "repeat" | "unknown",
            automated: event.automated === true,
          },
        ]
      })
    : []
  return {
    recorded:
      typeof record.recorded === "number" && Number.isInteger(record.recorded) && record.recorded >= 0
        ? record.recorded
        : recent.length,
    recent: recent.slice(0, RECENT_SCAN_LIMIT),
    countries: tidyCounts(record.countries),
    devices: tidyCounts(record.devices, DEVICE_TYPES),
    browsers: tidyCounts(record.browsers, BROWSER_NAMES),
    days: parseDays(record.days),
    tokens: parseTokens(record.tokens),
    recognized:
      typeof record.recognized === "number" && Number.isInteger(record.recognized) && record.recognized >= 0
        ? record.recognized
        : 0,
  }
}

const parseDays = (value: unknown) => {
  if (!value || typeof value !== "object") return {}
  const days: Record<string, DayBucket> = {}
  for (const [date, bucket] of Object.entries(value)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !bucket || typeof bucket !== "object") continue
    const record = bucket as Partial<DayBucket>
    const hours = emptyHours()
    if (Array.isArray(record.hours)) {
      record.hours.slice(0, 24).forEach((count, hour) => {
        if (typeof count === "number" && Number.isInteger(count) && count > 0) hours[hour] = count
      })
    }
    days[date] = {
      scans: positive(record.scans),
      repeats: positive(record.repeats),
      unknown: positive(record.unknown),
      recognized: positive(record.recognized),
      automated: positive(record.automated),
      hours,
      devices: tidyCounts(record.devices, DEVICE_TYPES),
      browsers: tidyCounts(record.browsers, BROWSER_NAMES),
      cities: tidyCounts(record.cities),
    }
  }
  return days
}

const positive = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value > 0 ? value : 0

const parseTokens = (value: unknown): SeenToken[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const token = item as Partial<SeenToken>
    if (typeof token.token !== "string" || !SCAN_TOKEN_PATTERN.test(token.token)) return []
    if (typeof token.expiresAt !== "string" || Number.isNaN(Date.parse(token.expiresAt))) return []
    return [{ token: token.token, expiresAt: new Date(token.expiresAt).toISOString(), returned: token.returned === true }]
  }).slice(-TOKEN_LIMIT)
}

const bump = (counts: Record<string, number>, label: string, limit?: number) => {
  if (counts[label]) {
    counts[label] += 1
    return
  }
  if (limit) {
    const named = Object.keys(counts).filter((key) => key !== "Other" && key !== "Unknown")
    if (label !== "Unknown" && label !== "Other" && named.length >= limit) {
      counts.Other = (counts.Other ?? 0) + 1
      return
    }
  }
  counts[label] = 1
}

const TOKEN_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"

export const newScanToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length]).join("")
}

const pruneTokens = (tokens: SeenToken[], now: number) =>
  tokens.filter((token) => Date.parse(token.expiresAt) > now).slice(-TOKEN_LIMIT)

const pruneDays = (days: Record<string, DayBucket>) => {
  const dates = Object.keys(days).sort()
  if (dates.length <= DAY_LIMIT) return days
  for (const date of dates.slice(0, dates.length - DAY_LIMIT)) delete days[date]
  return days
}

const addEvent = (
  document: AnalyticsDocument,
  event: ScanEvent,
  cookieToken: string | undefined,
  timeZone: CampaignTimezone,
): { document: AnalyticsDocument; setCookie?: string } => {
  const next = parseDocument(document)
  const now = Date.parse(event.at)
  next.tokens = pruneTokens(next.tokens, now)
  let setCookie: string | undefined
  let firstReturn = false
  const known = cookieToken ? next.tokens.find((token) => token.token === cookieToken) : undefined
  if (known) {
    event = { ...event, uniqueness: "repeat" }
    if (!known.returned) {
      known.returned = true
      next.recognized += 1
      firstReturn = true
    }
  } else {
    event = { ...event, uniqueness: "unknown" }
    const token = newScanToken()
    next.tokens = pruneTokens(
      [...next.tokens, { token, expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(), returned: false }],
      now,
    )
    setCookie = token
  }

  const stamp = zonedStamp(event.at, timeZone)
  const day = next.days[stamp.date] ?? emptyDay()
  day.scans += 1
  if (event.uniqueness === "repeat") day.repeats += 1
  else day.unknown += 1
  if (firstReturn) day.recognized += 1
  if (event.automated) day.automated += 1
  day.hours[stamp.hour] += 1
  bump(day.devices, event.device)
  bump(day.browsers, event.browser)
  bump(day.cities, event.city, CITY_PER_DAY_LIMIT)
  next.days[stamp.date] = day
  next.days = pruneDays(next.days)

  next.recorded += 1
  next.recent = [event, ...next.recent].slice(0, RECENT_SCAN_LIMIT)
  bump(next.countries, event.country, COUNTRY_LIMIT)
  bump(next.devices, event.device)
  bump(next.browsers, event.browser)
  return { document: next, setCookie }
}

const ranked = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))

const rollup = (counts: Record<string, number>, limit = 20) => {
  const rankedCounts = ranked(counts)
  if (rankedCounts.length <= limit) return rankedCounts
  const head = rankedCounts.filter((item) => item.label !== "Other").slice(0, limit - 1)
  const kept = new Set(head.map((item) => item.label))
  const rest = rankedCounts
    .filter((item) => !kept.has(item.label))
    .reduce((sum, item) => sum + item.count, 0)
  return [...head, { label: "Other", count: rest }].sort(
    (first, second) => second.count - first.count || first.label.localeCompare(second.label),
  )
}

const mergeCounts = (target: Record<string, number>, source: Record<string, number>) => {
  for (const [label, count] of Object.entries(source)) target[label] = (target[label] ?? 0) + count
}

const weekdayIndex = (date: string) => {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export const buildScanReport = (
  document: AnalyticsDocument,
  timezone: CampaignTimezone,
  from: string,
  to: string,
): ScanReport => {
  const hours = emptyHours()
  const weekdays = [0, 0, 0, 0, 0, 0, 0]
  const cities: Record<string, number> = {}
  const devices: Record<string, number> = {}
  const browsers: Record<string, number> = {}
  const days: ScanReport["days"] = []
  let scans = 0
  let repeats = 0
  let uniquenessUnknown = 0
  let recognizedBrowsers = 0
  let automated = 0
  let cursor = from
  let guard = 0
  while (cursor <= to && guard <= DAY_LIMIT) {
    guard += 1
    const bucket = document.days[cursor]
    const row = {
      date: cursor,
      scans: bucket?.scans ?? 0,
      repeats: bucket?.repeats ?? 0,
      unknown: bucket?.unknown ?? 0,
      recognized: bucket?.recognized ?? 0,
      automated: bucket?.automated ?? 0,
    }
    days.push(row)
    scans += row.scans
    repeats += row.repeats
    uniquenessUnknown += row.unknown
    recognizedBrowsers += row.recognized
    automated += row.automated
    if (bucket) {
      bucket.hours.forEach((count, hour) => {
        hours[hour] += count
      })
      weekdays[weekdayIndex(cursor)] += bucket.scans
      mergeCounts(cities, bucket.cities)
      mergeCounts(devices, bucket.devices)
      mergeCounts(browsers, bucket.browsers)
    }
    const next = addDays(cursor, 1)
    if (next === cursor) break
    cursor = next
  }

  return {
    timezone,
    from,
    to,
    scans,
    repeats,
    uniquenessUnknown,
    recognizedBrowsers,
    automated,
    days,
    weekdays: WEEKDAY_LABELS.map((label, index) => ({ label, count: weekdays[index] ?? 0 })),
    hours: hours.map((count, hour) => ({ hour, count })),
    cities: rollup(cities),
    devices: ranked(devices),
    browsers: ranked(browsers),
    recent: document.recent.filter((event) => {
      const date = zonedStamp(event.at, timezone).date
      return date >= from && date <= to
    }),
    enquiries: "not-tracked",
  }
}

export const emptyScanReport = (timezone: CampaignTimezone, from: string, to: string) =>
  buildScanReport(emptyDocument(), timezone, from, to)

export const toCampaignStats = (document: AnalyticsDocument): CampaignStats => ({
  recorded: document.recorded,
  recent: document.recent,
  countries: ranked(document.countries),
  devices: ranked(document.devices),
  browsers: ranked(document.browsers),
})

const createAnalyticsStore = (
  read: (id: string) => Promise<{ document: AnalyticsDocument | null; etag: string | null }>,
  write: (id: string, document: AnalyticsDocument, etag: string | null) => Promise<boolean>,
  remove: (id: string) => Promise<void>,
  ids: () => Promise<string[]>,
): AnalyticsStore => {
  const tails = new Map<string, Promise<void>>()
  const exclusive = <T>(id: string, operation: () => Promise<T>) => {
    const previous = tails.get(id) ?? Promise.resolve()
    const run = previous.then(operation, operation)
    tails.set(
      id,
      run.then(
        () => undefined,
        () => undefined,
      ),
    )
    return run
  }

  return {
    async record(id, event, cookieToken, timezone) {
      if (!isCampaignId(id)) return {}
      const token = cookieToken && SCAN_TOKEN_PATTERN.test(cookieToken) ? cookieToken : undefined
      return exclusive(id, async () => {
        for (let attempt = 0; attempt < 40; attempt += 1) {
          const current = await read(id)
          const next = addEvent(current.document ?? emptyDocument(), event, token, campaignTimezone(timezone))
          if (await write(id, next.document, current.etag)) return { token: next.setCookie }
        }
        throw new Error("Scan details were updated at the same time.")
      })
    },
    async get(id) {
      if (!isCampaignId(id)) return null
      const current = await read(id)
      return current.document ? toCampaignStats(current.document) : null
    },
    async report(id, timezone, from, to) {
      if (!isCampaignId(id)) return null
      const current = await read(id)
      return buildScanReport(current.document ?? emptyDocument(), timezone, from, to)
    },
    async delete(id) {
      if (!isCampaignId(id)) return
      await remove(id)
    },
    async retain(keep) {
      const allowed = new Set(keep)
      for (const id of await ids()) {
        if (!allowed.has(id)) await remove(id)
      }
    },
  }
}

export const createMemoryAnalytics = () => {
  const docs = new Map<string, { document: AnalyticsDocument; etag: string }>()
  const store = createAnalyticsStore(
    async (id) => {
      await Promise.resolve()
      const current = docs.get(id)
      return current ? { document: current.document, etag: current.etag } : { document: null, etag: null }
    },
    async (id, document, etag) => {
      await Promise.resolve()
      const current = docs.get(id)
      if ((current?.etag ?? null) !== etag) return false
      docs.set(id, { document, etag: String(Number(current?.etag ?? "0") + 1) })
      return true
    },
    async (id) => {
      docs.delete(id)
    },
    async () => [...docs.keys()],
  )
  return Object.assign(store, {
    snapshot(id: string) {
      const current = docs.get(id)
      return current ? (JSON.parse(JSON.stringify(current.document)) as AnalyticsDocument) : null
    },
  })
}

const analyticsKey = (id: string) => `${KEY_PREFIX}${id}`

export const createBlobsAnalyticsStore = (client: BlobClient): AnalyticsStore =>
  createAnalyticsStore(
    async (id) => {
      const result = await client.getWithMetadata(analyticsKey(id), {
        type: "json",
        consistency: "strong",
      })
      if (!result || result.data == null) return { document: null, etag: null }
      return { document: parseDocument(result.data), etag: result.etag ?? null }
    },
    async (id, document, etag) => {
      if (!etag) {
        const created = await client.setJSON(analyticsKey(id), document, { onlyIfNew: true })
        return created.modified
      }
      const updated = await client.setJSON(analyticsKey(id), document, { onlyIfMatch: etag })
      return updated.modified
    },
    async (id) => {
      await client.delete(analyticsKey(id))
    },
    async () => {
      const keys = await client.list(KEY_PREFIX)
      return keys.flatMap((key) => {
        const id = key.slice(KEY_PREFIX.length)
        return isCampaignId(id) ? [id] : []
      })
    },
  )

export const netlifyAnalyticsStore = () => {
  const store = getStore({
    name: blobStoreName(),
    consistency: "strong",
  })
  return createBlobsAnalyticsStore({
    getWithMetadata: (key, options) => store.getWithMetadata(key, options),
    setJSON: (key, data, options) =>
      options.onlyIfMatch
        ? store.setJSON(key, data, { onlyIfMatch: options.onlyIfMatch })
        : store.setJSON(key, data, { onlyIfNew: true }),
    delete: (key) => store.delete(key),
    list: async (prefix) => {
      const listed = await store.list({ prefix })
      return listed.blobs.map((blob) => blob.key)
    },
  })
}
