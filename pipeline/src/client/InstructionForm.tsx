import { type FormEvent, useState } from "react"

import type { DashboardMode, DashboardRequest, Lead } from "../shared/model"
import { createRequest } from "./api"

export const REQUEST_NOTE =
  "Grok Bot picks this up on its next run. Anything that emails someone comes to Ben as a draft first. This dashboard never sends email and never changes a lead's stage or fields."

export const InstructionForm = ({
  lead,
  mode,
  onCreated,
}: {
  lead?: Lead | null
  mode: DashboardMode
  onCreated: (request: DashboardRequest) => void
}) => {
  const [instruction, setInstruction] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError("")
    setNotice("")
    try {
      const created = await createRequest(instruction, lead?.id)
      onCreated(created.request)
      setInstruction("")
      setNotice(
        created.mode === "example"
          ? "Filed on the example board only. It was not written to Notion."
          : "Request filed. Grok Bot picks this up on its next run.",
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The request was not filed.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="instruction" onSubmit={onSubmit} data-testid={lead ? "lead-instruction" : "global-instruction"}>
      <p className="eyebrow">{lead ? "Ask about this lead" : "Instruction to Grok Bot"}</p>
      <h2>{lead ? `For ${lead.name}` : "File a request"}</h2>
      <p className="note">{REQUEST_NOTE}</p>
      <label htmlFor={lead ? `instruction-${lead.id}` : "instruction-global"}>
        {lead ? "What should the bot do with this lead?" : "What should the bot do next?"}
      </label>
      <textarea
        id={lead ? `instruction-${lead.id}` : "instruction-global"}
        name="instruction"
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        required
        minLength={1}
        maxLength={1500}
        rows={4}
        placeholder={lead ? "Draft a pricing reply. Do not send it." : "Pause new sends from info@ until Friday."}
      />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="form-notice" role="status">
          {notice}
        </p>
      ) : null}
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? "Filing…" : "File request"}
      </button>
      {mode === "example" ? <p className="fine-print">Example mode writes nothing to Notion.</p> : null}
    </form>
  )
}
