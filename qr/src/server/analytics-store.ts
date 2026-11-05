import { getStore } from "@netlify/blobs"

import {
  BROWSER_NAMES,
  DEVICE_TYPES,
  type BrowserName,
  type DeviceType,
  type ScanEvent,
} from "../shared/scan"
import { isCampaignId } from "../shared/campaign"
import { blobStoreName, type BlobClient } from "./blobs-store"

export const RECENT_SCAN_LIMIT = 30
export const COUNTRY_LIMIT = 40
const KEY_PREFIX = "analytics/"

export type CampaignStats = {
  recorded: number
  recent: ScanEvent[]
  countries: { label: string; count: number }[]
  devices: { label: string; count: number }[]
  browsers: { label: string; count: number }[]
}

type AnalyticsDocument = {
  recorded: number
  recent: ScanEvent[]
  countries: Record<string, number>
  devices: Record<string, number>
  browsers: Record<string, number>
}

export type AnalyticsStore = {
  record(id: string, event: ScanEvent): Promise<void>
  get(id: string): Promise<CampaignStats | null>
  delete(id: string): Promise<void>
  retain(ids: readonly string[]): Promise<void>
}

const emptyDocument = (): AnalyticsDocument => ({
  recorded: 0,
  recent: [],
  countries: {},
  devices: {},
  browsers: {},
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
  }
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

const addEvent = (document: AnalyticsDocument, event: ScanEvent): AnalyticsDocument => {
  const next = parseDocument(document)
  next.recorded += 1
  next.recent = [event, ...next.recent].slice(0, RECENT_SCAN_LIMIT)
  bump(next.countries, event.country, COUNTRY_LIMIT)
  bump(next.devices, event.device)
  bump(next.browsers, event.browser)
  return next
}

const ranked = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))

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
    async record(id, event) {
      if (!isCampaignId(id)) return
      await exclusive(id, async () => {
        for (let attempt = 0; attempt < 40; attempt += 1) {
          const current = await read(id)
          const next = addEvent(current.document ?? emptyDocument(), event)
          if (await write(id, next, current.etag)) return
        }
        throw new Error("Scan details were updated at the same time.")
      })
    },
    async get(id) {
      if (!isCampaignId(id)) return null
      const current = await read(id)
      return current.document ? toCampaignStats(current.document) : null
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

export const createMemoryAnalytics = (): AnalyticsStore => {
  const docs = new Map<string, { document: AnalyticsDocument; etag: string }>()
  return createAnalyticsStore(
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
