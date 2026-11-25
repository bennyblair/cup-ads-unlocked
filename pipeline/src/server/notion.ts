import {
  DATA_SOURCES,
  NOTION_VERSION,
  buildRequestCreateBody,
  mapLead,
  mapRequest,
  mapSendStat,
  type RequestDraft,
} from "../shared/notion-map"
import type { DashboardRequest, Lead, SendStat } from "../shared/model"

const NOTION_ORIGIN = "https://api.notion.com"

export class NotionError extends Error {
  status: number

  constructor(status: number) {
    super("Notion request failed.")
    this.name = "NotionError"
    this.status = status
  }
}

type QueryPage = {
  results?: unknown
  has_more?: unknown
  next_cursor?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export type NotionCaller = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export const createNotionClient = (token: string, fetchImpl: NotionCaller = fetch) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  }

  const request = async (path: string, body: unknown) => {
    let response: Response
    try {
      response = await fetchImpl(`${NOTION_ORIGIN}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })
    } catch {
      throw new NotionError(0)
    }
    if (!response.ok) throw new NotionError(response.status)
    try {
      return (await response.json()) as unknown
    } catch {
      throw new NotionError(response.status)
    }
  }

  const queryAll = async (dataSourceId: string) => {
    const pages: unknown[] = []
    const seen = new Set<string>()
    let cursor = ""
    for (let page = 0; page < 100; page += 1) {
      const body: { page_size: number; start_cursor?: string } = { page_size: 100 }
      if (cursor) body.start_cursor = cursor
      const payload = await request(`/v1/data_sources/${dataSourceId}/query`, body)
      if (!isRecord(payload)) throw new NotionError(502)
      const parsed = payload as QueryPage
      if (!Array.isArray(parsed.results)) throw new NotionError(502)
      pages.push(...parsed.results)
      const next = typeof parsed.next_cursor === "string" ? parsed.next_cursor : ""
      if (parsed.has_more !== true || !next || seen.has(next)) break
      seen.add(next)
      cursor = next
    }
    return pages
  }

  return {
    async leads(): Promise<Lead[]> {
      const pages = await queryAll(DATA_SOURCES.pipeline)
      return pages.flatMap((page) => {
        const lead = mapLead(page)
        return lead ? [lead] : []
      })
    },
    async stats(): Promise<SendStat[]> {
      const pages = await queryAll(DATA_SOURCES.sendStats)
      return pages.flatMap((page) => {
        const stat = mapSendStat(page)
        return stat ? [stat] : []
      })
    },
    async requests(): Promise<DashboardRequest[]> {
      const pages = await queryAll(DATA_SOURCES.requests)
      return pages.flatMap((page) => {
        const row = mapRequest(page)
        return row ? [row] : []
      })
    },
    async createRequest(draft: RequestDraft): Promise<DashboardRequest> {
      const payload = await request("/v1/pages", buildRequestCreateBody(draft))
      const row = mapRequest(payload)
      if (!row) throw new NotionError(502)
      return row
    },
  }
}

export type NotionClient = ReturnType<typeof createNotionClient>
