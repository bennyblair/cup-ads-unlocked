import type { DashboardMode, DashboardPayload, DashboardRequest, Lead, SendStat } from "../shared/model"
import { buildOverview } from "../shared/overview"
import { exampleSnapshot } from "./fixtures"
import { createNotionClient, NotionError, type NotionCaller } from "./notion"
import { sydneyIso, todayInSydney } from "../shared/timezone"

export class DashboardError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "DashboardError"
    this.status = status
  }
}

type LoadedRows = {
  mode: DashboardMode
  leads: Lead[]
  stats: SendStat[]
  requests: DashboardRequest[]
}

export type DashboardSource = {
  mode: DashboardMode
  load(): Promise<LoadedRows>
  createRequest(input: { instruction: string; leadId?: string; submittedAt: string }): Promise<DashboardRequest>
}

const bySubmitted = (rows: DashboardRequest[]) =>
  [...rows].sort((left, right) => {
    if (left.submittedAt === right.submittedAt) return left.instruction.localeCompare(right.instruction, "en-AU")
    return left.submittedAt < right.submittedAt ? 1 : -1
  })

export const createExampleSource = (now: () => Date = () => new Date()): DashboardSource => {
  const extra: DashboardRequest[] = []
  return {
    mode: "example",
    async load() {
      const snapshot = exampleSnapshot(todayInSydney(now()))
      return {
        mode: "example",
        leads: snapshot.leads,
        stats: snapshot.stats,
        requests: bySubmitted([...extra, ...snapshot.requests]),
      }
    },
    async createRequest(input) {
      const row: DashboardRequest = {
        id: crypto.randomUUID(),
        instruction: input.instruction,
        leadId: input.leadId ?? "",
        status: "New",
        submittedAt: input.submittedAt,
        botResponse: "",
        completedAt: "",
      }
      extra.unshift(row)
      return row
    },
  }
}

export const createNotionSource = (token: string, fetchImpl?: NotionCaller): DashboardSource => {
  const client = createNotionClient(token, fetchImpl)
  return {
    mode: "live",
    async load() {
      const [leads, stats, requests] = await Promise.all([client.leads(), client.stats(), client.requests()])
      return { mode: "live", leads, stats, requests: bySubmitted(requests) }
    },
    createRequest(input) {
      return client.createRequest(input)
    },
  }
}

const STALE_MS = 15 * 60 * 1000

export const createDashboard = (source: DashboardSource, ttlMs = 60_000) => {
  let cache: { at: number; rows: LoadedRows } | null = null

  const load = async (now: Date, refresh: boolean) => {
    const at = now.getTime()
    if (!refresh && cache && at - cache.at < ttlMs) {
      return { entry: cache, stale: false, warning: null as string | null }
    }
    try {
      const rows = await source.load()
      cache = { at, rows }
      return { entry: cache, stale: false, warning: null }
    } catch (error) {
      if (cache && at - cache.at < STALE_MS) {
        const warning =
          error instanceof NotionError && error.status === 429
            ? "Notion is rate limiting reads. Showing the last sync."
            : "Notion could not be refreshed. Showing the last sync."
        return { entry: cache, stale: true, warning }
      }
      throw error
    }
  }

  const present = (
    entry: { at: number; rows: LoadedRows },
    now: Date,
    stale: boolean,
    warning: string | null,
  ): DashboardPayload => ({
    mode: entry.rows.mode,
    syncedAt: new Date(entry.at).toISOString(),
    stale,
    warning,
    leads: entry.rows.leads,
    requests: entry.rows.requests,
    overview: buildOverview(entry.rows.leads, entry.rows.stats, now),
  })

  return {
    async get(now = new Date(), options?: { refresh?: boolean }) {
      const loaded = await load(now, options?.refresh ?? false)
      return present(loaded.entry, now, loaded.stale, loaded.warning)
    },
    async createRequest(input: { instruction: string; leadId?: string }, now = new Date()) {
      const loaded = await load(now, false)
      if (input.leadId && !loaded.entry.rows.leads.some((lead) => lead.id === input.leadId)) {
        throw new DashboardError("That lead is not on the board.", 404)
      }
      const request = await source.createRequest({
        instruction: input.instruction,
        leadId: input.leadId,
        submittedAt: sydneyIso(now),
      })
      if (cache) {
        cache.rows = {
          ...cache.rows,
          requests: bySubmitted([request, ...cache.rows.requests.filter((row) => row.id !== request.id)]),
        }
      }
      return { request, mode: loaded.entry.rows.mode }
    },
  }
}

export type DashboardService = ReturnType<typeof createDashboard>
