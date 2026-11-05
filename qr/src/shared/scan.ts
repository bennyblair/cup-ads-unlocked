export const DEVICE_TYPES = ["phone", "tablet", "desktop", "unknown"] as const
export const BROWSER_NAMES = [
  "Safari",
  "Chrome",
  "Firefox",
  "Edge",
  "Samsung Internet",
  "Other",
  "Unknown",
] as const

export type DeviceType = (typeof DEVICE_TYPES)[number]
export type BrowserName = (typeof BROWSER_NAMES)[number]

export type ScanEvent = {
  at: string
  city: string
  country: string
  device: DeviceType
  browser: BrowserName
}

export const UNKNOWN_PLACE = "Unknown"

const safePlace = (value: unknown) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim().replace(/\s+/g, " ")
  if (trimmed.length < 1 || trimmed.length > 60) return null
  if (!/^[\p{L}\p{M}\p{N} .,'()-]+$/u.test(trimmed)) return null
  return trimmed
}

const countryName = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? null
  } catch {
    return null
  }
}

const countryFromCode = (value: unknown) => {
  if (typeof value !== "string" || !/^[A-Za-z]{2}$/.test(value)) return null
  const code = value.toUpperCase()
  if (code === "XX" || code === "T1") return null
  const name = countryName(code)
  return name && name !== code ? safePlace(name) : null
}

const decodeGeo = (header: string) => {
  if (header.length < 4 || header.length > 4000) return null
  if (!/^[A-Za-z0-9+/_=\s-]+$/.test(header)) return null
  try {
    const normalized = header.replace(/\s/g, "").replaceAll("-", "+").replaceAll("_", "/")
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
    return JSON.parse(atob(padded)) as unknown
  } catch {
    return null
  }
}

const placeFromGeo = (value: unknown) => {
  if (!value || typeof value !== "object") return null
  const record = value as { city?: unknown; country?: unknown }
  const city = safePlace(record.city) ?? UNKNOWN_PLACE
  let country: string | null = null
  if (record.country && typeof record.country === "object") {
    const countryRecord = record.country as { name?: unknown; code?: unknown }
    country = safePlace(countryRecord.name) ?? countryFromCode(countryRecord.code)
  } else {
    country = countryFromCode(record.country)
  }
  return { city, country: country ?? UNKNOWN_PLACE }
}

export const placeFromHeaders = (headers: Headers) => {
  const geo = headers.get("x-nf-geo")
  const parsed = geo ? placeFromGeo(decodeGeo(geo)) : null
  if (parsed) return parsed
  if (geo) return { city: UNKNOWN_PLACE, country: UNKNOWN_PLACE }
  return {
    city: UNKNOWN_PLACE,
    country: countryFromCode(headers.get("x-country")) ?? UNKNOWN_PLACE,
  }
}

export const clientFromUserAgent = (userAgent: string | null) => {
  const agent = (userAgent ?? "").slice(0, 400)
  if (!agent.trim()) return { device: "unknown" as DeviceType, browser: "Unknown" as BrowserName }

  let browser: BrowserName = "Other"
  if (/Edg(?:e|A|iOS)?\//.test(agent)) browser = "Edge"
  else if (/SamsungBrowser\//.test(agent)) browser = "Samsung Internet"
  else if (/Firefox\/|FxiOS\//.test(agent)) browser = "Firefox"
  else if (/Chrome\/|CriOS\//.test(agent)) browser = "Chrome"
  else if (/Safari\//.test(agent)) browser = "Safari"

  let device: DeviceType = "desktop"
  if (/iPad|Tablet/i.test(agent)) device = "tablet"
  else if (/Android/i.test(agent) && !/Mobile/i.test(agent)) device = "tablet"
  else if (/Mobile|iPhone|Android/i.test(agent)) device = "phone"

  return { device, browser }
}

export const scanFromRequest = (request: Request, now = new Date()): ScanEvent => {
  const place = placeFromHeaders(request.headers)
  const client = clientFromUserAgent(request.headers.get("user-agent"))
  return {
    at: now.toISOString(),
    city: place.city,
    country: place.country,
    device: client.device,
    browser: client.browser,
  }
}

export const locationLabel = (event: Pick<ScanEvent, "city" | "country">) => {
  if (event.city === UNKNOWN_PLACE && event.country === UNKNOWN_PLACE) return UNKNOWN_PLACE
  if (event.city === UNKNOWN_PLACE) return event.country
  if (event.country === UNKNOWN_PLACE) return event.city
  return `${event.city}, ${event.country}`
}
