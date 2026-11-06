import { useEffect, useRef, useState } from "react"

import { REPORTING_NOTES } from "../shared/reporting-notes"
import { addDays, todayInTimezone } from "../shared/timezone"
import {
  AuthError,
  campaignReport,
  downloadReport,
  type CampaignView,
  type ScanReportView,
} from "./api"

const numberFormat = new Intl.NumberFormat("en-AU")

const formatDay = (date: string) => {
  const [year, month, day] = date.split("-").map(Number)
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

const formatScan = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat("en-AU", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
    hourCycle: "h23",
  }).format(new Date(iso))

const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00–${String((hour + 1) % 24).padStart(2, "0")}:00`

const deviceLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const ReportPanel = ({
  campaign,
  onError,
}: {
  campaign: CampaignView
  onError: (message: string) => void
}) => {
  const zone = campaign.timezone || "Australia/Sydney"
  const today = todayInTimezone(zone)
  const [from, setFrom] = useState(addDays(today, -29))
  const [to, setTo] = useState(today)
  const [report, setReport] = useState<ScanReportView | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    campaignReport(campaign.id, from, to)
      .then((body) => {
        if (!cancelled) setReport(body.report)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof AuthError) {
          window.location.assign("/login")
          return
        }
        onErrorRef.current(error instanceof Error ? error.message : "Could not load the report.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [campaign.id, from, to])

  const download = async () => {
    setDownloading(true)
    try {
      await downloadReport(campaign, from, to)
    } catch (error) {
      if (error instanceof AuthError) window.location.assign("/login")
      else onError(error instanceof Error ? error.message : "Could not download the report.")
    } finally {
      setDownloading(false)
    }
  }

  const busiestWeekday = report?.weekdays.reduce((best, day) => (day.count > best.count ? day : best))
  const busiestHour = report?.hours.reduce((best, hour) => (hour.count > best.count ? hour : best))

  return (
    <section className="scan-details report-sheet">
      <div className="report-heading">
        <div>
          <h4>Report for {campaign.name}</h4>
          {campaign.placeLabel ? <p className="muted">{campaign.placeLabel}</p> : null}
          <p className="fine-print">{REPORTING_NOTES.place}</p>
        </div>
        <div className="report-actions no-print">
          <button type="button" className="ghost-button" disabled={downloading} onClick={() => void download()}>
            {downloading ? "Downloading…" : "Download CSV"}
          </button>
          <button type="button" className="ghost-button" onClick={() => window.print()}>
            Print report
          </button>
        </div>
      </div>
      <div className="report-range no-print">
        <label>
          From
          <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} />
        </label>
      </div>
      <p className="fine-print">
        {formatDay(from)} to {formatDay(to)} · {zone}
      </p>
      {loading || !report ? (
        <p className="muted">Loading report…</p>
      ) : (
        <>
          <div className="report-metrics">
            <p><span>Campaign visits</span><strong>{numberFormat.format(campaign.visits)}</strong></p>
            <p><span>Scans in range</span><strong>{numberFormat.format(report.scans)}</strong></p>
            <p><span>Repeat scans</span><strong>{numberFormat.format(report.repeats)}</strong></p>
            <p><span>Uniqueness unknown</span><strong>{numberFormat.format(report.uniquenessUnknown)}</strong></p>
            <p><span>Recognized browsers</span><strong>{numberFormat.format(report.recognizedBrowsers)}</strong></p>
            <p><span>Possible automated</span><strong>{numberFormat.format(report.automated)}</strong></p>
            <p><span>Enquiry conversions</span><strong>Not connected</strong></p>
          </div>
          <p className="fine-print">{REPORTING_NOTES.visits}</p>
          <p className="fine-print">{REPORTING_NOTES.uniqueness}</p>
          <p className="fine-print">{REPORTING_NOTES.history}</p>
          <p className="fine-print">{REPORTING_NOTES.automated}</p>
          <p className="fine-print">{REPORTING_NOTES.enquiries}</p>
          <p className="fine-print">{REPORTING_NOTES.timezone}</p>
          <p className="fine-print">{REPORTING_NOTES.country}</p>
          <h4>Daily scans</h4>
          <ul className="breakdown">
            {report.days.filter((day) => day.scans > 0).length === 0 ? (
              <li>No scans in this range yet.</li>
            ) : (
              report.days.filter((day) => day.scans > 0).map((day) => (
                <li key={day.date}>
                  {formatDay(day.date)} · {numberFormat.format(day.scans)}
                  {day.repeats > 0 ? ` · ${numberFormat.format(day.repeats)} repeat` : ""}
                  {day.automated > 0 ? ` · ${numberFormat.format(day.automated)} automated` : ""}
                </li>
              ))
            )}
          </ul>
          <h4>Busiest weekdays</h4>
          <ul className="breakdown">
            {report.weekdays.map((day) => (
              <li key={day.label}>
                {day.label} · {numberFormat.format(day.count)}
                {busiestWeekday && busiestWeekday.count > 0 && day.label === busiestWeekday.label ? " · busiest" : ""}
              </li>
            ))}
          </ul>
          <h4>Busiest hours</h4>
          {report.hours.every((hour) => hour.count === 0) ? <p className="muted">No scans in this range yet.</p> : (
            <ul className="breakdown">
              {report.hours.filter((hour) => hour.count > 0).map((hour) => (
                <li key={hour.hour}>
                  {hourLabel(hour.hour)} · {numberFormat.format(hour.count)}
                  {busiestHour && hour.hour === busiestHour.hour ? " · busiest" : ""}
                </li>
              ))}
            </ul>
          )}
          <h4>Approximate city</h4>
          <Breakdown items={report.cities} />
          <h4>Devices</h4>
          <Breakdown items={report.devices} devices />
          <h4>Browsers</h4>
          <Breakdown items={report.browsers} />
          <h4>Scan times</h4>
          <p className="fine-print">The latest saved scans in this range. Older daily totals remain after this list rolls off.</p>
          {report.recent.length === 0 ? <p className="muted">No individual scans in this range.</p> : (
            <ul className="recent-scans">
              {report.recent.map((event, index) => (
                <li key={`${event.at}-${index}`}>
                  <time dateTime={event.at}>{formatScan(event.at, report.timezone)}</time>
                  <span>{event.city}</span>
                  <span>{deviceLabel(event.device)} · {event.browser}</span>
                  <span>{event.uniqueness === "repeat" ? "Repeat browser" : "Uniqueness unknown"}</span>
                  {event.automated ? <span>Possible automated</span> : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

const Breakdown = ({
  items,
  devices = false,
}: {
  items: { label: string; count: number }[]
  devices?: boolean
}) =>
  items.length === 0 ? <p className="muted">None recorded in this range.</p> : (
    <ul className="breakdown">
      {items.map((item) => (
        <li key={item.label}>
          {devices ? deviceLabel(item.label) : item.label} · {numberFormat.format(item.count)}
        </li>
      ))}
    </ul>
  )
