import { isCampaignId, trackingUrl, StoreError, type Campaign } from "../shared/campaign"
import { normalizeDestination, normalizeName } from "../shared/destination"
import { decideGate } from "../shared/gate"
import { authEnvPresence, readAuthEnv } from "../shared/runtime-env"
import {
  authConfigured,
  clearSessionCookie,
  hasValidSession,
  issueSessionToken,
  passwordMatches,
  requestIsSecure,
  sessionCookie,
} from "../shared/session"
import type { CampaignStore } from "./document-store"
import { qrPng, qrSvg } from "./qr-image"

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
  store: CampaignStore
  password: string
  sessionSecret: string
  limiter: LoginLimiter
  serveStatic?: (pathname: string) => Promise<Response | null>
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

const text = (body: string, status: number, extraHeaders?: Record<string, string>) =>
  new Response(body, {
    status,
    headers: withHeaders(
      {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex",
      },
      extraHeaders,
    ),
  })

const redirectTo = (location: string) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store, max-age=0",
      "Netlify-CDN-Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
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
  if (!origin) return request.headers.get("x-cupspace-qr") === "1"
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
    if (total > 1_000_000) throw new HttpError("Request is too large.", 413)
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

const publicCampaign = (campaign: Campaign) => ({
  id: campaign.id,
  name: campaign.name,
  destination: campaign.destination,
  visits: campaign.visits,
  createdAt: campaign.createdAt,
  trackingUrl: trackingUrl(campaign.id),
})

const storedCampaign = (campaign: Campaign) => ({
  id: campaign.id,
  name: campaign.name,
  destination: campaign.destination,
  visits: campaign.visits,
  createdAt: campaign.createdAt,
})

const requireUser = async (request: Request, deps: AppDependencies) => {
  if (!authConfigured(deps.password, deps.sessionSecret)) {
    throw new HttpError("QR Studio sign-in is not configured yet.", 503)
  }
  if (!(await hasValidSession(request, deps.sessionSecret, deps.password))) {
    throw new HttpError("Sign in required.", 401)
  }
}

const campaignIdFromPath = (pathname: string, suffix = "") => {
  const match = pathname.match(new RegExp(`^/api/campaigns/([2-9a-hj-km-np-z]{8})${suffix}$`))
  return match && isCampaignId(match[1]) ? match[1] : null
}

const fileSlug = (id: string) => `cupspace-${id}`

export const visitIdFromRequest = (request: Request) => {
  const url = new URL(request.url)
  const queryId = url.searchParams.get("id")
  if (queryId && isCampaignId(queryId) && url.pathname.includes("/visit")) return queryId
  const pathMatch = url.pathname.match(/^\/c\/([2-9a-hj-km-np-z]{8})\/?$/)
  if (pathMatch && isCampaignId(pathMatch[1])) return pathMatch[1]
  const forwarded = `${request.headers.get("x-forwarded-uri") ?? ""} ${request.headers.get("x-original-url") ?? ""}`
  const forwardedMatch = forwarded.match(/\/c\/([2-9a-hj-km-np-z]{8})\/?(?:$|\?|\s)/)
  return forwardedMatch && isCampaignId(forwardedMatch[1]) ? forwardedMatch[1] : null
}

const safeDestination = (value: string) => {
  const parsed = normalizeDestination(value)
  return parsed.ok ? parsed.value : null
}

export const handleVisit = async (request: Request, store: CampaignStore) => {
  const id = visitIdFromRequest(request)
  if (!id) return text("This QR code is not active.", 404)

  let destination: string | null = null
  try {
    const campaign = await store.get(id)
    if (!campaign) return text("This QR code is not active.", 404)
    destination = safeDestination(campaign.destination)
    if (!destination) return text("This QR code is not active.", 404)
  } catch {
    console.error("qr lookup failed")
    return text("This QR code could not be opened.", 502)
  }

  if (!destination) return text("This QR code is not active.", 404)
  if (request.method === "HEAD") return redirectTo(destination)
  if (request.method !== "GET") return text("Method not allowed.", 405)

  try {
    const result = await store.incrementVisits(id)
    if (result.status === "missing") return text("This QR code is not active.", 404)
    if (result.destination) {
      const latest = safeDestination(result.destination)
      if (latest) destination = latest
    }
  } catch {
    console.error("qr visit count failed")
  }

  return redirectTo(destination)
}

