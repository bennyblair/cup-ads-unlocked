import { type FormEvent, useEffect, useRef, useState } from "react"

import { normalizeDestination, normalizeName, normalizePlaceLabel } from "../shared/destination"
import { CAMPAIGN_TIMEZONES, TIMEZONE_LABELS, campaignTimezone, isCampaignTimezone } from "../shared/timezone"
import { suggestedDestination } from "../shared/utm"
import {
  AuthError,
  createCampaign,
  deleteCampaign,
  downloadBackup,
  downloadQr,
  listCampaigns,
  logout,
  restoreBackup,
  updateCampaign,
  type CampaignView,
} from "./api"
import { BrandHeader } from "./Brand"
import { Dialog } from "./Dialog"
import { ReportPanel } from "./ReportPanel"

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
})
const numberFormat = new Intl.NumberFormat("en-AU")

const goToLogin = () => {
  window.location.assign("/login")
}

const handleAuth = (error: unknown) => {
  if (error instanceof AuthError) {
    goToLogin()
    return true
  }
  return false
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<CampaignView[]>([])
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")
  const [loadError, setLoadError] = useState("")
  const [status, setStatus] = useState("")
  const [dialog, setDialog] = useState<"create" | "restore" | CampaignView | "delete" | null>(null)
  const [editing, setEditing] = useState<CampaignView | null>(null)
  const [deleting, setDeleting] = useState<CampaignView | null>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const load = async () => {
    setState("loading")
    setLoadError("")
    try {
      setCampaigns(await listCampaigns())
      setState("ready")
    } catch (error) {
      if (handleAuth(error)) return
      setState("error")
      setLoadError(error instanceof Error ? error.message : "Could not load campaigns.")
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const signOut = async () => {
    try {
      await logout()
    } catch {
      // The cookie is cleared when the server can. Always leave the page.
    }
    goToLogin()
  }

  const totalVisits = campaigns.reduce((sum, campaign) => sum + campaign.visits, 0)

  return (
    <main className="shell">
      <BrandHeader onSignOut={() => void signOut()} />
      <p className="eyebrow">From cup to connection</p>
      <h1>
        Small code. Big
        <br />
        possibilities.
      </h1>
      <p className="lede">Create your QR. Share your campaign. Count the visits.</p>
      <button type="button" className="primary-button" data-testid="create-qr" onClick={() => setDialog("create")}>
        + Create QR code
      </button>

      <section className="stats" aria-label="Campaign summary">
        <article className="card">
          <h2>Total visits</h2>
          <p className="stat-value">{state === "ready" ? numberFormat.format(totalVisits) : "–"}</p>
          <p>Across all your campaign links</p>
        </article>
        <article className="card">
          <h2>Campaigns</h2>
          <p className="stat-value">{state === "ready" ? numberFormat.format(campaigns.length) : "–"}</p>
          <p>Ready to connect with your audience</p>
        </article>
      </section>

      <section className="card campaigns">
        <div className="section-heading">
          <h2>Your campaigns</h2>
          <div className="heading-actions">
            <button type="button" className="ghost-button" onClick={() => void downloadBackup().catch((error) => {
              if (!handleAuth(error)) setStatus(error instanceof Error ? error.message : "Could not download the backup.")
            })}>
              Backup
            </button>
            <button type="button" className="ghost-button" onClick={() => setRestoreOpen(true)}>
              Restore
            </button>
            <button type="button" className="ghost-button" data-testid="refresh" onClick={() => void load()} disabled={state === "loading"}>
              ↻ Refresh
            </button>
          </div>
        </div>
        <p className="fine-print">
          Visits count every open of a tracking link, including repeat visits. They are not unique people.
          Place and device are recorded only for visits after scan details were added.
        </p>
        {status ? (
          <p className="form-error" role="status">
            {status}
          </p>
        ) : null}
        {state === "loading" ? <p className="muted">Loading campaigns…</p> : null}
        {state === "error" ? (
          <div className="banner" role="alert">
            <p>{loadError}</p>
            <button type="button" className="ghost-button" onClick={() => void load()}>
              Try again
            </button>
          </div>
        ) : null}
        {state === "ready" && campaigns.length === 0 ? (
          <p className="muted">No campaigns yet. Create a QR code to start counting visits.</p>
        ) : null}
        {state === "ready" && campaigns.length > 0 ? (
          <div className="campaign-list">
            <div className="campaign-row campaign-head" aria-hidden="true">
              <span>Campaign</span>
              <span>Destination</span>
              <span>Visits</span>
              <span>Actions</span>
            </div>
            {campaigns.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                onEdit={() => setEditing(campaign)}
                onDelete={() => setDeleting(campaign)}
                onError={(message) => setStatus(message)}
              />
            ))}
          </div>
        ) : null}
      </section>

      {dialog === "create" ? (
        <CampaignForm
          title="Create QR code"
          submitLabel="Create QR code"
          pendingLabel="Creating…"
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            await createCampaign(input)
            setDialog(null)
            setStatus("Campaign created. The QR code points at qr.cupspace.com.au.")
            await load()
          }}
        />
      ) : null}
      {editing ? (
        <CampaignForm
          title="Edit campaign"
          submitLabel="Save campaign"
          pendingLabel="Saving…"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (input) => {
            const updated = await updateCampaign(editing.id, input)
            setEditing(null)
            setStatus("Destination updated. The QR code and tracking URL stayed the same.")
            setCampaigns((current) => current.map((item) => (item.id === updated.id ? updated : item)))
          }}
        />
      ) : null}
      {deleting ? (
        <DeleteForm
          campaign={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await deleteCampaign(deleting.id)
            setDeleting(null)
            setStatus("Campaign deleted. Its QR code no longer redirects.")
            setCampaigns((current) => current.filter((item) => item.id !== deleting.id))
          }}
        />
      ) : null}
      {restoreOpen ? (
        <RestoreForm
          onClose={() => setRestoreOpen(false)}
          onRestored={async (next) => {
            setCampaigns(next)
            setState("ready")
            setRestoreOpen(false)
            setStatus("Backup restored.")
          }}
        />
      ) : null}
    </main>
  )
}

