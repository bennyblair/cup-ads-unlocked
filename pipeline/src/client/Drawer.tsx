import { useEffect, useRef } from "react"

import { lastContact } from "../shared/leads"
import { mailHref, telHref } from "../shared/links"
import type { DashboardMode, DashboardRequest, Lead } from "../shared/model"
import { formatWhen, shortDate } from "../shared/timezone"
import { InstructionForm } from "./InstructionForm"

const Field = ({ label, children }: { label: string; children: string }) => (
  <div>
    <dt>{label}</dt>
    <dd>{children || "—"}</dd>
  </div>
)

export const Drawer = ({
  lead,
  today,
  mode,
  onClose,
  onCreated,
}: {
  lead: Lead
  today: string
  mode: DashboardMode
  onClose: () => void
  onCreated: (request: DashboardRequest) => void
}) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const contact = lastContact(lead)
  const phone = telHref(lead.phone)
  const email = mailHref(lead.email)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose, lead.id])

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-title"
        data-testid="lead-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-bar">
          <p className="eyebrow">{lead.stage || "No stage"}</p>
          <button ref={closeRef} type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
        <h2 id="lead-title">{lead.name}</h2>
        <p className="lede tight">
          {lead.business || "No business"}
          {lead.role ? ` · ${lead.role}` : ""}
        </p>
        <dl className="facts">
          <Field label="Stage">{lead.stage}</Field>
          <Field label="Area / suburb">{lead.suburb}</Field>
          <Field label="State">{lead.state}</Field>
          <Field label="Sector">{lead.sector}</Field>
          <Field label="CupSpace inbox">{lead.inbox}</Field>
          <Field label="Persona">{lead.persona}</Field>
          <Field label="Next action">{lead.nextAction}</Field>
          <Field label="Waiting on">{lead.waitingOn}</Field>
          <Field label="Next action due">{lead.nextActionDue ? formatWhen(lead.nextActionDue) : ""}</Field>
          <div>
            <dt>Email</dt>
            <dd>{email ? <a href={email}>{lead.email}</a> : lead.email || "—"}</dd>
          </div>
          <div>
            <dt>Phone (mobile)</dt>
            <dd>{phone ? <a href={phone}>Call {lead.phone}</a> : lead.phone || "—"}</dd>
          </div>
          <Field label="Last inbound">{lead.lastInbound ? formatWhen(lead.lastInbound) : ""}</Field>
          <Field label="Last outbound">{lead.lastOutbound ? formatWhen(lead.lastOutbound) : ""}</Field>
          <Field label="Last contact">
            {contact.day ? `${contact.kind} ${shortDate(contact.day)}` : ""}
          </Field>
          <Field label="Last contact by">{lead.lastContactBy}</Field>
          <Field label="Thread subject">{lead.threadSubject}</Field>
          <Field label="Value / package">{lead.valuePackage}</Field>
          <Field label="Source message id / UID">{lead.sourceMessageId}</Field>
          <Field label="Sync key">{lead.syncKey}</Field>
        </dl>
        <h3>Latest summary</h3>
        <p className="prose">{lead.latestSummary || "No summary yet."}</p>
        <h3>Notes</h3>
        <p className="prose">{lead.notes || "No notes yet."}</p>
        <p className="fine-print">Sydney today is {shortDate(today)}. Filing a request does not edit these fields.</p>
        <InstructionForm lead={lead} mode={mode} onCreated={onCreated} />
      </aside>
    </div>
  )
}
