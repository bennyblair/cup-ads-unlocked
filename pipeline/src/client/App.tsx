import { useCallback, useEffect, useState } from "react"

import type { ActionTab, DashboardPayload, DashboardRequest } from "../shared/model"
import { formatWhen } from "../shared/timezone"
import { Actions } from "./Actions"
import { AuthError, loadDashboard, logout } from "./api"
import { Board } from "./Board"
import { BrandHeader } from "./Brand"
import { Drawer } from "./Drawer"
import { Overview } from "./Overview"
import { Requests } from "./Requests"

type View = "overview" | "board" | "actions" | "requests"

const VIEWS: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "board", label: "Board" },
  { id: "actions", label: "Actions" },
  { id: "requests", label: "Requests" },
]

export const App = () => {
  const [view, setView] = useState<View>("overview")
  const [tab, setTab] = useState<ActionTab>("Call")
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async (refresh = false) => {
    setRefreshing(refresh)
    setError("")
    try {
      setData(await loadDashboard(refresh))
    } catch (caught) {
      if (caught instanceof AuthError) {
        window.location.assign("/login")
        return
      }
      setError(caught instanceof Error ? caught.message : "The pipeline could not be loaded.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load(false)
    }, 0)
    return () => window.clearTimeout(handle)
  }, [load])

  const onCreated = (request: DashboardRequest) => {
    setData((current) =>
      current
        ? { ...current, requests: [request, ...current.requests.filter((row) => row.id !== request.id)] }
        : current,
    )
  }

  const signOut = async () => {
    try {
      await logout()
    } finally {
      window.location.assign("/login")
    }
  }

  const selected = data?.leads.find((lead) => lead.id === selectedId) ?? null
  const freshRequests = data?.requests.filter((request) => request.status === "New").length ?? 0

  return (
    <main className="shell">
      <BrandHeader
        onSignOut={() => void signOut()}
        onRefresh={() => void load(true)}
        refreshing={refreshing}
        syncedLabel={data ? `Last synced ${formatWhen(data.syncedAt)} Sydney` : undefined}
      />
      {data?.mode === "example" ? (
        <p className="example-banner" data-testid="example-banner" role="status">
          <strong>Example data.</strong> These leads are invented for this preview. Nothing here is a real
          lead, and nothing is written to Notion.
        </p>
      ) : null}
      {data?.warning ? (
        <p className="warning-banner" role="status">
          {data.warning}
        </p>
      ) : null}
      {error ? (
        <p className="error-banner" role="alert">
          {error}{" "}
          <button type="button" className="text-button" onClick={() => void load(true)}>
            Try again
          </button>
        </p>
      ) : null}
      <nav className="views" aria-label="Dashboard">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={view === item.id ? "page" : undefined}
            data-testid={`nav-${item.id}`}
            onClick={() => setView(item.id)}
          >
            {item.label}
            {item.id === "requests" && freshRequests > 0 ? <span>{freshRequests}</span> : null}
          </button>
        ))}
      </nav>
      {loading && !data ? <p className="loading-page">Loading the pipeline…</p> : null}
      {!loading && !data ? (
        <section className="empty-state">
          <h1>The pipeline is not available.</h1>
          <button type="button" className="primary-button" onClick={() => void load(true)}>
            Try again
          </button>
        </section>
      ) : null}
      {data && view === "overview" ? (
        <Overview
          data={data}
          onCreated={onCreated}
          onOpen={(next, nextTab) => {
            if (nextTab) setTab(nextTab)
            setView(next)
          }}
        />
      ) : null}
      {data && view === "board" ? (
        <Board leads={data.leads} today={data.overview.today} onOpen={(lead) => setSelectedId(lead.id)} />
      ) : null}
      {data && view === "actions" ? (
        <Actions
          leads={data.leads}
          today={data.overview.today}
          tab={tab}
          onTab={setTab}
          onOpen={(lead) => setSelectedId(lead.id)}
        />
      ) : null}
      {data && view === "requests" ? (
        <Requests requests={data.requests} leads={data.leads} mode={data.mode} onCreated={onCreated} />
      ) : null}
      {data && selected ? (
        <Drawer
          lead={selected}
          today={data.overview.today}
          mode={data.mode}
          onClose={() => setSelectedId(null)}
          onCreated={onCreated}
        />
      ) : null}
    </main>
  )
}