const CampaignRow = ({
  campaign,
  onEdit,
  onDelete,
  onError,
}: {
  campaign: CampaignView
  onEdit: () => void
  onDelete: () => void
  onError: (message: string) => void
}) => {
  const [busy, setBusy] = useState<"svg" | "png" | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const lock = useRef(false)

  const download = async (format: "svg" | "png") => {
    if (lock.current) return
    lock.current = true
    setBusy(format)
    try {
      await downloadQr(campaign, format)
    } catch (error) {
      if (!handleAuth(error)) onError(error instanceof Error ? error.message : "Could not download the QR code.")
    } finally {
      lock.current = false
      setBusy(null)
    }
  }

  return (
    <>
    <article className="campaign-row">
      <div>
        <h3>{campaign.name}</h3>
        {campaign.placeLabel ? <p className="muted">{campaign.placeLabel}</p> : null}
        <p className="tracking">
          <a href={campaign.trackingUrl}>{campaign.trackingUrl}</a>
        </p>
        <p className="muted">Created {dateFormat.format(new Date(campaign.createdAt))}</p>
      </div>
      <p className="destination">
        <a href={campaign.destination} target="_blank" rel="noreferrer noopener">
          {campaign.destination}
        </a>
      </p>
      <p className="visits" data-testid="visit-count">
        <span className="visits-label">Visits</span>
        {numberFormat.format(campaign.visits)}
      </p>
      <div className="row-actions">
        <button type="button" className="ghost-button" onClick={() => setDetailsOpen((open) => !open)}>
          {detailsOpen ? "Hide report" : "Report"}
        </button>
        <button type="button" className="ghost-button" disabled={busy !== null} onClick={() => void download("svg")}>
          {busy === "svg" ? "Downloading…" : "SVG"}
        </button>
        <button type="button" className="ghost-button" disabled={busy !== null} onClick={() => void download("png")}>
          {busy === "png" ? "Downloading…" : "PNG"}
        </button>
        <button type="button" className="ghost-button" data-testid="edit-campaign" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="danger-button" data-testid="delete-campaign" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
    {detailsOpen ? <ReportPanel campaign={campaign} onError={onError} /> : null}
    </>
  )
}

