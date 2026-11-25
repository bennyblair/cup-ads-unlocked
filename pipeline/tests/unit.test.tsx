import React from "react"
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

import { renderToStaticMarkup } from "react-dom/server"

import { Actions } from "../src/client/Actions"
import { LeadCard } from "../src/client/Board"
import { Drawer } from "../src/client/Drawer"
import { RequestCard } from "../src/client/Requests"
import { createDashboard, createExampleSource, type DashboardSource } from "../src/server/dashboard"
import { NotionError, createNotionClient } from "../src/server/notion"
import { createLoginLimiter, handleApi, type AppDependencies } from "../src/server/http"
import { decideGate } from "../src/shared/gate"
import { mailHref, telHref } from "../src/shared/links"
import { actionLeads, filterLeads, sortByDue, stageColumns } from "../src/shared/leads"
import { emptyLead, type Lead } from "../src/shared/model"
import {
  DATA_SOURCES,
  buildRequestCreateBody,
  mapLead,
  mapRequest,
  mapSendStat,
} from "../src/shared/notion-map"
import { buildOverview, formatRate } from "../src/shared/overview"
import { hasValidSession, issueSessionToken, passwordMatches } from "../src/shared/session"
import { calendarDay, inWindow, sydneyIso, todayInSydney } from "../src/shared/timezone"

const PASSWORD = "pipeline-test-password"
const SECRET = "pipeline-test-session-secret-32b"
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const NOW = new Date("2026-11-25T00:30:00.000Z")

const lead = (partial: Partial<Lead> & Pick<Lead, "id" | "name">): Lead => ({
  ...emptyLead(partial.id, partial.name),
  ...partial,
})

const app = (overrides: Partial<AppDependencies> = {}): AppDependencies => ({
  password: PASSWORD,
  sessionSecret: SECRET,
  limiter: createLoginLimiter(),
  dashboard: createDashboard(createExampleSource(() => NOW)),
  now: () => NOW,
  ...overrides,
})

const api = (deps: AppDependencies, path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  if (!headers.has("origin")) headers.set("origin", "http://127.0.0.1")
  headers.set("x-cupspace-pipeline", "1")
  return handleApi(new Request(`http://127.0.0.1${path}`, { ...init, headers }), deps)
}

const cookieHeader = (response: Response) => {
  const cookie = response.headers.getSetCookie()[0]
  assert.ok(cookie)
  return cookie
}

const signIn = async (deps: AppDependencies) => {
  const response = await api(deps, "/api/login", {
    method: "POST",
    body: JSON.stringify({ password: PASSWORD }),
  })
  assert.equal(response.status, 200)
  return cookieHeader(response).split(";")[0]
}

