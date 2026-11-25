import type { Lead } from "./model"
import { CLOSED_STAGES, PAUSED_STAGE, STAGES } from "./model"
import { calendarDay } from "./timezone"

const closed = new Set<string>(CLOSED_STAGES)

export const isClosedStage = (stage: string) => closed.has(stage)

export const isActionable = (lead: Lead) => !isClosedStage(lead.stage) && lead.stage !== PAUSED_STAGE

export const isDueOn = (value: string, today: string) => {
  const day = calendarDay(value)
  return day !== "" && day <= today
}

export const isOverdue = (value: string, today: string) => {
  const day = calendarDay(value)
  return day !== "" && day < today
}

export type LastContact = { day: string; kind: "Inbound" | "Outbound" | "" }

export const lastContact = (lead: Lead): LastContact => {
  const inbound = calendarDay(lead.lastInbound)
  const outbound = calendarDay(lead.lastOutbound)
  if (inbound && outbound) {
    return inbound >= outbound ? { day: inbound, kind: "Inbound" } : { day: outbound, kind: "Outbound" }
  }
  if (inbound) return { day: inbound, kind: "Inbound" }
  if (outbound) return { day: outbound, kind: "Outbound" }
  return { day: "", kind: "" }
}

export const sortByDue = (leads: Lead[]) =>
  [...leads].sort((left, right) => {
    const leftDue = calendarDay(left.nextActionDue)
    const rightDue = calendarDay(right.nextActionDue)
    if (leftDue && rightDue && leftDue !== rightDue) return leftDue < rightDue ? -1 : 1
    if (leftDue && !rightDue) return -1
    if (!leftDue && rightDue) return 1
    const leftContact = lastContact(left).day
    const rightContact = lastContact(right).day
    if (leftContact && rightContact && leftContact !== rightContact) return leftContact < rightContact ? -1 : 1
    if (leftContact && !rightContact) return -1
    if (!leftContact && rightContact) return 1
    return left.name.localeCompare(right.name, "en-AU")
  })

export type BoardFilters = {
  inbox: string
  persona: string
  state: string
  nextAction: string
  waitingOn: string
  search: string
}

export const emptyFilters = (): BoardFilters => ({
  inbox: "",
  persona: "",
  state: "",
  nextAction: "",
  waitingOn: "",
  search: "",
})

const haystack = (lead: Lead) =>
  [
    lead.name,
    lead.business,
    lead.role,
    lead.email,
    lead.phone,
    lead.suburb,
    lead.state,
    lead.sector,
    lead.inbox,
    lead.persona,
    lead.threadSubject,
    lead.latestSummary,
    lead.valuePackage,
  ]
    .join("\n")
    .toLowerCase()

export const filterLeads = (leads: Lead[], filters: BoardFilters) => {
  const query = filters.search.trim().toLowerCase()
  return leads.filter((lead) => {
    if (filters.inbox && lead.inbox !== filters.inbox) return false
    if (filters.persona && lead.persona !== filters.persona) return false
    if (filters.state && lead.state !== filters.state) return false
    if (filters.nextAction && lead.nextAction !== filters.nextAction) return false
    if (filters.waitingOn && lead.waitingOn !== filters.waitingOn) return false
    if (query && !haystack(lead).includes(query)) return false
    return true
  })
}

export const stageColumns = (leads: Lead[]) => {
  const known = new Set<string>(STAGES)
  const extras = [...new Set(leads.map((lead) => lead.stage).filter((stage) => stage !== "" && !known.has(stage)))].sort(
    (left, right) => left.localeCompare(right, "en-AU"),
  )
  const names = [...STAGES, ...extras]
  const unstaged = leads.some((lead) => !lead.stage)
  return [
    ...names.map((stage) => ({
      stage,
      leads: sortByDue(leads.filter((lead) => lead.stage === stage)),
    })),
    ...(unstaged ? [{ stage: "No stage", leads: sortByDue(leads.filter((lead) => !lead.stage)) }] : []),
  ]
}

export const actionLeads = (leads: Lead[], nextAction: string) =>
  sortByDue(leads.filter((lead) => !isClosedStage(lead.stage) && lead.stage !== PAUSED_STAGE && lead.nextAction === nextAction))