const UtmHint = ({ name, destination }: { name: string; destination: string }) => {
  const parsed = normalizeDestination(destination)
  if (!parsed.ok) return null
  const suggestion = suggestedDestination(parsed.value, name || "qr")
  if (!suggestion || suggestion === parsed.value) return null
  return (
    <div className="utm-hint">
      <p className="fine-print">
        Optional UTM link for the destination site. Copy it into the destination field and save if you want it. Nothing
        is changed until you do that, and the printed QR code stays the same.
      </p>
      <p className="tracking">{suggestion}</p>
      <button
        type="button"
        className="ghost-button"
        onClick={() => void navigator.clipboard.writeText(suggestion)}
      >
        Copy suggestion
      </button>
    </div>
  )
}

const CampaignForm = ({
  title,
  submitLabel,
  pendingLabel,
  initial,
  onClose,
  onSubmit,
}: {
  title: string
  submitLabel: string
  pendingLabel: string
  initial?: CampaignView
  onClose: () => void
  onSubmit: (input: { name: string; destination: string; placeLabel: string; timezone: string }) => Promise<void>
}) => {
  const [name, setName] = useState(initial?.name ?? "")
  const [destination, setDestination] = useState(initial?.destination ?? "")
  const [placeLabel, setPlaceLabel] = useState(initial?.placeLabel ?? "")
  const [timezone, setTimezone] = useState(campaignTimezone(initial?.timezone))
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const lock = useRef(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (lock.current) return
    const parsedName = normalizeName(name)
    const parsedDestination = normalizeDestination(destination)
    const parsedPlace = normalizePlaceLabel(placeLabel)
    if (!parsedName.ok) {
      setError(parsedName.error)
      return
    }
    if (!parsedDestination.ok) {
      setError(parsedDestination.error)
      return
    }
    if (!parsedPlace.ok) {
      setError(parsedPlace.error)
      return
    }
    if (!isCampaignTimezone(timezone)) {
      setError("Choose a campaign timezone.")
      return
    }
    lock.current = true
    setPending(true)
    setError("")
    try {
      await onSubmit({
        name: parsedName.value,
        destination: parsedDestination.value,
        placeLabel: parsedPlace.value,
        timezone,
      })
    } catch (caught) {
      if (!handleAuth(caught)) setError(caught instanceof Error ? caught.message : "Could not save the campaign.")
      lock.current = false
      setPending(false)
    }
  }

  return (
    <Dialog title={title} onClose={onClose}>
      <form onSubmit={(event) => void submit(event)}>
        <label htmlFor="campaign-name">Campaign name</label>
        <input
          id="campaign-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
          autoFocus
        />
        <label htmlFor="campaign-destination">Client destination URL</label>
        <input
          id="campaign-destination"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="client.com/offer"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          required
        />
        <p className="fine-print">https:// is added when you leave it out. Only http and https links are accepted.</p>
        <label htmlFor="campaign-place">Cafe or location label, optional</label>
        <input
          id="campaign-place"
          value={placeLabel}
          onChange={(event) => setPlaceLabel(event.target.value)}
          maxLength={80}
          placeholder="Ray White Townsville"
        />
        <p className="fine-print">
          This only names this QR code so separate codes can be compared. Each cafe still needs its own code. One
          printed code cannot tell cafes apart.
        </p>
        <label htmlFor="campaign-timezone">Timezone for reports</label>
        <select
          id="campaign-timezone"
          value={timezone}
          onChange={(event) => {
            if (isCampaignTimezone(event.target.value)) setTimezone(event.target.value)
          }}
        >
          {CAMPAIGN_TIMEZONES.map((zone) => (
            <option key={zone} value={zone}>
              {TIMEZONE_LABELS[zone]}
            </option>
          ))}
        </select>
        <p className="fine-print">
          Sydney is the default. Choose Darwin or Brisbane / Townsville when those dates and hours should ignore
          Sydney daylight saving. Saving this does not change the printed QR link.
        </p>
        <UtmHint name={name} destination={destination} />
        {initial ? (
          <p className="fine-print">
            Tracking URL <strong>{initial.trackingUrl}</strong>. Changing the destination does not change this QR code.
          </p>
        ) : null}
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="dialog-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? pendingLabel : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

const DeleteForm = ({
  campaign,
  onClose,
  onConfirm,
}: {
  campaign: CampaignView
  onClose: () => void
  onConfirm: () => Promise<void>
}) => {
  const [phrase, setPhrase] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const lock = useRef(false)
  const confirmed = phrase === "DELETE"

  const confirm = async () => {
    if (lock.current || phrase !== "DELETE") return
    lock.current = true
    setPending(true)
    setError("")
    try {
      await onConfirm()
    } catch (caught) {
      if (!handleAuth(caught)) setError(caught instanceof Error ? caught.message : "Could not delete the campaign.")
      lock.current = false
      setPending(false)
    }
  }

  return (
    <Dialog title="Delete campaign permanently?" onClose={onClose}>
      <p>
        This deletes <strong>{campaign.name}</strong>. Printed QR codes for this campaign stop working permanently.
        The visit count is removed and the tracking link no longer redirects.
      </p>
      <label htmlFor="delete-confirm">Type DELETE to confirm</label>
      <input
        id="delete-confirm"
        data-testid="delete-confirm"
        value={phrase}
        onChange={(event) => setPhrase(event.target.value)}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="off"
      />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="dialog-actions">
        <button type="button" className="ghost-button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="danger-button"
          data-testid="confirm-delete"
          disabled={!confirmed || pending}
          onClick={() => void confirm()}
        >
          {pending ? "Deleting…" : "Delete permanently"}
        </button>
      </div>
    </Dialog>
  )
}

const RestoreForm = ({
  onClose,
  onRestored,
}: {
  onClose: () => void
  onRestored: (campaigns: CampaignView[]) => Promise<void>
}) => {
  const [phrase, setPhrase] = useState("")
  const [records, setRecords] = useState<unknown[] | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const lock = useRef(false)

  const readFile = async (file: File | undefined) => {
    setError("")
    setRecords(null)
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as { campaigns?: unknown }
      if (!parsed || !Array.isArray(parsed.campaigns)) {
        setError("Choose a CupSpace QR backup file.")
        return
      }
      setRecords(parsed.campaigns)
    } catch {
      setError("That file is not valid JSON.")
    }
  }

  const restore = async () => {
    if (lock.current || !records || phrase !== "REPLACE ALL CAMPAIGNS") return
    lock.current = true
    setPending(true)
    setError("")
    try {
      const campaigns = await restoreBackup(records)
      await onRestored(campaigns)
    } catch (caught) {
      if (!handleAuth(caught)) setError(caught instanceof Error ? caught.message : "Could not restore the backup.")
      lock.current = false
      setPending(false)
    }
  }

  return (
    <Dialog title="Restore backup?" onClose={onClose}>
      <p>
        Restoring replaces every campaign and visit count with the file you choose. QR codes that are not in the file
        stop working.
      </p>
      <label htmlFor="backup-file">Backup file</label>
      <input
        id="backup-file"
        type="file"
        accept="application/json,.json"
        onChange={(event) => void readFile(event.target.files?.[0])}
      />
      <label htmlFor="restore-phrase">Type REPLACE ALL CAMPAIGNS to confirm</label>
      <input
        id="restore-phrase"
        value={phrase}
        onChange={(event) => setPhrase(event.target.value)}
        autoCapitalize="characters"
        autoCorrect="off"
      />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="dialog-actions">
        <button type="button" className="ghost-button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="danger-button"
          disabled={pending || phrase !== "REPLACE ALL CAMPAIGNS" || !records}
          onClick={() => void restore()}
        >
          {pending ? "Restoring…" : "Restore backup"}
        </button>
      </div>
    </Dialog>
  )
}
