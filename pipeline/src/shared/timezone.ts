export const SYDNEY = "Australia/Sydney"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export type ZonedStamp = {
  date: string
  hour: number
  minute: number
  second: number
  weekday: number
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export const zonedStamp = (iso: string, timeZone = SYDNEY): ZonedStamp => {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(new Date(iso))
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ""
  let hour = Number(read("hour"))
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) hour = 0
  const minute = Number(read("minute"))
  const second = Number(read("second"))
  const weekdayLabel = read("weekday").slice(0, 3)
  const weekday = Math.max(0, WEEKDAYS.indexOf(weekdayLabel as (typeof WEEKDAYS)[number]))
  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    hour,
    minute: Number.isInteger(minute) ? minute : 0,
    second: Number.isInteger(second) ? second : 0,
    weekday,
  }
}

export const todayInSydney = (now = new Date()) => zonedStamp(now.toISOString()).date

// A date-only Notion value stays on that calendar day. A timestamp is bucketed
// into the Australia/Sydney day, including daylight saving.
export const calendarDay = (value: string) => {
  const trimmed = value.trim()
  if (DATE_ONLY.test(trimmed)) return trimmed
  if (!trimmed) return ""
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return ""
  return zonedStamp(parsed.toISOString()).date
}

export const addDays = (date: string, days: number) => {
  const [year, month, day] = date.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  utc.setUTCDate(utc.getUTCDate() + days)
  return utc.toISOString().slice(0, 10)
}

export const dayDiff = (day: string, today: string) => {
  const [year, month, date] = day.split("-").map(Number)
  const [todayYear, todayMonth, todayDate] = today.split("-").map(Number)
  return Math.round(
    (Date.UTC(year, month - 1, date) - Date.UTC(todayYear, todayMonth - 1, todayDate)) / 86_400_000,
  )
}

export const sydneyIso = (now = new Date()) => {
  const stamp = zonedStamp(now.toISOString())
  const wall = `${stamp.date}T${String(stamp.hour).padStart(2, "0")}:${String(stamp.minute).padStart(2, "0")}:${String(stamp.second).padStart(2, "0")}`
  const offsetMinutes = Math.round((Date.parse(`${wall}Z`) - now.getTime()) / 60_000)
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absolute = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0")
  const minutes = String(absolute % 60).padStart(2, "0")
  return `${wall}${sign}${hours}:${minutes}`
}

export const inWindow = (day: string, today: string, days: number) => {
  if (!DATE_ONLY.test(day) || !DATE_ONLY.test(today)) return false
  const start = addDays(today, -(days - 1))
  return day >= start && day <= today
}

export const eachDay = (today: string, days: number) => {
  const start = addDays(today, -(days - 1))
  const result: string[] = []
  for (let index = 0; index < days; index += 1) result.push(addDays(start, index))
  return result
}

export const shortDate = (day: string) => {
  if (!DATE_ONLY.test(day)) return ""
  const [year, month, date] = day.split("-").map(Number)
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, date)))
}

export const sydneyClock = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  const stamp = zonedStamp(parsed.toISOString())
  return `${String(stamp.hour).padStart(2, "0")}:${String(stamp.minute).padStart(2, "0")}`
}

export const formatWhen = (value: string) => {
  const day = calendarDay(value)
  if (!day) return ""
  if (DATE_ONLY.test(value.trim())) return shortDate(day)
  const clock = sydneyClock(value)
  return clock ? `${shortDate(day)}, ${clock}` : shortDate(day)
}
