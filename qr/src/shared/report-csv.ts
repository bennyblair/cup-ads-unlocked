import { REPORTING_NOTES } from "./reporting-notes"
import type { ScanReport } from "./report"

const csvCell = (value: unknown) => {
  const text = value == null ? "" : String(value)
  const prefixed = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${prefixed.replace(/"/g, '""')}"`
}

const line = (cells: unknown[]) => cells.map(csvCell).join(",")

export const reportToCsv = (input: {
  name: string
  placeLabel?: string
  trackingUrl: string
  destination: string
  visits: number
  report: ScanReport
}) => {
  const { report } = input
  const rows = [
    line(["CupSpace QR report", input.name]),
    line(["Cafe label", input.placeLabel || ""]),
    line(["Tracking URL", input.trackingUrl]),
    line(["Destination", input.destination]),
    line(["Timezone", report.timezone]),
    line(["From", report.from]),
    line(["To", report.to]),
    line(["Campaign visits", input.visits]),
    line(["Scans in range", report.scans]),
    line(["Repeat scans in range", report.repeats]),
    line(["Uniqueness unknown", report.uniquenessUnknown]),
    line(["Recognized browsers", report.recognizedBrowsers]),
    line(["Possible automated scans", report.automated]),
    line(["Enquiry conversions", "not connected"]),
    line(["Note", REPORTING_NOTES.visits]),
    line(["Note", REPORTING_NOTES.uniqueness]),
    line(["Note", REPORTING_NOTES.history]),
    line(["Note", REPORTING_NOTES.automated]),
    line(["Note", REPORTING_NOTES.enquiries]),
    line(["Note", REPORTING_NOTES.place]),
    line(["Note", REPORTING_NOTES.timezone]),
    line(["Note", REPORTING_NOTES.country]),
    "",
    line(["date", "scans", "repeat scans", "uniqueness unknown", "recognized browsers", "possible automated"]),
    ...report.days.map((day) =>
      line([day.date, day.scans, day.repeats, day.unknown, day.recognized, day.automated]),
    ),
    "",
    line(["weekday", "scans"]),
    ...report.weekdays.map((day) => line([day.label, day.count])),
    "",
    line(["hour", "scans"]),
    ...report.hours.map((hour) => line([`${String(hour.hour).padStart(2, "0")}:00`, hour.count])),
    "",
    line(["city", "scans"]),
    ...(report.cities.length === 0 ? [line(["Unknown", 0])] : report.cities.map((city) => line([city.label, city.count]))),
    "",
    line(["device", "scans"]),
    ...report.devices.map((device) => line([device.label, device.count])),
    "",
    line(["browser", "scans"]),
    ...report.browsers.map((browser) => line([browser.label, browser.count])),
    "",
    line(["scan time", "city", "device", "browser", "uniqueness", "possible automated"]),
    ...report.recent.map((event) =>
      line([
        event.at,
        event.city,
        event.device,
        event.browser,
        event.uniqueness,
        event.automated ? "yes" : "no",
      ]),
    ),
    "",
  ]
  return `${rows.join("\n")}\n`
}
