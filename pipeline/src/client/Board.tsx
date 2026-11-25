import { useMemo, useState } from "react"

import { emptyFilters, filterLeads, isOverdue, lastContact, stageColumns, type BoardFilters } from "../shared/leads"
import { INBOXES, NEXT_ACTIONS, PERSONAS, WAITING_ON, type Lead } from "../shared/model"
import { calendarDay, shortDate } from "../shared/timezone"

const badgeKind = (value: string) =>
  ["Send pricing", "Reply", "Call", "Follow up", "Wait", "None"].includes(value) ? value : "other"

const dueText = (lead: Lead, today: string) => {
  const day = calendarDay(lead.nextActionDue)
  if (!day) return "No due date"
  if (day < today) return `Overdue · ${shortDate(day)}`
  if (day === today) return "Due today"
  return `Due ${shortDate(day)}`
}

export const LeadCard = ({
  lead,
  today,
  onOpen,
}: {
  lead: Lead
  today: string
  onOpen: (lead: Lead) => void
}) => {
  const contact = lastContact(lead)
  const overdue = isOverdue(lead.nextActionDue, today)
  return (
    <button
      type="button"
      className={overdue ? "lead-card overdue" : "lead-card"}
      data-testid="lead-card"
      onClick={() => onOpen(lead)}
    >
      <span className="card-kicker">
        {lead.suburb || "No suburb"}
        {lead.state ? ` · ${lead.state}` : ""}
      </span>
      <span className="card-title">{lead.name}</span>
      <span className="card-business">{lead.business || "No business"}</span>
      <span className="card-meta">
        {lead.inbox || "No inbox"}
        {lead.persona ? ` · ${lead.persona}` : ""}
      </span>
      <span className="card-meta">{contact.day ? `${contact.kind} ${shortDate(contact.day)}` : "No contact yet"}</span>
      <span className="card-footer">
        <span className="badge" data-kind={badgeKind(lead.nextAction)}>
          {lead.nextAction || "No next action"}
        </span>
        <span className={overdue ? "due overdue-label" : "due"}>{dueText(lead, today)}</span>
      </span>
    </button>
  )
}

const options = (current: string, known: readonly string[], fromLeads: string[]) => {
  const values = new Set<string>([...known, ...fromLeads.filter(Boolean)])
  if (current) values.add(current)
  return [...values]
}

export const Board = ({
  leads,
  today,
  onOpen,
}: {
  leads: Lead[]
  today: string
  onOpen: (lead: Lead) => void
}) => {
  const [filters, setFilters] = useState<BoardFilters>(emptyFilters)
  const filtered = useMemo(() => filterLeads(leads, filters), [leads, filters])
  const columns = useMemo(() => stageColumns(filtered), [filtered])
  const set = (key: keyof BoardFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  return (
    <section className="view" data-testid="view-board">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1>The board.</h1>
        </div>
        <p className="lede">{filtered.length} leads. Swipe the stages on a phone. Overdue cards are marked in coral.</p>
      </div>
      <div className="filters">
        <label htmlFor="filter-search">
          Search
          <input
            id="filter-search"
            name="search"
            type="search"
            value={filters.search}
            onChange={(event) => set("search", event.target.value)}
            placeholder="Name, cafe, suburb"
          />
        </label>
        <label htmlFor="filter-inbox">
          Inbox
          <select id="filter-inbox" name="inbox" value={filters.inbox} onChange={(event) => set("inbox", event.target.value)}>
            <option value="">All inboxes</option>
            {options(filters.inbox, INBOXES, leads.map((lead) => lead.inbox)).map((inbox) => (
              <option key={inbox} value={inbox}>
                {inbox}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filter-persona">
          Persona
          <select id="filter-persona" name="persona" value={filters.persona} onChange={(event) => set("persona", event.target.value)}>
            <option value="">All personas</option>
            {options(filters.persona, PERSONAS, leads.map((lead) => lead.persona)).map((persona) => (
              <option key={persona} value={persona}>
                {persona}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filter-state">
          State
          <select id="filter-state" name="state" value={filters.state} onChange={(event) => set("state", event.target.value)}>
            <option value="">All states</option>
            {options(
              filters.state,
              ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
              leads.map((lead) => lead.state),
            ).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filter-next-action">
          Next action
          <select
            id="filter-next-action"
            name="nextAction"
            value={filters.nextAction}
            onChange={(event) => set("nextAction", event.target.value)}
          >
            <option value="">Any action</option>
            {options(filters.nextAction, NEXT_ACTIONS, leads.map((lead) => lead.nextAction)).map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filter-waiting-on">
          Waiting on
          <select
            id="filter-waiting-on"
            name="waitingOn"
            value={filters.waitingOn}
            onChange={(event) => set("waitingOn", event.target.value)}
          >
            <option value="">Anyone</option>
            {options(filters.waitingOn, WAITING_ON, leads.map((lead) => lead.waitingOn)).map((waiting) => (
              <option key={waiting} value={waiting}>
                {waiting}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="swipe-hint">Swipe sideways for every stage.</p>
      <div className="board">
        {columns.map((column) => (
          <section key={column.stage} className="column" data-stage={column.stage}>
            <header>
              <h2>{column.stage}</h2>
              <span>{column.leads.length}</span>
            </header>
            {column.leads.length === 0 ? <p className="empty-column">Empty</p> : null}
            {column.leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} today={today} onOpen={onOpen} />
            ))}
          </section>
        ))}
      </div>
    </section>
  )
}
