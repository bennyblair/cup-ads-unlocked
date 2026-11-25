import { createDashboard, createExampleSource, createNotionSource, DashboardError, type DashboardService } from "./dashboard"
import { NotionError } from "./notion"
import { decideGate } from "../shared/gate"
import { normalizePageId } from "../shared/notion-map"
import { authEnvPresence, readAuthEnv, readNotionToken } from "../shared/runtime-env"
import {
  authConfigured,
  clearSessionCookie,
  hasValidSession,
  issueSessionToken,
  passwordMatches,
  requestIsSecure,
  sessionCookie,
} from "../shared/session"

export class HttpError extends Error {
  status: number
  details?: Record<string, unknown>

  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.details = details
  }
}

export type LoginLimiter = {
  tooMany(ip: string): boolean
  recordFailure(ip: string): void
  clear(ip: string): void
}

export type AppDependencies = {
  password: string
  sessionSecret: string
  limiter: LoginLimiter
  dashboard: DashboardService
  serveStatic?: (pathname: string) => Promise<Response | null>
  now?: () => Date
}

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
}

const withHeaders = (base: Record<string, string>, extra?: Record<string, string>) => {
  const headers = new Headers(base)
  if (extra) {
    for (const [key, value] of Object.entries(extra)) headers.append(key, value)
  }
  return headers
}

export const json = (body: unknown, status = 200, extraHeaders?: Record<string, string>) =>
  Response.json(body, { status, headers: withHeaders(JSON_HEADERS, extraHeaders) })

const text = (body: string, status: number) =>
  new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })

const pageRedirect = (location: string) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })

export const createLoginLimiter = (options?: { limit?: number; windowMs?: number }): LoginLimiter => {
  const limit = options?.limit ?? 8
  const windowMs = options?.windowMs ?? 10 * 60 * 1000
  const failures = new Map<string, number[]>()
  const recent = (ip: string) => {
    const now = Date.now()
    const kept = (failures.get(ip) ?? []).filter((time) => now - time < windowMs)
    failures.set(ip, kept)
    return kept
  }

  return {
    tooMany(ip) {
      return recent(ip).length >= limit
    },
    recordFailure(ip) {
      const kept = recent(ip)
      kept.push(Date.now())
      failures.set(ip, kept)
    },
    clear(ip) {
      failures.delete(ip)
    },
  }
}

const clientIp = (request: Request) => {
  const netlifyIp = request.headers.get("x-nf-client-connection-ip")?.trim()
  if (netlifyIp) return netlifyIp.slice(0, 80)
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return (forwarded || "local").slice(0, 80)
}

const sameOriginMutation = (request: Request) => {
  const origin = request.headers.get("origin")
  if (!origin) return request.headers.get("x-cupspace-pipeline") === "1"
  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

const readBody = async (request: Request) => {
  const reader = request.body?.getReader()
  if (!reader) return ""
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue
    total += value.byteLength
    if (total > 100_000) throw new HttpError("Request is too large.", 413)
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

const readJson = async (request: Request) => {
  const raw = await readBody(request)
  if (!raw) throw new HttpError("Request body must be JSON.", 400)
  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new HttpError("Request body must be JSON.", 400)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const requireUser = async (request: Request, deps: AppDependencies) => {
  if (!authConfigured(deps.password, deps.sessionSecret)) {
    throw new HttpError("Pipeline sign-in is not configured yet.", 503)
  }
  if (!(await hasValidSession(request, deps.sessionSecret, deps.password))) {
    throw new HttpError("Sign in required.", 401)
  }
}

const handleLogin = async (request: Request, deps: AppDependencies) => {
  if (!sameOriginMutation(request)) throw new HttpError("Sign-in was rejected.", 403)
  if (!authConfigured(deps.password, deps.sessionSecret)) {
    throw new HttpError("Pipeline sign-in is not configured yet.", 503, {
      configuration: authEnvPresence(),
    })
  }

  const ip = clientIp(request)
  if (deps.limiter.tooMany(ip)) {
    throw new HttpError("Too many sign-in attempts. Wait a few minutes and try again.", 429)
  }

  const body = await readJson(request)
  const password = isRecord(body) && typeof body.password === "string" ? body.password : ""
  if (!(await passwordMatches(password, deps.password))) {
    deps.limiter.recordFailure(ip)
    throw new HttpError("Incorrect password.", 401)
  }

  deps.limiter.clear(ip)
  const token = await issueSessionToken(deps.sessionSecret, deps.password)
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token, requestIsSecure(request)) })
}

const handleLogout = (request: Request) =>
  json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie(requestIsSecure(request)) })

export const cleanInstruction = (value: unknown) => {
  if (typeof value !== "string") return null
  const trimmed = value.replace(/\u0000/g, "").trim()
  if (!trimmed || trimmed.length > 1500) return null
  return trimmed
}

const readRequestInput = (body: unknown) => {
  if (!isRecord(body)) throw new HttpError("Write an instruction for Grok Bot.", 400)
  const instruction = cleanInstruction(body.instruction)
  if (!instruction) throw new HttpError("Write an instruction of 1,500 characters or fewer.", 400)
  const rawLead = typeof body.leadId === "string" ? body.leadId.trim() : ""
  if (!rawLead) return { instruction }
  const leadId = normalizePageId(rawLead)
  if (!leadId) throw new HttpError("That lead could not be matched.", 400)
  return { instruction, leadId }
}

export const handleApi = async (request: Request, deps: AppDependencies) => {
  try {
    const url = new URL(request.url)
    const { pathname } = url
    const now = deps.now?.() ?? new Date()

    if (pathname === "/api/login") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405)
      return await handleLogin(request, deps)
    }

    if (pathname === "/api/logout") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405)
      return handleLogout(request)
    }

    await requireUser(request, deps)
    if (request.method !== "GET" && request.method !== "HEAD" && !sameOriginMutation(request)) {
      throw new HttpError("Request was rejected.", 403)
    }

    if (pathname === "/api/dashboard" && request.method === "GET") {
      const payload = await deps.dashboard.get(now, { refresh: url.searchParams.get("refresh") === "1" })
      return json(payload)
    }

    if (pathname === "/api/requests" && request.method === "POST") {
      const created = await deps.dashboard.createRequest(readRequestInput(await readJson(request)), now)
      return json(created, 201)
    }

    return json({ error: "Not found." }, 404)
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message, ...(error.details ?? {}) }, error.status)
    }
    if (error instanceof DashboardError) return json({ error: error.message }, error.status)
    if (error instanceof NotionError) {
      console.error("pipeline notion failed", error.status)
      const message =
        error.status === 429
          ? "Notion is rate limiting requests. Wait a minute and try again."
          : "Notion could not be reached. Nothing was changed."
      return json({ error: message }, 502)
    }
    console.error("pipeline api failed")
    return json({ error: "Something went wrong." }, 500)
  }
}

const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
}

let cachedDashboard: DashboardService | null = null
let cachedToken: string | null = null

export const dashboardFromEnv = () => {
  const token = readNotionToken()
  if (cachedDashboard && cachedToken === token) return cachedDashboard
  cachedToken = token
  cachedDashboard = createDashboard(token ? createNotionSource(token) : createExampleSource())
  return cachedDashboard
}

export const handleNetlifyRequest = (request: Request, limiter: LoginLimiter = createLoginLimiter()) =>
  handleApi(request, { limiter, dashboard: dashboardFromEnv(), ...readAuthEnv() })

export const handleRequest = async (request: Request, deps: AppDependencies) => {
  const url = new URL(request.url)
  if (url.pathname.startsWith("/api/") || url.pathname === "/.netlify/functions/api") {
    return handleApi(request, deps)
  }

  const authenticated = await hasValidSession(request, deps.sessionSecret, deps.password)
  const decision = decideGate({ method: request.method, pathname: url.pathname, authenticated })
  if (decision.type === "redirect") return pageRedirect(decision.to)
  if (decision.type === "unauthorized") return json({ error: "Sign in required." }, 401)
  if (!deps.serveStatic) return text("Not found.", 404)

  const staticPath =
    url.pathname === "/" || url.pathname === "/login" || url.pathname === "/index.html"
      ? "/index.html"
      : url.pathname
  const file = await deps.serveStatic(staticPath)
  if (!file) return text("Not found.", 404)
  if (staticPath === "/index.html") {
    const headers = new Headers(file.headers)
    for (const [key, value] of Object.entries(HTML_HEADERS)) headers.set(key, value)
    return new Response(file.body, { status: file.status, headers })
  }
  return file
}