describe("signed-out requests", () => {
  it("returns 401 for every pipeline API and keeps lead data out of the body", async () => {
    const deps = app()
    for (const path of ["/api/dashboard", "/api/requests", "/api/anything"]) {
      const response = await api(deps, path)
      assert.equal(response.status, 401)
      const body = await response.json()
      assert.equal(body.error, "Sign in required.")
      assert.equal(JSON.stringify(body).includes("Harbour"), false)
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow")
    }
    const posted = await api(deps, "/api/requests", {
      method: "POST",
      body: JSON.stringify({ instruction: "Email them now" }),
    })
    assert.equal(posted.status, 401)
  })

  it("issues an HttpOnly cookie and then opens the dashboard", async () => {
    const deps = app()
    const denied = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "wrong-password" }),
    })
    assert.equal(denied.status, 401)

    const httpLogin = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: PASSWORD }),
    })
    const httpCookie = cookieHeader(httpLogin)
    assert.match(httpCookie, /cupspace_pipeline_session=/)
    assert.match(httpCookie, /HttpOnly/)
    assert.equal(httpCookie.includes("Secure"), false)

    const secure = await handleApi(
      new Request("https://pipeline.cupspace.com.au/api/login", {
        method: "POST",
        headers: { origin: "https://pipeline.cupspace.com.au", "content-type": "application/json" },
        body: JSON.stringify({ password: PASSWORD }),
      }),
      deps,
    )
    assert.match(cookieHeader(secure), /Secure/)

    const session = httpCookie.split(";")[0]
    const dashboard = await api(deps, "/api/dashboard", { headers: { cookie: session } })
    assert.equal(dashboard.status, 200)
    const payload = await dashboard.json()
    assert.equal(payload.mode, "example")
    assert.equal(payload.overview.timezone, "Australia/Sydney")
    assert.equal(JSON.stringify(payload).includes("api.notion.com"), false)
    assert.equal(JSON.stringify(payload).includes(DATA_SOURCES.pipeline), false)
  })

  it("rate limits repeated password failures", async () => {
    const deps = app({ limiter: createLoginLimiter({ limit: 2, windowMs: 60_000 }) })
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await api(deps, "/api/login", {
        method: "POST",
        body: JSON.stringify({ password: "wrong-password" }),
      })
      assert.equal(response.status, 401)
    }
    const blocked = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: PASSWORD }),
    })
    assert.equal(blocked.status, 429)
  })

  it("rejects a tampered session and a rotated password", async () => {
    const token = await issueSessionToken(SECRET, PASSWORD)
    const request = new Request("https://pipeline.cupspace.com.au/", {
      headers: { cookie: `cupspace_pipeline_session=${token}` },
    })
    assert.equal(await hasValidSession(request, SECRET, PASSWORD), true)
    assert.equal(await hasValidSession(request, SECRET, `${PASSWORD}-rotated`), false)
    const tampered = new Request("https://pipeline.cupspace.com.au/", {
      headers: { cookie: `cupspace_pipeline_session=${token.slice(0, -2)}aa` },
    })
    assert.equal(await hasValidSession(tampered, SECRET, PASSWORD), false)
    assert.equal(await passwordMatches(PASSWORD, PASSWORD), true)
    assert.equal(await passwordMatches("nope-nope", PASSWORD), false)
    assert.deepEqual(decideGate({ method: "GET", pathname: "/api/dashboard", authenticated: false }), {
      type: "unauthorized",
    })
    assert.deepEqual(decideGate({ method: "GET", pathname: "/", authenticated: false }), {
      type: "redirect",
      to: "/login",
    })
    assert.equal(decideGate({ method: "GET", pathname: "/favicon.svg", authenticated: false }).type, "next")
  })
})

describe("Notion mapping", () => {
  const page = {
    object: "page",
    id: "AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE",
    properties: {
      Name: { type: "title", title: [{ plain_text: "Mira <script>alert(1)</script>" }] },
      Business: { type: "rich_text", rich_text: [{ plain_text: "Harbour" }, { plain_text: " & Rye" }] },
      Role: { type: "rich_text", rich_text: [{ plain_text: "Owner" }] },
      Email: { type: "email", email: "mira@example.com" },
      "Phone (mobile)": { type: "phone_number", phone_number: "0412 555 014" },
      "Area/suburb": { type: "rich_text", rich_text: [{ plain_text: "Surry Hills" }] },
      State: { type: "select", select: { name: "NSW" } },
      Sector: { type: "rich_text", rich_text: [{ plain_text: "Cafe" }] },
      "CupSpace inbox": { type: "select", select: { name: "info@cupspace.com.au" } },
      Persona: { type: "select", select: null },
      Stage: { type: "select", select: { name: "Warm intro" } },
      "Next action": { type: "select", select: { name: "Reply" } },
      "Waiting on": { type: "select", select: { name: "Us" } },
      "Next action due": { type: "date", date: { start: "2026-11-24T14:00:00.000Z" } },
      "Last inbound date": { type: "date", date: null },
      "Last outbound date": { type: "date", date: { start: "2026-11-20" } },
      "Last contact by": { type: "rich_text", rich_text: [{ plain_text: "Mira" }] },
      "Thread subject": { type: "rich_text", rich_text: [{ plain_text: "Re: cups" }] },
      "Latest summary": { type: "rich_text", rich_text: [{ plain_text: "Asked for pricing." }] },
      "Value/package": { type: "rich_text", rich_text: [] },
      Notes: { type: "rich_text", rich_text: [{ plain_text: "Keep" }] },
      "Source message id/UID": { type: "rich_text", rich_text: [{ plain_text: "uid-1" }] },
      "Sync key": { type: "rich_text", rich_text: [{ plain_text: "sync-1" }] },
      Secret: { type: "rich_text", rich_text: [{ plain_text: "do-not-leak-this-token" }] },
    },
  }

  it("maps known fields, keeps unknown selects, and drops everything else", () => {
    const mapped = mapLead(page)
    assert.ok(mapped)
    assert.equal(mapped.name, "Mira <script>alert(1)</script>")
    assert.equal(mapped.business, "Harbour & Rye")
    assert.equal(mapped.stage, "Warm intro")
    assert.equal(mapped.persona, "")
    assert.equal(mapped.email, "mira@example.com")
    assert.equal(mapped.phone, "0412 555 014")
    assert.equal(mapped.nextActionDue, "2026-11-24T14:00:00.000Z")
    assert.equal(mapped.lastInbound, "")
    assert.equal(JSON.stringify(mapped).includes("do-not-leak-this-token"), false)
    assert.equal(mapLead({ object: "data_source", id: page.id }), null)

    const stat = mapSendStat({
      object: "page",
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      properties: {
        Key: { title: [{ plain_text: "2026-11-25 info@cupspace.com.au" }] },
        Date: { date: { start: "2026-11-24T14:00:00.000Z" } },
        Inbox: { select: { name: "not-a-known-inbox@example.com" } },
        "Sent count": { number: 4 },
        Bounces: { number: null },
        Replies: { number: Number.NaN },
      },
    })
    assert.deepEqual(stat && { inbox: stat.inbox, sent: stat.sent, bounces: stat.bounces, replies: stat.replies }, {
      inbox: "not-a-known-inbox@example.com",
      sent: 4,
      bounces: 0,
      replies: 0,
    })

    const request = mapRequest({
      object: "page",
      id: "dddddddddddddddddddddddddddddddd",
      properties: {
        Instruction: { title: [{ plain_text: "Draft only" }] },
        Lead: { relation: [{ id: "aaaaaaaabbbb4ccc8dddeeeeeeeeeeee" }] },
        Status: { select: { name: "Needs a human" } },
        "Submitted at": { date: { start: "2026-11-25T18:47:00+11:00" } },
        "Bot response": { rich_text: [{ plain_text: "Waiting" }] },
        "Completed at": { date: null },
      },
    })
    assert.equal(request?.leadId, "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")
    assert.equal(request?.status, "Needs a human")
    assert.equal(request?.botResponse, "Waiting")
  })
})

