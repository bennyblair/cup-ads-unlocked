import { type FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  Coffee,
  EyeOff,
  Loader2,
  LockKeyhole,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  developmentAdminPin,
  getAdminCafeApplications,
  updateCafeApplication,
} from "@/lib/cafe-api"
import type {
  AdminCafesResponse,
  CafeApplicationRecord,
} from "@/types/cafes"

type PageState = "locked" | "loading" | "ready" | "error"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

const CafeDetails = ({ record }: { record: CafeApplicationRecord }) => {
  const details = record.privateDetails

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-bold text-primary">{details.cafeName}</h3>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {record.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Submitted {formatDate(record.createdAt)}
        </p>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-primary">Contact</dt>
            <dd className="mt-1 text-muted-foreground">
              {details.firstName} {details.lastName}
              <br />
              <a className="hover:text-primary" href={`mailto:${details.email}`}>
                {details.email}
              </a>
              <br />
              <a className="hover:text-primary" href={`tel:${details.phone}`}>
                {details.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-primary">Private address</dt>
            <dd className="mt-1 text-muted-foreground">
              {details.address}
              <br />
              {details.suburb} {details.state} {details.postcode}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-primary">Operations</dt>
            <dd className="mt-1 text-muted-foreground">
              Daily cups: {details.dailyCups || "Not supplied"}
              <br />
              Hours: {details.openHours || "Not supplied"}
              <br />
              Timeline: {details.timeline || "Not supplied"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-primary">Exact private pin</dt>
            <dd className="mt-1 font-mono text-xs text-muted-foreground">
              {details.exactCoordinates[1].toFixed(6)},{" "}
              {details.exactCoordinates[0].toFixed(6)}
            </dd>
          </div>
        </dl>

        {(details.goals || details.customerBase) && (
          <div className="mt-5 space-y-3 text-sm">
            {details.customerBase && (
              <p>
                <strong className="text-primary">Customers:</strong>{" "}
                <span className="text-muted-foreground">
                  {details.customerBase}
                </span>
              </p>
            )}
            {details.goals && (
              <p>
                <strong className="text-primary">Goals:</strong>{" "}
                <span className="text-muted-foreground">{details.goals}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          <EyeOff className="h-4 w-4" />
          Public preview
        </div>
        <p className="mt-3 font-bold text-primary">
          {record.publicLocation.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {record.publicLocation.address}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The public coordinates are automatically offset. No private café or
          contact fields are returned by the map API.
        </p>
      </div>
    </div>
  )
}

const AdminCafes = () => {
  const [pin, setPin] = useState("")
  const [pageState, setPageState] = useState<PageState>("locked")
  const [applications, setApplications] = useState<AdminCafesResponse>({
    pending: [],
    approved: [],
  })
  const [error, setError] = useState("")
  const [activeRecord, setActiveRecord] = useState("")

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Café Approvals | CupSpace"

    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousRobots = robots?.content
    if (robots) {
      robots.content = "noindex, nofollow"
    }

    return () => {
      if (robots && previousRobots) {
        robots.content = previousRobots
      }
    }
  }, [])

  const loadApplications = async (adminPin: string) => {
    setPageState("loading")
    setError("")

    try {
      setApplications(await getAdminCafeApplications(adminPin))
      setPageState("ready")
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load café applications.",
      )
      setPageState("error")
    }
  }

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loadApplications(pin)
  }

  const handleAction = async (
    record: CafeApplicationRecord,
    action: "approve" | "reject" | "unpublish",
  ) => {
    setActiveRecord(record.id)
    setError("")

    try {
      await updateCafeApplication({ id: record.id, action, pin })
      await loadApplications(pin)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update this café.",
      )
      setPageState("ready")
    } finally {
      setActiveRecord("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container-custom py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center text-sm font-semibold text-primary transition hover:text-accent sm:text-base"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <div className="flex items-center">
            <Coffee className="mr-2 h-7 w-7 text-accent sm:h-8 sm:w-8" />
            <span className="text-xl font-bold text-primary sm:text-2xl">
              CupSpace Admin
            </span>
          </div>
        </div>
      </header>

      <main className="container-custom pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="section-subtitle">Private operations</p>
            <h1 className="heading-section mt-2 text-left">Café approvals</h1>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              Review private applications before publishing anonymous green
              markers. This page is deliberately not linked from the website.
            </p>
          </div>

          {pageState !== "ready" && (
            <Card className="mx-auto max-w-lg border-0 p-6 shadow-elegant sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <LockKeyhole className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    Admin access
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the private Netlify admin PIN.
                  </p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
                <div>
                  <Label htmlFor="adminPin">Admin PIN</Label>
                  <Input
                    id="adminPin"
                    type="password"
                    autoComplete="current-password"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
                {import.meta.env.DEV && (
                  <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                    Local preview PIN: <code>{developmentAdminPin}</code>
                  </p>
                )}
                {error && (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={pageState === "loading"}>
                  {pageState === "loading" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Unlock approvals
                </Button>
              </form>
            </Card>
          )}

          {pageState === "ready" && (
            <div className="space-y-10">
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      Pending ({applications.pending.length})
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Approving publishes only the anonymous public preview.
                    </p>
                  </div>
                  <Link
                    to="/locations"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
                  >
                    <MapPin className="h-4 w-4" />
                    View public map
                  </Link>
                </div>

                {applications.pending.length === 0 ? (
                  <Card className="border border-dashed border-border p-8 text-center text-muted-foreground shadow-none">
                    No cafés are waiting for approval.
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.pending.map((record) => (
                      <Card key={record.id} className="border-0 p-6 shadow-elegant">
                        <CafeDetails record={record} />
                        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                            disabled={activeRecord === record.id}
                            onClick={() => handleAction(record, "reject")}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            type="button"
                            className="gap-2"
                            disabled={activeRecord === record.id}
                            onClick={() => handleAction(record, "approve")}
                          >
                            {activeRecord === record.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Approve anonymous marker
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary">
                  Published ({applications.approved.length})
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  These cafés currently appear as anonymous green markers.
                </p>

                {applications.approved.length === 0 ? (
                  <Card className="border border-dashed border-border p-8 text-center text-muted-foreground shadow-none">
                    No anonymous café markers are published yet.
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.approved.map((record) => (
                      <Card key={record.id} className="border-0 p-6 shadow-elegant">
                        <CafeDetails record={record} />
                        <div className="mt-6 flex justify-end border-t border-border pt-5">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            disabled={activeRecord === record.id}
                            onClick={() => handleAction(record, "unpublish")}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Return to pending
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {error && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminCafes
