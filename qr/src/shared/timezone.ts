export const CAMPAIGN_TIMEZONES = [
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Darwin",
  "Australia/Adelaide",
  "Australia/Perth",
  "Australia/Hobart",
] as const

export type CampaignTimezone = (typeof CAMPAIGN_TIMEZONES)[number]

export const DEFAULT_TIMEZONE: CampaignTimezone = "Australia/Sydney"

export const TIMEZONE_LABELS: Record<CampaignTimezone, string> = {
  "Australia/Sydney": "Sydney / Canberra (daylight saving)",
  "Australia/Melbourne": "Melbourne (daylight saving)",
  "Australia/Brisbane": "Brisbane / Townsville (no daylight saving)",
  "Australia/Darwin": "Darwin (no daylight saving)",
  "Australia/Adelaide": "Adelaide (daylight saving)",
  "Australia/Perth": "Perth (no daylight saving)",
  "Australia/Hobart": "Hobart (daylight saving)",
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export const isCampaignTimezone = (value: string): value is CampaignTimezone =>
  (CAMPAIGN_TIMEZONES as readonly string[]).includes(value)

export const campaignTimezone = (value: string | undefined): CampaignTimezone =>
  value && isCampaignTimezone(value) ? value : DEFAULT_TIMEZONE

export type ZonedStamp = {
  date: string
  hour: number
  weekday: number
  weekdayLabel: string
  time: string
}

export const zonedStamp = (iso: string, timeZone: string): ZonedStamp => {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(new Date(iso))
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ""
  let hour = Number(read("hour"))
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) hour = 0
  const weekdayLabel = read("weekday").slice(0, 3)
  const weekday = Math.max(0, WEEKDAYS.indexOf(weekdayLabel as (typeof WEEKDAYS)[number]))
  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    hour,
    weekday,
    weekdayLabel: WEEKDAYS[weekday] ?? "Sun",
    time: `${String(hour).padStart(2, "0")}:${read("minute").padStart(2, "0")}`,
  }
}

export const todayInTimezone = (timeZone: string, now = new Date()) => zonedStamp(now.toISOString(), timeZone).date

export const addDays = (date: string, days: number) => {
  const [year, month, day] = date.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  utc.setUTCDate(utc.getUTCDate() + days)
  return utc.toISOString().slice(0, 10)
}