describe("request creation payload", () => {
  it("files a New request and never includes stage or email fields", () => {
    const withLead = buildRequestCreateBody({
      instruction: "Send the cafe pack pricing",
      leadId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      submittedAt: "2026-11-25T18:47:00+11:00",
    })
    assert.deepEqual(withLead, {
      parent: { type: "data_source_id", data_source_id: DATA_SOURCES.requests },
      properties: {
        Instruction: { title: [{ type: "text", text: { content: "Send the cafe pack pricing" } }] },
        Status: { select: { name: "New" } },
        "Submitted at": { date: { start: "2026-11-25T18:47:00+11:00" } },
        Lead: { relation: [{ id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" }] },
      },
    })
    const global = buildRequestCreateBody({
      instruction: "Pause info@ until Friday",
      submittedAt: "2026-11-25T18:47:00+11:00",
    })
    assert.equal("Lead" in global.properties, false)
    assert.equal(JSON.stringify(global).includes("Stage"), false)
    assert.equal(JSON.stringify(global).includes("Email"), false)
    assert.equal(global.parent.data_source_id, DATA_SOURCES.requests)
  })

  it("posts the payload to Notion and returns only the mapped request", async () => {
    const calls: { url: string; body: string; headers: Headers }[] = []
    const created = {
      object: "page",
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      properties: {
        Instruction: { title: [{ plain_text: "Send the cafe pack pricing" }] },
        Status: { select: { name: "New" } },
        "Submitted at": { date: { start: "2026-11-25T18:47:00+11:00" } },
        Lead: { relation: [{ id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" }] },
        "Bot response": { rich_text: [] },
        "Completed at": { date: null },
      },
    }
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), body: String(init?.body ?? ""), headers: new Headers(init?.headers) })
      if (String(url).endsWith("/pages")) return Response.json(created)
      return new Response(JSON.stringify({ message: "secret-token-value" }), { status: 401 })
    }
    const client = createNotionClient("secret-token-value", fetchImpl)
    await assert.rejects(
      () => client.leads(),
      (error: unknown) => error instanceof NotionError && error.status === 401 && !error.message.includes("secret-token"),
    )
    const row = await client.createRequest({
      instruction: "Send the cafe pack pricing",
      leadId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      submittedAt: "2026-11-25T18:47:00+11:00",
    })
    const sent = calls.at(-1)
    assert.ok(sent)
    assert.equal(sent.url, "https://api.notion.com/v1/pages")
    assert.equal(sent.headers.get("Notion-Version"), "2025-09-03")
    assert.equal(sent.headers.get("Authorization"), "Bearer secret-token-value")
    assert.deepEqual(
      JSON.parse(sent.body),
      buildRequestCreateBody({
        instruction: "Send the cafe pack pricing",
        leadId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        submittedAt: "2026-11-25T18:47:00+11:00",
      }),
    )
    assert.equal(row.status, "New")
    assert.equal(JSON.stringify(row).includes("secret-token-value"), false)
  })
})

describe("Notion pagination", () => {
  it("follows next_cursor and stops when the cursor repeats", async () => {
    const cursors: Array<string | undefined> = []
    const page = (id: string, name: string) => ({
      object: "page",
      id,
      properties: { Name: { title: [{ plain_text: name }] } },
    })
    let query = 0
    const fetchImpl: typeof fetch = async (url, init) => {
      assert.equal(String(url), `https://api.notion.com/v1/data_sources/${DATA_SOURCES.pipeline}/query`)
      assert.equal(new Headers(init?.headers).get("Notion-Version"), "2025-09-03")
      assert.equal(init?.method, "POST")
      const body = JSON.parse(String(init?.body)) as { page_size?: number; start_cursor?: string }
      assert.equal(body.page_size, 100)
      cursors.push(body.start_cursor)
      query += 1
      if (query === 1) {
        return Response.json({
          results: [page("11111111-1111-4111-8111-111111111111", "One")],
          has_more: true,
          next_cursor: "cursor-2",
        })
      }
      if (query === 2) {
        return Response.json({
          results: [page("22222222-2222-4222-8222-222222222222", "Two")],
          has_more: true,
          next_cursor: "cursor-2",
        })
      }
      throw new Error("pagination did not stop")
    }
    const leads = await createNotionClient("token", fetchImpl).leads()
    assert.deepEqual(cursors, [undefined, "cursor-2"])
    assert.deepEqual(leads.map((item) => item.name), ["One", "Two"])
  })
})

describe("timezone bucketing", () => {
  it("keeps date-only values and moves timestamps onto the Sydney day", () => {
    assert.equal(todayInSydney(NOW), "2026-11-25")
    assert.equal(calendarDay("2026-11-25"), "2026-11-25")
    assert.equal(calendarDay("2026-11-24T14:00:00.000Z"), "2026-11-25")
    assert.equal(calendarDay("2026-11-24T12:00:00.000Z"), "2026-11-24")
    assert.equal(calendarDay("2026-07-15T14:30:00.000Z"), "2026-07-16")
    assert.equal(calendarDay("2026-07-15T13:30:00.000Z"), "2026-07-15")
    assert.equal(sydneyIso(NOW), "2026-11-25T11:30:00+11:00")
    assert.equal(inWindow("2026-11-19", "2026-11-25", 7), true)
    assert.equal(inWindow("2026-11-18", "2026-11-25", 7), false)
    assert.equal(inWindow("2026-10-27", "2026-11-25", 30), true)
    assert.equal(inWindow("2026-10-26", "2026-11-25", 30), false)
  })

  it("counts due work and inbox totals on Sydney days", () => {
    const leads = [
      lead({ id: "1", name: "Us", waitingOn: "Us", stage: "Replied", nextAction: "Reply" }),
      lead({ id: "2", name: "Call due", stage: "Call needed", nextAction: "Call", nextActionDue: "2026-11-24T14:00:00.000Z" }),
      lead({ id: "3", name: "Call later", stage: "Interested", nextAction: "Call", nextActionDue: "2026-11-30" }),
      lead({ id: "4", name: "Price", stage: "Needs pricing", nextAction: "Send pricing", nextActionDue: "2026-12-01" }),
      lead({ id: "5", name: "Follow", stage: "Cold sent", nextAction: "Follow up", nextActionDue: "2026-11-25" }),
      lead({ id: "6", name: "Held", stage: "Hold", nextAction: "Call", waitingOn: "Us", nextActionDue: "2026-11-20" }),
      lead({ id: "7", name: "Lost", stage: "Lost/Declined", nextAction: "Reply", waitingOn: "Us" }),
      lead({ id: "8", name: "Live", stage: "Active campaign", nextAction: "None" }),
      lead({ id: "9", name: "Won", stage: "Won", nextAction: "Follow up", nextActionDue: "2026-11-01" }),
    ]
    const overview = buildOverview(
      leads,
      [
        { id: "s1", key: "midnight", date: "2026-11-24T14:00:00.000Z", inbox: "info@cupspace.com.au", sent: 4, bounces: 1, replies: 1 },
        { id: "s2", key: "previous", date: "2026-11-24T12:00:00.000Z", inbox: "info@cupspace.com.au", sent: 2, bounces: 0, replies: 0 },
        { id: "s3", key: "old", date: "2026-10-26", inbox: "info@cupspace.com.au", sent: 9, bounces: 0, replies: 0 },
        { id: "s4", key: "edge", date: "2026-10-27", inbox: "extra@example.com", sent: 3, bounces: 0, replies: 1 },
      ],
      NOW,
    )
    assert.equal(overview.counts.waitingOnUs, 1)
    assert.equal(overview.counts.callsDue, 1)
    assert.equal(overview.counts.pricingToSend, 1)
    assert.equal(overview.counts.repliesNeeded, 1)
    assert.equal(overview.counts.followUpsDue, 2)
    assert.equal(overview.counts.activeCampaigns, 1)
    assert.equal(overview.counts.won, 1)
    const week = overview.windows[0]
    const month = overview.windows[1]
    const infoWeek = week.rows.find((row) => row.inbox === "info@cupspace.com.au")
    assert.equal(infoWeek?.sent, 6)
    assert.equal(infoWeek?.bounces, 1)
    assert.equal(infoWeek?.replies, 1)
    assert.equal(formatRate(infoWeek?.replyRate ?? 0, infoWeek?.sent ?? 0), "16.7%")
    assert.equal(week.trend.at(-1)?.sent, 4)
    assert.equal(week.rows.some((row) => row.inbox === "extra@example.com"), false)
    assert.equal(month.rows.find((row) => row.inbox === "extra@example.com")?.sent, 3)
    assert.equal(month.rows.find((row) => row.inbox === "info@cupspace.com.au")?.sent, 6)
    assert.equal(sortByDue(leads).map((item) => item.name)[0], "Won")
    assert.equal(actionLeads(leads, "Call").some((item) => item.name === "Held"), false)
    assert.equal(stageColumns([lead({ id: "x", name: "Warm", stage: "Warm intro" })]).some((column) => column.stage === "Warm intro"), true)
    assert.equal(
      filterLeads(leads, { inbox: "", persona: "", state: "", nextAction: "Call", waitingOn: "", search: "later" }).map(
        (item) => item.name,
      )[0],
      "Call later",
    )
  })
})

describe("dashboard cache and filing", () => {
  it("reuses a read for 60 seconds and serves the last sync if Notion then fails", async () => {
    let calls = 0
    let fail = false
    const source: DashboardSource = {
      mode: "live",
      async load() {
        calls += 1
        if (fail) throw new NotionError(429)
        return { mode: "live", leads: [], stats: [], requests: [] }
      },
      async createRequest(input) {
        return {
          id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
          instruction: input.instruction,
          leadId: input.leadId ?? "",
          status: "New",
          submittedAt: input.submittedAt,
          botResponse: "",
          completedAt: "",
        }
      },
    }
    const dashboard = createDashboard(source, 60_000)
    await dashboard.get(new Date(0))
    await dashboard.get(new Date(30_000))
    assert.equal(calls, 1)
    await dashboard.get(new Date(60_000))
    assert.equal(calls, 2)
    fail = true
    const stale = await dashboard.get(new Date(120_000))
    assert.equal(calls, 3)
    assert.equal(stale.stale, true)
    assert.match(stale.warning ?? "", /rate limiting/)
    const cold = createDashboard(
      { ...source, load: async () => { throw new NotionError(500) } },
      60_000,
    )
    await assert.rejects(() => cold.get(new Date(0)), (error: unknown) => error instanceof NotionError)
  })

  it("files an example request without a Notion call and rejects a missing lead", async () => {
    const deps = app()
    const cookie = await signIn(deps)
    const missing = await api(deps, "/api/requests", {
      method: "POST",
      headers: { cookie },
      body: JSON.stringify({
        instruction: "Call this person",
        leadId: "99999999-9999-4999-8999-999999999999",
      }),
    })
    assert.equal(missing.status, 404)
    const created = await api(deps, "/api/requests", {
      method: "POST",
      headers: { cookie },
      body: JSON.stringify({
        instruction: "Draft a reply for Harbour & Rye. Do not send it.",
        leadId: "10000000-0000-4000-8000-000000000001",
      }),
    })
    assert.equal(created.status, 201)
    const body = await created.json()
    assert.equal(body.mode, "example")
    assert.equal(body.request.status, "New")
    assert.equal(body.request.submittedAt, "2026-11-25T11:30:00+11:00")
    assert.equal(body.request.leadId, "10000000-0000-4000-8000-000000000001")
    const again = await api(deps, "/api/dashboard", { headers: { cookie } })
    const payload = await again.json()
    assert.equal(payload.requests[0].instruction, "Draft a reply for Harbour & Rye. Do not send it.")
  })
})

describe("XSS-safe rendering", () => {
  const nasty = lead({
    id: "10000000-0000-4000-8000-000000000099",
    name: `<img src=x onerror=alert(1)>`,
    business: `<script>alert(1)</script>`,
    suburb: "Surry Hills",
    state: "NSW",
    inbox: "info@cupspace.com.au",
    persona: "Ben",
    stage: "Call needed",
    nextAction: "Call",
    nextActionDue: "2026-11-20",
    phone: "javascript:alert(1)",
    email: `mira@example.com" onmouseover="alert(1)`,
    threadSubject: `<script>subject</script>`,
    latestSummary: `<img src=x onerror=alert(2)>`,
  })

  it("escapes lead text and refuses scriptable phone or email links", () => {
    const callable = lead({
      ...nasty,
      id: "10000000-0000-4000-8000-000000000098",
      name: "Priya Nair",
      phone: "0412 555 014",
    })
    const card = renderToStaticMarkup(React.createElement(LeadCard, { lead: nasty, today: "2026-11-25", onOpen: () => undefined }))
    const actions = renderToStaticMarkup(
      <Actions leads={[nasty, callable]} today="2026-11-25" tab="Call" onTab={() => undefined} onOpen={() => undefined} />,
    )
    const drawer = renderToStaticMarkup(
      <Drawer lead={nasty} today="2026-11-25" mode="example" onClose={() => undefined} onCreated={() => undefined} />,
    )
    const request = renderToStaticMarkup(
      <RequestCard
        leadName={nasty.name}
        request={{
          id: "30000000-0000-4000-8000-000000000099",
          instruction: `<script>alert(1)</script>`,
          leadId: nasty.id,
          status: "New",
          submittedAt: "2026-11-25T11:30:00+11:00",
          botResponse: `<img src=x onerror=alert(1)>`,
          completedAt: "",
        }}
      />,
    )
    for (const html of [card, actions, drawer, request]) {
      assert.equal(html.includes("<script"), false)
      assert.equal(html.includes("<img"), false)
      assert.equal(html.includes('href="javascript:'), false)
      assert.ok(html.includes("&lt;"))
    }
    assert.equal(telHref("javascript:alert(1)"), null)
    assert.equal(telHref("0412 555 014"), "tel:+61412555014")
    assert.equal(mailHref(nasty.email), null)
    assert.equal(actions.includes('href="tel:+61412555014"'), true)
    assert.equal(drawer.includes("href=\"mailto:"), false)
  })

  it("keeps Notion out of the built client", () => {
    const files = walk(resolve(root, "dist")).filter((file) => /\.(html|js|css|svg)$/.test(file))
    assert.ok(files.length > 0)
    const bundled = files.map((file) => readFileSync(file, "utf8")).join("\n")
    assert.equal(bundled.includes("api.notion.com"), false)
    assert.equal(bundled.includes("NOTION_TOKEN"), false)
    assert.equal(bundled.includes(DATA_SOURCES.pipeline), false)
    assert.equal(bundled.includes(DATA_SOURCES.sendStats), false)
    assert.equal(bundled.includes(DATA_SOURCES.requests), false)
    const clientSource = walk(resolve(root, "src/client")).map((file) => readFileSync(file, "utf8")).join("\n")
    assert.equal(clientSource.includes("dangerouslySetInnerHTML"), false)
    assert.equal(clientSource.includes("innerHTML"), false)
  })
})

const walk = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const full = join(directory, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
