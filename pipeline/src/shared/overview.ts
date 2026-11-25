import { actionLeads, isActionable, isDueOn } from "./leads"
import { INBOXES, type InboxWindow, type Lead, type Overview, type SendStat } from "./model"
import { calendarDay, eachDay, inWindow, todayInSydney } from "./timezone"

const replyRate = (replies: number, sent: number) => (sent > 0 ? replies / sent : 0)

const blank = () => ({ sent: 0, bounces: 0, replies: 0 })

const windowFor = (stats: SendStat[], today: string, days: number): InboxWindow => {
  const trend = new Map(eachDay(today, days).map((date) => [date, blank()]))
  const byInbox = new Map<string, { sent: number; bounces: number; replies: number }>()

  for (const stat of stats) {
    const day = calendarDay(stat.date)
    if (!inWindow(day, today, days)) continue
    const inbox = stat.inbox || "Unknown inbox"
    const row = byInbox.get(inbox) ?? blank()
    row.sent += stat.sent
    row.bounces += stat.bounces
    row.replies += stat.replies
    byInbox.set(inbox, row)
    const dayRow = trend.get(day)
    if (dayRow) {
      dayRow.sent += stat.sent
      dayRow.bounces += stat.bounces
      dayRow.replies += stat.replies
    }
  }

  const known = new Set<string>(INBOXES)
  const names = [
    ...INBOXES,
    ...[...byInbox.keys()].filter((inbox) => !known.has(inbox)).sort((left, right) => left.localeCompare(right, "en-AU")),
  ]
  const rows = names.map((inbox) => {
    const row = byInbox.get(inbox) ?? blank()
    return { inbox, ...row, replyRate: replyRate(row.replies, row.sent) }
  })
  const totals = rows.reduce((sum, row) => {
    sum.sent += row.sent
    sum.bounces += row.bounces
    sum.replies += row.replies
    return sum
  }, blank())

  return {
    days,
    rows,
    totals: { ...totals, replyRate: replyRate(totals.replies, totals.sent) },
    trend: [...trend.entries()].map(([date, row]) => ({ date, ...row })),
  }
}

export const buildOverview = (leads: Lead[], stats: SendStat[], now = new Date()): Overview => {
  const today = todayInSydney(now)
  const due = (action: string) =>
    actionLeads(leads, action).filter((lead) => isActionable(lead) && isDueOn(lead.nextActionDue, today)).length

  return {
    timezone: "Australia/Sydney",
    today,
    counts: {
      waitingOnUs: leads.filter((lead) => isActionable(lead) && lead.waitingOn === "Us").length,
      callsDue: due("Call"),
      pricingToSend: actionLeads(leads, "Send pricing").length,
      repliesNeeded: actionLeads(leads, "Reply").length,
      followUpsDue: due("Follow up"),
      activeCampaigns: leads.filter((lead) => lead.stage === "Active campaign").length,
      won: leads.filter((lead) => lead.stage === "Won").length,
    },
    windows: [windowFor(stats, today, 7), windowFor(stats, today, 30)],
  }
}

export const formatRate = (rate: number, sent: number) => {
  if (sent <= 0) return "—"
  const percent = Math.round(rate * 1000) / 10
  return Number.isInteger(percent) ? `${percent.toFixed(0)}%` : `${percent.toFixed(1)}%`
}