const handleLogin = async (request: Request, deps: AppDependencies) => {
  if (!sameOriginMutation(request)) throw new HttpError("Sign-in was rejected.", 403)
  if (!authConfigured(deps.password, deps.sessionSecret)) {
    throw new HttpError("QR Studio sign-in is not configured yet.", 503, {
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
  json({ ok: true }, 200, {
    "Set-Cookie": clearSessionCookie(requestIsSecure(request)),
  })

const readCampaignInput = (body: unknown) => {
  if (!isRecord(body)) throw new HttpError("Enter a campaign name and destination.", 400)
  const name = normalizeName(typeof body.name === "string" ? body.name : "")
  const destination = normalizeDestination(
    typeof body.destination === "string" ? body.destination : "",
  )
  if (!name.ok) throw new HttpError(name.error, 400)
  if (!destination.ok) throw new HttpError(destination.error, 400)
  return { name: name.value, destination: destination.value }
}

const qrResponse = async (id: string, format: "svg" | "png", store: CampaignStore) => {
  const campaign = await store.get(id)
  if (!campaign) throw new HttpError("Campaign not found.", 404)
  if (format === "svg") {
    const svg = await qrSvg(id)
    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileSlug(id)}.svg"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  }

  const png = await qrPng(id)
  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${fileSlug(id)}.png"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

export const handleApi = async (request: Request, deps: AppDependencies) => {
  try {
    const url = new URL(request.url)
    const { pathname } = url

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

    if (pathname === "/api/campaigns" && request.method === "GET") {
      const campaigns = await deps.store.list()
      return json({ campaigns: campaigns.map(publicCampaign) })
    }

    if (pathname === "/api/campaigns" && request.method === "POST") {
      const created = await deps.store.create(readCampaignInput(await readJson(request)))
      return json({ campaign: publicCampaign(created) }, 201)
    }

    if (pathname === "/api/export" && request.method === "GET") {
      const campaigns = await deps.store.list()
      return new Response(`${JSON.stringify({ campaigns: campaigns.map(storedCampaign) }, null, 2)}\n`, {
        status: 200,
        headers: {
          ...JSON_HEADERS,
          "Content-Disposition": 'attachment; filename="cupspace-qr-backup.json"',
        },
      })
    }

    if (pathname === "/api/import" && request.method === "POST") {
      const body = await readJson(request)
      if (!isRecord(body) || body.confirm !== "REPLACE ALL CAMPAIGNS" || !Array.isArray(body.campaigns)) {
        throw new HttpError("Type REPLACE ALL CAMPAIGNS to restore a backup.", 400)
      }
      const replaced = await deps.store.replaceAll(body.campaigns)
      return json({ campaigns: replaced.map(publicCampaign) })
    }

    const qrMatch = pathname.match(/^\/api\/campaigns\/([2-9a-hj-km-np-z]{8})\/qr\.(svg|png)$/)
    if (qrMatch && isCampaignId(qrMatch[1])) {
      if (request.method !== "GET") return json({ error: "Method not allowed." }, 405)
      return await qrResponse(qrMatch[1], qrMatch[2] as "svg" | "png", deps.store)
    }

    const id = campaignIdFromPath(pathname)
    if (id && request.method === "PATCH") {
      const updated = await deps.store.update(id, readCampaignInput(await readJson(request)))
      if (!updated) throw new HttpError("Campaign not found.", 404)
      return json({ campaign: publicCampaign(updated) })
    }

    if (id && request.method === "DELETE") {
      const deleted = await deps.store.delete(id)
      if (!deleted) throw new HttpError("Campaign not found.", 404)
      return json({ ok: true })
    }

    return json({ error: "Not found." }, 404)
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message, ...(error.details ?? {}) }, error.status)
    }
    if (error instanceof StoreError) return json({ error: error.message }, error.status)
    console.error("qr api failed")
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

// Production login reads the process and Netlify env here. Callers must not
// pass a password in from anywhere else.
export const handleNetlifyRequest = (
  request: Request,
  store: CampaignStore,
  limiter: LoginLimiter = createLoginLimiter(),
) => handleApi(request, { store, limiter, ...readAuthEnv() })

export const handleRequest = async (request: Request, deps: AppDependencies) => {
  const url = new URL(request.url)
  if (url.pathname.startsWith("/c/")) return handleVisit(request, deps.store)
  if (url.pathname.startsWith("/api/") || url.pathname === "/.netlify/functions/api") {
    return handleApi(request, deps)
  }

  const authenticated = await hasValidSession(request, deps.sessionSecret, deps.password)
  const decision = decideGate({
    method: request.method,
    pathname: url.pathname,
    authenticated,
  })
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
