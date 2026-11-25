import { actionLeads, isOverdue } from "../shared/leads"
import { ACTION_TABS, type ActionTab, type Lead } from "../shared/model"
import { telHref } from "../shared/links"
import { calendarDay, shortDate } from "../shared/timezone"

const dueLabel = (lead: Lead, today: string) => {
  const day = calendarDay(lead.nextActionDue)
  if (!day) return "No due date"
  if (day < today) return `Overdue · ${shortDate(day)}`
  if (day === today) return "Due today"
  return `Due ${shortDate(day)}`
}

export const Actions = ({
  leads,
  today,
  tab,
  onTab,
  onOpen,
}: {
  leads: Lead[]
  today: string
  tab: ActionTab
  onTab: (tab: ActionTab) => void
  onOpen: (lead: Lead) => void
}) => {
  const items = actionLeads(leads, tab)
  return (
    <section className="view" data-testid="view-actions">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Actions</p>
          <h1>Do these next.</h1>
        </div>
        <p className="lede">
          Sorted by the oldest due date, then the oldest contact. Held, lost, and do-not-contact leads stay on the
          board.
        </p>
      </div>
      <div className="tabs" role="tablist" aria-label="Next actions">
        {ACTION_TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            data-testid={`tab-${name}`}
            onClick={() => onTab(name)}
          >
            {name}
            <span>{actionLeads(leads, name).length}</span>
          </button>
        ))}
      </div>
      {items.length === 0 ? <p className="empty-state">Nothing in {tab} right now.</p> : null}
      <div className="action-list">
        {items.map((lead) => {
          const phone = tab === "Call" ? telHref(lead.phone) : null
          const overdue = isOverdue(lead.nextActionDue, today)
          return (
            <article key={lead.id} className={overdue ? "action-card overdue" : "action-card"} data-testid="action-card">
              <header>
                <h2>{lead.name}</h2>
                <span className={overdue ? "due overdue-label" : "due"}>{dueLabel(lead, today)}</span>
              </header>
              <p className="card-business">
                {lead.business || "No business"}
                {lead.suburb ? ` · ${lead.suburb}` : ""}
                {lead.state ? `, ${lead.state}` : ""}
              </p>
              {lead.threadSubject ? <p className="subject">{lead.threadSubject}</p> : <p className="subject muted">No thread subject</p>}
              <p className="summary">{lead.latestSummary || "No summary yet."}</p>
              <div className="row-actions">
                {phone ? (
                  <a className="primary-button" href={phone} data-testid="tap-to-call">
                    Call {lead.phone}
                  </a>
                ) : null}
                {tab === "Call" && lead.phone && !phone ? <span className="fine-print">{lead.phone}</span> : null}
                <button type="button" className="ghost-button" onClick={() => onOpen(lead)}>
                  Open lead
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
