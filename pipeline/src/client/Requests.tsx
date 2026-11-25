import type { DashboardMode, DashboardRequest, Lead } from "../shared/model"
import { formatWhen } from "../shared/timezone"
import { InstructionForm } from "./InstructionForm"

const statusKind = (status: string) =>
  ["New", "In progress", "Needs Ben", "Done", "Rejected"].includes(status) ? status : "other"

export const RequestCard = ({ request, leadName }: { request: DashboardRequest; leadName: string }) => (
  <article className="request-card" data-testid="request-card">
    <header>
      <span className="badge" data-status={statusKind(request.status)}>
        {request.status || "No status"}
      </span>
      <time dateTime={request.submittedAt}>{formatWhen(request.submittedAt) || "No time"}</time>
    </header>
    <h2>{request.instruction}</h2>
    <p className="card-meta">{leadName ? `Lead · ${leadName}` : "No lead attached"}</p>
    <h3>Bot response</h3>
    <p className="prose">{request.botResponse || "No response yet. Grok Bot has not picked this up."}</p>
    {request.completedAt ? <p className="fine-print">Completed {formatWhen(request.completedAt)}</p> : null}
  </article>
)

export const Requests = ({
  requests,
  leads,
  mode,
  onCreated,
}: {
  requests: DashboardRequest[]
  leads: Lead[]
  mode: DashboardMode
  onCreated: (request: DashboardRequest) => void
}) => {
  const names = new Map(leads.map((lead) => [lead.id, lead.name]))
  return (
    <section className="view" data-testid="view-requests">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Grok Bot</p>
          <h1>Requests.</h1>
        </div>
        <p className="lede">
          New rows wait here with status New. The bot writes its response back. This page still cannot send mail or
          move a card.
        </p>
      </div>
      <InstructionForm mode={mode} onCreated={onCreated} />
      <div className="request-list">
        {requests.length === 0 ? <p className="empty-state">No requests yet.</p> : null}
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            leadName={request.leadId ? names.get(request.leadId) || "Lead not on the board" : ""}
          />
        ))}
      </div>
    </section>
  )
}
