import { useState } from "react"

import { actionLeads, isDueOn } from "../shared/leads"
import type { DashboardPayload } from "../shared/model"
import { formatRate } from "../shared/overview"
import { shortDate } from "../shared/timezone"
import { InstructionForm } from "./InstructionForm"

const TILES = [
  { key: "waitingOnUs", label: "Waiting on us", hint: "Open leads", view: "board" },
  { key: "callsDue", label: "Calls due", hint: "Today or overdue", view: "actions", tab: "Call" },
  { key: "pricingToSend", label: "Pricing to send", hint: "Open leads", view: "actions", tab: "Send pricing" },
  { key: "repliesNeeded", label: "Replies needed", hint: "Open leads", view: "actions", tab: "Reply" },
  { key: "followUpsDue", label: "Follow-ups due", hint: "Today or overdue", view: "actions", tab: "Follow up" },
  { key: "activeCampaigns", label: "Active campaigns", hint: "On the board", view: "board" },
  { key: "won", label: "Won", hint: "On the board", view: "board" },
] as const

export const TrendChart = ({ days }: { days: { date: string; sent: number; bounces: number; replies: number }[] }) => {
  const max = Math.max(1, ...days.map((day) => day.sent))
  const width = 640
  const height = 168
  const gap = 3
  const barWidth = (width - gap * (days.length - 1)) / days.length
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily sends in Australia/Sydney">
        {days.map((day, index) => {
          const barHeight = Math.max(day.sent > 0 ? 3 : 0, Math.round((day.sent / max) * (height - 28)))
          const x = index * (barWidth + gap)
          const y = height - 22 - barHeight
          const today = index === days.length - 1
          return (
            <g key={day.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={1.5}
                fill={today ? "#ff5c33" : "#0c4f38"}
              >
                <title>{`${shortDate(day.date)}: ${day.sent} sent, ${day.replies} replies, ${day.bounces} bounces`}</title>
              </rect>
            </g>
          )
        })}
      </svg>
      <figcaption>
        <span>{days[0] ? shortDate(days[0].date) : ""}</span>
        <span>Today in coral</span>
        <span>{days.at(-1) ? shortDate(days.at(-1)!.date) : ""}</span>
      </figcaption>
      <table className="sr-only">
        <caption>Daily send totals</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Sent</th>
            <th>Bounces</th>
            <th>Replies</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{day.date}</td>
              <td>{day.sent}</td>
              <td>{day.bounces}</td>
              <td>{day.replies}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export const Overview = ({
  data,
  onOpen,
  onCreated,
}: {
  data: DashboardPayload
  onOpen: (view: "board" | "actions", tab?: "Send pricing" | "Reply" | "Call" | "Follow up") => void
  onCreated: (request: DashboardPayload["requests"][number]) => void
}) => {
  const [windowDays, setWindowDays] = useState<7 | 30>(30)
  const selectedWindow = data.overview.windows.find((item) => item.days === windowDays) ?? data.overview.windows[0]
  const counts = data.overview.counts

  return (
    <section className="view" data-testid="view-overview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>What's waiting.</h1>
        </div>
        <p className="lede">
          Counts use Australia/Sydney. Due means today or earlier. Held, lost, and do-not-contact leads stay on the
          board and out of the action counts.
        </p>
      </div>
      <div className="stats">
        {TILES.map((tile) => (
          <button
            key={tile.key}
            type="button"
            className="stat"
            data-testid={`stat-${tile.key}`}
            onClick={() => onOpen(tile.view, "tab" in tile ? tile.tab : undefined)}
          >
            <span className="stat-label">{tile.label}</span>
            <span className="stat-value">{counts[tile.key]}</span>
            <span className="stat-hint">{tile.hint}</span>
          </button>
        ))}
      </div>
      <div className="split">
        <article className="panel">
          <div className="section-heading tight">
            <h2>Sends per inbox</h2>
            <div className="segmented" role="group" aria-label="Send window">
              {[7, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={windowDays === days}
                  onClick={() => setWindowDays(days as 7 | 30)}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
          {selectedWindow ? (
            <>
              <TrendChart days={selectedWindow.trend} />
              <p className="totals">
                {selectedWindow.totals.sent} sent · {selectedWindow.totals.bounces} bounces · {selectedWindow.totals.replies}{" "}
                replies · {formatRate(selectedWindow.totals.replyRate, selectedWindow.totals.sent)} reply rate
              </p>
              <ul className="inbox-list">
                {selectedWindow.rows.map((row) => (
                  <li key={row.inbox}>
                    <div className="inbox-top">
                      <span className="inbox-name">{row.inbox}</span>
                      <span className="inbox-rate">{formatRate(row.replyRate, row.sent)}</span>
                    </div>
                    <div className="meter" aria-hidden="true">
                      <span style={{ width: `${Math.min(100, row.replyRate * 100)}%` }} />
                    </div>
                    <p className="inbox-meta">
                      {row.sent} sent · {row.bounces} bounces · {row.replies} replies
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </article>
        <InstructionForm mode={data.mode} onCreated={onCreated} />
      </div>
      <LeadPeek leads={data.leads} today={data.overview.today} onOpen={() => onOpen("actions", "Call")} />
    </section>
  )
}

const LeadPeek = ({ leads, today, onOpen }: { leads: DashboardPayload["leads"]; today: string; onOpen: () => void }) => {
  const calls = actionLeads(leads, "Call").filter((lead) => isDueOn(lead.nextActionDue, today))
  if (calls.length === 0) return null
  return (
    <p className="fine-print peek">
      {calls.length} call{calls.length === 1 ? "" : "s"} due in Sydney.{" "}
      <button type="button" className="text-button" onClick={onOpen}>
        Open the call list
      </button>
    </p>
  )
}
