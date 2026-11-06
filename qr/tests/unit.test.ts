import assert from "node:assert/strict"
import { before, describe, it } from "node:test"

import { PNG } from "pngjs"
import jsQR from "jsqr"

import { parseCampaign, PUBLIC_ORIGIN, trackingUrl } from "../src/shared/campaign"
import { addDays, zonedStamp } from "../src/shared/timezone"
import { suggestedDestination } from "../src/shared/utm"
import { normalizeDestination, normalizeName } from "../src/shared/destination"
import { decideGate } from "../src/shared/gate"
import { hasValidSession, issueSessionToken, passwordMatches } from "../src/shared/session"
import { createBlobsCampaignStore, blobStoreName, type BlobClient } from "../src/server/blobs-store"
import { createBlobsAnalyticsStore, createMemoryAnalytics } from "../src/server/analytics-store"
import { createMemoryStore } from "../src/server/memory-store"
import {
  createLoginLimiter,
  handleApi,
  handleNetlifyRequest,
  handleRequest,
  handleVisit,
  type AppDependencies,
} from "../src/server/http"
import { qrPng, qrSvg } from "../src/server/qr-image"

const PASSWORD = "test-only-qr-password"
const SECRET = "test-only-session-secret-32b-xxxx"

const decodePng = (bytes: Uint8Array) => {
  const png = PNG.sync.read(Buffer.from(bytes))
  const pixels = new Uint8ClampedArray(png.data.length)
  pixels.set(png.data)
  return jsQR(pixels, png.width, png.height)?.data ?? null
}

const cookieHeader = (response: Response) => {
  const cookie = response.headers.getSetCookie()[0]
  assert.ok(cookie)
  return cookie.split(";")[0]
}

const app = (store = createMemoryStore(), limiter = createLoginLimiter()): AppDependencies =>
  ({
    store,
    password: PASSWORD,
    sessionSecret: SECRET,
    limiter,
    serveStatic: async (pathname: string) =>
      pathname === "/index.html"
        ? new Response("<!doctype html><title>QR Studio</title>", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        : null,
  }) satisfies AppDependencies

const api = (deps: AppDependencies, path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  if (!headers.has("origin")) headers.set("origin", "http://127.0.0.1")
  headers.set("x-cupspace-qr", "1")
  return handleApi(new Request(`http://127.0.0.1${path}`, { ...init, headers }), deps)
}

describe("destination and tracking URL", () => {
  it("adds https and rejects anything except http(s)", () => {
    const bare = normalizeDestination(" client.com/offer ")
    const explicit = normalizeDestination("HTTP://Client.com/Offer")
    const name = normalizeName("  Harbour   launch ")
    assert.equal(bare.ok && bare.value, "https://client.com/offer")
    assert.equal(explicit.ok && explicit.value, "http://client.com/Offer")
    assert.equal(normalizeDestination("javascript:alert(1)").ok, false)
    assert.equal(normalizeDestination("data:text/html,hi").ok, false)
    assert.equal(normalizeDestination("//evil.example").ok, false)
    assert.equal(normalizeDestination("https://user:secret@client.com").ok, false)
    assert.equal(normalizeDestination("https://qr.cupspace.com.au/c/abcdefgh").ok, false)
    assert.equal(name.ok && name.value, "Harbour launch")
  })

  it("encodes only the CupSpace tracking URL", () => {
    const url = trackingUrl("abcdefgh")
    assert.equal(url, `${PUBLIC_ORIGIN}/c/abcdefgh`)
    assert.equal(url.includes("emet"), false)
    assert.equal(url.includes("bit.ly"), false)
  })
})

describe("sessions and gate", () => {
  it("accepts a signed cookie and rejects tampering", async () => {
    const token = await issueSessionToken(SECRET, PASSWORD)
    const request = new Request("https://qr.cupspace.com.au/", {
      headers: { cookie: `cupspace_qr_session=${token}` },
    })
    assert.equal(await hasValidSession(request, SECRET, PASSWORD), true)
    assert.equal(await hasValidSession(request, `${SECRET}x`, PASSWORD), false)
    assert.equal(await hasValidSession(request, SECRET, `${PASSWORD}-rotated`), false)
    const tampered = new Request("https://qr.cupspace.com.au/", {
      headers: { cookie: `cupspace_qr_session=${token.slice(0, -2)}aa` },
    })
    assert.equal(await hasValidSession(tampered, SECRET, PASSWORD), false)
    assert.equal(await passwordMatches(PASSWORD, PASSWORD), true)
    assert.equal(await passwordMatches("wrong-password-value", PASSWORD), false)
  })

  it("keeps the public QR path open and the dashboard closed", () => {
    assert.deepEqual(decideGate({ method: "GET", pathname: "/c/abcdefgh", authenticated: false }), {
      type: "next",
    })
    assert.deepEqual(decideGate({ method: "GET", pathname: "/", authenticated: false }), {
      type: "redirect",
      to: "/login",
    })
    assert.deepEqual(decideGate({ method: "GET", pathname: "/api/campaigns", authenticated: false }), {
      type: "unauthorized",
    })
    assert.equal(decideGate({ method: "POST", pathname: "/api/login", authenticated: false }).type, "next")
  })
})

describe("campaign store", () => {
  it("counts concurrent visits once each and keeps the id when edited", async () => {
    const store = createMemoryStore()
    const created = await store.create({ name: "Harbour", destination: "client.com/offer" })
    assert.equal(created.destination, "https://client.com/offer")
    await Promise.all(Array.from({ length: 40 }, () => store.incrementVisits(created.id)))
    const updated = await store.update(created.id, {
      name: "Harbour updated",
      destination: "https://example.com/next",
    })
    assert.equal(updated?.id, created.id)
    assert.equal(updated?.visits, 40)
    assert.equal(updated?.createdAt, created.createdAt)
    assert.equal(trackingUrl(updated!.id), `${PUBLIC_ORIGIN}/c/${created.id}`)
    assert.equal(await store.delete(created.id), true)
    assert.equal((await store.incrementVisits(created.id)).status, "missing")
  })

  it("uses compare-and-swap on the blob document", async () => {
    let etag: string | null = null
    let raw: string | null = null
    let writes = 0
    const client: BlobClient = {
      async getWithMetadata() {
        await Promise.resolve()
        return raw ? { data: JSON.parse(raw), etag: etag ?? undefined } : null
      },
      async setJSON(_key, data, options) {
        await Promise.resolve()
        writes += 1
        if (options.onlyIfNew && raw) return { modified: false }
        if (options.onlyIfMatch && options.onlyIfMatch !== etag) return { modified: false }
        raw = JSON.stringify(data)
        etag = `v${writes}`
        return { modified: true }
      },
      async delete() {
        raw = null
        etag = null
      },
      async list() {
        return raw ? ["campaigns"] : []
      },
    }
    const firstInstance = createBlobsCampaignStore(client)
    const secondInstance = createBlobsCampaignStore(client)
    const created = await firstInstance.create({
      name: "Blob",
      destination: "https://client.example/offer",
    })
    await Promise.all([
      ...Array.from({ length: 20 }, () => firstInstance.incrementVisits(created.id)),
      ...Array.from({ length: 20 }, () => secondInstance.incrementVisits(created.id)),
    ])
    const stored = JSON.parse(raw ?? "{}") as { campaigns: Array<Record<string, unknown>> }
    assert.equal(stored.campaigns[0].visits, 40)
    assert.deepEqual(Object.keys(stored.campaigns[0]).sort(), [
      "createdAt",
      "destination",
      "id",
      "name",
      "visits",
    ])
    assert.equal(blobStoreName("production"), "cupspace-qr")
    assert.equal(blobStoreName("deploy-preview"), "cupspace-qr-deploy-preview")
    assert.equal(blobStoreName(undefined), "cupspace-qr")
  })
})

describe("http API", () => {
  let deps: AppDependencies

  before(() => {
    deps = app()
  })

  it("blocks management until sign-in and never puts the password in the cookie", async () => {
    assert.equal((await api(deps, "/api/campaigns")).status, 401)
    assert.equal((await api(deps, "/api/campaigns/abcdefgh/qr.png")).status, 401)
    assert.equal((await api(deps, "/api/export")).status, 401)
    const wrong = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "not-the-right-password" }),
    })
    assert.equal(wrong.status, 401)

    const signedIn = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: PASSWORD }),
    })
    assert.equal(signedIn.status, 200)
    const cookie = signedIn.headers.getSetCookie()[0]
    assert.match(cookie, /HttpOnly/)
    assert.equal(cookie.includes(PASSWORD), false)
    const header = cookieHeader(signedIn)

    const created = await api(deps, "/api/campaigns", {
      method: "POST",
      headers: { cookie: header },
      body: JSON.stringify({ name: "Spring cups", destination: "client.com/offer" }),
    })
    assert.equal(created.status, 201)
    const campaign = (await created.json()).campaign
    assert.equal(campaign.destination, "https://client.com/offer")
    assert.equal(campaign.trackingUrl, `${PUBLIC_ORIGIN}/c/${campaign.id}`)

    const forbidden = await handleApi(
      new Request("http://127.0.0.1/api/campaigns", {
        method: "POST",
        headers: { origin: "https://evil.example", cookie: header, "content-type": "application/json" },
        body: JSON.stringify({ name: "Nope", destination: "https://example.com" }),
      }),
      deps,
    )
    assert.equal(forbidden.status, 403)

    const edited = await api(deps, `/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { cookie: header },
      body: JSON.stringify({ name: "Spring cups", destination: "https://example.com/next" }),
    })
    const editedCampaign = (await edited.json()).campaign
    assert.equal(editedCampaign.id, campaign.id)
    assert.equal(editedCampaign.trackingUrl, campaign.trackingUrl)
    assert.equal(editedCampaign.destination, "https://example.com/next")

    const png = await api(deps, `/api/campaigns/${campaign.id}/qr.png`, { headers: { cookie: header } })
    assert.equal(png.headers.get("content-type"), "image/png")
    const encoded = decodePng(new Uint8Array(await png.arrayBuffer()))
    assert.equal(encoded, campaign.trackingUrl)
    assert.equal(encoded?.includes("emet"), false)

    const svg = await api(deps, `/api/campaigns/${campaign.id}/qr.svg`, { headers: { cookie: header } })
    const svgText = await svg.text()
    assert.match(svgText, /<svg/)
    assert.equal(svgText.toLowerCase().includes("emet"), false)
    assert.equal(svgText.includes("example.com"), false)
    assert.equal(svgText.includes("bit.ly"), false)

    const backup = await api(deps, "/api/export", { headers: { cookie: header } })
    const exported = JSON.parse(await backup.text()) as { campaigns: Array<Record<string, unknown>> }
    assert.deepEqual(Object.keys(exported.campaigns[0]).sort(), [
      "createdAt",
      "destination",
      "id",
      "name",
      "visits",
    ])

    assert.equal((await api(deps, `/api/campaigns/${campaign.id}`, {
      method: "DELETE",
      headers: { cookie: header },
      body: JSON.stringify({ confirm: "DELETE" }),
    })).status, 200)
    assert.equal((await handleVisit(new Request(`http://127.0.0.1/c/${campaign.id}`), deps.store)).status, 404)

    const loggedOut = await api(deps, "/api/logout", { method: "POST", headers: { cookie: header } })
    assert.match(loggedOut.headers.getSetCookie()[0], /Max-Age=0/)
    assert.equal((await api(deps, "/api/campaigns")).status, 401)
  })

  it("redirects visits, ignores HEAD, and still redirects when counting fails", async () => {
    const created = await deps.store.create({ name: "Visit", destination: "https://example.com/land" })
    const first = await handleVisit(new Request(`http://127.0.0.1/c/${created.id}`), deps.store)
    assert.equal(first.status, 302)
    assert.equal(first.headers.get("location"), "https://example.com/land")
    assert.equal(first.headers.get("cache-control")?.includes("no-store"), true)
    assert.equal(first.headers.getSetCookie().length, 0)

    const head = await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`, { method: "HEAD" }),
      deps.store,
    )
    assert.equal(head.status, 302)
    assert.equal((await deps.store.get(created.id))?.visits, 1)

    await Promise.all(
      Array.from({ length: 40 }, () => handleVisit(new Request(`http://127.0.0.1/c/${created.id}`), deps.store)),
    )
    assert.equal((await deps.store.get(created.id))?.visits, 41)

    const flaky = {
      get: deps.store.get.bind(deps.store),
      incrementVisits: async () => {
        throw new Error("database unavailable")
      },
    }
    const fallback = await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`),
      flaky as unknown as AppDependencies["store"],
    )
    assert.equal(fallback.status, 302)
    assert.equal(fallback.headers.get("location"), "https://example.com/land")
    assert.equal((await deps.store.get(created.id))?.visits, 41)
  })

  it("does not serve the dashboard without a session", async () => {
    const response = await handleRequest(new Request("http://127.0.0.1/"), deps)
    assert.equal(response.status, 302)
    assert.equal(response.headers.get("location"), "/login")
    const login = await handleRequest(new Request("http://127.0.0.1/login"), deps)
    assert.equal(login.status, 200)
    assert.equal((await login.text()).includes("Spring cups"), false)
  })

  it("rejects a bad backup and an unconfigured password", async () => {
    const signedIn = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: PASSWORD }),
    })
    const header = cookieHeader(signedIn)
    const rejected = await api(deps, "/api/import", {
      method: "POST",
      headers: { cookie: header },
      body: JSON.stringify({ confirm: "REPLACE ALL CAMPAIGNS", campaigns: [{ id: "bad" }] }),
    })
    assert.equal(rejected.status, 400)

    const unconfigured = app()
    unconfigured.password = "short"
    assert.equal((await api(unconfigured, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "short" }),
    })).status, 503)
    assert.throws(() => parseCampaign({ id: "no" }, 400), /invalid/i)
  })
})

describe("Netlify runtime env", () => {
  const previous = {
    password: process.env.QR_ADMIN_PASSWORD,
    secret: process.env.QR_SESSION_SECRET,
    netlify: (globalThis as { Netlify?: unknown }).Netlify,
  }

  const restore = () => {
    if (previous.password === undefined) delete process.env.QR_ADMIN_PASSWORD
    else process.env.QR_ADMIN_PASSWORD = previous.password
    if (previous.secret === undefined) delete process.env.QR_SESSION_SECRET
    else process.env.QR_SESSION_SECRET = previous.secret
    if (previous.netlify === undefined) delete (globalThis as { Netlify?: unknown }).Netlify
    else (globalThis as { Netlify?: unknown }).Netlify = previous.netlify
  }

  const clearRuntime = () => {
    delete process.env.QR_ADMIN_PASSWORD
    delete process.env.QR_SESSION_SECRET
    delete (globalThis as { Netlify?: unknown }).Netlify
  }

  const setNetlify = (values: Record<string, string | undefined>) => {
    ;(globalThis as { Netlify?: { env: { get(name: string): string | undefined } } }).Netlify = {
      env: { get: (name) => values[name] },
    }
  }

  const login = (password: string) =>
    handleNetlifyRequest(
      new Request("http://127.0.0.1/api/login", {
        method: "POST",
        headers: {
          origin: "http://127.0.0.1",
          "content-type": "application/json",
          "x-cupspace-qr": "1",
        },
        body: JSON.stringify({ password }),
      }),
      createMemoryStore(),
    )

  it("reports missing production env without echoing secrets", async () => {
    clearRuntime()
    try {
      const response = await login("not-the-configured-password")
      const body = await response.text()
      assert.equal(response.status, 503)
      assert.equal(body.includes(PASSWORD), false)
      assert.equal(body.includes(SECRET), false)
      const parsed = JSON.parse(body) as {
        configuration: {
          password: { fromProcess: boolean; fromNetlify: boolean; valid: boolean }
          sessionSecret: { fromProcess: boolean; fromNetlify: boolean; valid: boolean }
        }
      }
      assert.equal(parsed.configuration.password.valid, false)
      assert.equal(parsed.configuration.password.fromProcess, false)
      assert.equal(parsed.configuration.password.fromNetlify, false)
      assert.equal(parsed.configuration.sessionSecret.valid, false)
    } finally {
      restore()
    }
  })

  it("reads a valid Node function env when Netlify.env is empty", async () => {
    clearRuntime()
    process.env.QR_ADMIN_PASSWORD = PASSWORD
    process.env.QR_SESSION_SECRET = SECRET
    setNetlify({ QR_ADMIN_PASSWORD: "", QR_SESSION_SECRET: "" })
    try {
      const response = await login("not-the-configured-password")
      const body = await response.text()
      assert.equal(response.status, 401)
      assert.match(body, /Incorrect password/)
      assert.equal(body.includes(PASSWORD), false)
      assert.equal(body.includes(SECRET), false)
    } finally {
      restore()
    }
  })

  it("reads a valid edge env when process.env is unset", async () => {
    clearRuntime()
    setNetlify({ QR_ADMIN_PASSWORD: PASSWORD, QR_SESSION_SECRET: SECRET })
    try {
      const response = await login("not-the-configured-password")
      assert.equal(response.status, 401)
    } finally {
      restore()
    }
  })

  it("accepts an 8 character password when the session secret is valid", async () => {
    clearRuntime()
    process.env.QR_ADMIN_PASSWORD = "eightchr"
    process.env.QR_SESSION_SECRET = SECRET
    try {
      const response = await login("not-the-configured-password")
      const body = await response.text()
      assert.equal(response.status, 401)
      assert.match(body, /Incorrect password/)
      assert.equal(body.includes(SECRET), false)
    } finally {
      restore()
    }
  })

  it("rejects values that are present but shorter than the required minimum", async () => {
    clearRuntime()
    process.env.QR_ADMIN_PASSWORD = "sevench"
    process.env.QR_SESSION_SECRET = "short-secret"
    try {
      const response = await login("sevench")
      const body = JSON.parse(await response.text()) as {
        configuration: { password: { fromProcess: boolean; valid: boolean }; sessionSecret: { valid: boolean } }
      }
      assert.equal(response.status, 503)
      assert.equal(body.configuration.password.fromProcess, true)
      assert.equal(body.configuration.password.valid, false)
      assert.equal(body.configuration.sessionSecret.valid, false)
    } finally {
      restore()
    }
  })
})

describe("scan details", () => {
  const geo = Buffer.from(
    JSON.stringify({
      city: "Sydney",
      country: { code: "AU", name: "Australia" },
      latitude: -33.86,
      longitude: 151.2,
      postalCode: "2000",
    }),
  ).toString("base64")

  const visit = (store: ReturnType<typeof createMemoryStore>, analytics: ReturnType<typeof createMemoryAnalytics>, id: string, headers?: HeadersInit) =>
    handleVisit(
      new Request(`http://127.0.0.1/c/${id}`, { headers }),
      store,
      analytics,
    )

  it("counts every GET once, skips HEAD, and keeps campaign records unchanged", async () => {
    const store = createMemoryStore()
    const analytics = createMemoryAnalytics()
    const created = await store.create({ name: "Harbour", destination: "https://example.com/land" })
    await Promise.all(
      Array.from({ length: 20 }, () =>
        visit(store, analytics, created.id, {
          "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Safari",
          "x-nf-geo": geo,
          "x-nf-client-connection-ip": "203.0.113.10",
        }),
      ),
    )
    const head = await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`, { method: "HEAD" }),
      store,
      analytics,
    )
    assert.equal(head.status, 302)
    const campaign = await store.get(created.id)
    assert.equal(campaign?.visits, 20)
    assert.deepEqual(Object.keys(campaign ?? {}).sort(), ["createdAt", "destination", "id", "name", "visits"])
    const stats = await analytics.get(created.id)
    assert.equal(stats?.recorded, 20)
    assert.equal(stats?.recent.length, 20)
    assert.equal(stats?.recent[0]?.city, "Sydney")
    assert.equal(stats?.recent[0]?.country, "Australia")
    assert.equal(stats?.devices.some((item) => item.label === "phone"), true)
    const stored = JSON.stringify(stats)
    assert.equal(stored.includes("203.0.113.10"), false)
    assert.equal(stored.includes("latitude"), false)
    assert.equal(stored.includes("iPhone"), false)
  })

  it("still redirects when scan details fail and records nothing for a failed count", async () => {
    const store = createMemoryStore()
    const created = await store.create({ name: "Harbour", destination: "https://example.com/land" })
    const analytics = {
      async record() {
        throw new Error("analytics unavailable")
      },
      async get() {
        return null
      },
      async delete() {
        return undefined
      },
      async retain() {
        return undefined
      },
      async report() {
        return null
      },
    }
    const response = await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`),
      store,
      analytics,
    )
    assert.equal(response.status, 302)
    assert.equal(response.headers.get("location"), "https://example.com/land")
    assert.equal((await store.get(created.id))?.visits, 1)
  })

  it("stores Unknown for missing or spoofed place data and does not keep the raw browser string", async () => {
    const store = createMemoryStore()
    const analytics = createMemoryAnalytics()
    const created = await store.create({ name: "Harbour", destination: "https://example.com/land" })
    const marker = "secret-browser-token-should-not-be-stored"
    await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`, {
        headers: {
          "user-agent": `Mozilla/5.0 ${marker}`,
          "x-city": "<script>alert(1)</script>",
          "x-country": "ZZ",
          "x-nf-geo": Buffer.from(JSON.stringify({ city: "<script>", country: { code: "XX" } })).toString("base64"),
          "x-nf-client-connection-ip": "198.51.100.20",
        },
      }),
      store,
      analytics,
    )
    const stats = await analytics.get(created.id)
    assert.equal(stats?.recent[0]?.city, "Unknown")
    assert.equal(stats?.recent[0]?.country, "Unknown")
    const stored = JSON.stringify(stats)
    assert.equal(stored.includes(marker), false)
    assert.equal(stored.includes("<script>"), false)
    assert.equal(stored.includes("198.51.100.20"), false)
  })

  it("hides scan details from signed-out requests and removes them with the campaign", async () => {
    const store = createMemoryStore()
    const analytics = createMemoryAnalytics()
    const deps = app(store)
    deps.analytics = analytics
    const created = await store.create({ name: "Harbour", destination: "https://example.com/land" })
    await handleVisit(new Request(`http://127.0.0.1/c/${created.id}`), store, analytics)
    const hidden = await handleApi(new Request(`http://127.0.0.1/api/campaigns/${created.id}/stats`), deps)
    assert.equal(hidden.status, 401)
    const signedIn = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: PASSWORD }),
    })
    const header = cookieHeader(signedIn)
    const visible = await api(deps, `/api/campaigns/${created.id}/stats`, { headers: { cookie: header } })
    assert.equal(visible.status, 200)
    const body = await visible.json()
    assert.equal(body.stats.recorded, 1)
    const removed = await api(deps, `/api/campaigns/${created.id}`, {
      method: "DELETE",
      headers: { cookie: header },
      body: JSON.stringify({ confirm: "DELETE" }),
    })
    assert.equal(removed.status, 200)
    assert.equal(await analytics.get(created.id), null)
    assert.equal(await store.get(created.id), null)
  })
})

describe("delete confirmation", () => {
  it("keeps the fixture unless DELETE is typed, and ignores a restore without its phrase", async () => {
    const deps = app()
    const created = await deps.store.create({ name: "Fixture cups", destination: "https://example.com/keep" })
    const denied = await api(deps, `/api/campaigns/${created.id}`, {
      method: "DELETE",
      body: JSON.stringify({ confirm: "DELETE" }),
    })
    assert.equal(denied.status, 401)
    assert.equal((await deps.store.get(created.id))?.name, "Fixture cups")

    const signedIn = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: PASSWORD }),
    })
    const header = cookieHeader(signedIn)
    for (const body of [undefined, { confirm: "" }, { confirm: "delete" }, { confirm: "REMOVE" }]) {
      const response = await api(deps, `/api/campaigns/${created.id}`, {
        method: "DELETE",
        headers: { cookie: header },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      assert.equal(response.status, 400)
      assert.equal((await deps.store.get(created.id))?.destination, "https://example.com/keep")
    }

    const unconfirmedRestore = await api(deps, "/api/import", {
      method: "POST",
      headers: { cookie: header },
      body: JSON.stringify({ campaigns: [] }),
    })
    assert.equal(unconfirmedRestore.status, 400)
    assert.equal((await deps.store.get(created.id))?.visits, 0)

    const removed = await api(deps, `/api/campaigns/${created.id}`, {
      method: "DELETE",
      headers: { cookie: header },
      body: JSON.stringify({ confirm: "DELETE" }),
    })
    assert.equal(removed.status, 200)
    assert.equal(await deps.store.get(created.id), null)
  })
})

describe("reports", () => {
  const windowStart = addDays(zonedStamp(new Date().toISOString(), "Australia/Brisbane").date, -1)
  const windowEnd = addDays(windowStart, 40)
  const eventAt = (at: string, city = "Sydney", agent = "Mozilla/5.0 Chrome") => ({
    at,
    city,
    country: "Australia",
    device: "desktop" as const,
    browser: agent.includes("Chrome") ? ("Chrome" as const) : ("Other" as const),
    uniqueness: "unknown" as const,
    automated: /bot|curl/i.test(agent),
  })

  it("keeps Darwin and Townsville dates off Sydney daylight saving", () => {
    const summerSydney = zonedStamp("2026-01-15T13:30:00.000Z", "Australia/Sydney")
    const summerDarwin = zonedStamp("2026-01-15T13:30:00.000Z", "Australia/Darwin")
    const summerTownsville = zonedStamp("2026-01-15T13:30:00.000Z", "Australia/Brisbane")
    assert.equal(summerSydney.date, "2026-01-16")
    assert.equal(summerSydney.hour, 0)
    assert.equal(summerDarwin.date, "2026-01-15")
    assert.equal(summerDarwin.hour, 23)
    assert.equal(summerTownsville.date, "2026-01-15")
    assert.equal(summerTownsville.hour, 23)

    const winterSydney = zonedStamp("2026-07-15T14:00:00.000Z", "Australia/Sydney")
    const winterDarwin = zonedStamp("2026-07-15T14:00:00.000Z", "Australia/Darwin")
    const winterTownsville = zonedStamp("2026-07-15T14:00:00.000Z", "Australia/Brisbane")
    assert.equal(winterSydney.date, "2026-07-16")
    assert.equal(winterSydney.hour, 0)
    assert.equal(winterDarwin.date, "2026-07-15")
    assert.equal(winterDarwin.hour, 23)
    assert.equal(winterTownsville.date, "2026-07-16")
    assert.equal(winterTownsville.hour, 0)

    const beforeChange = zonedStamp("2026-10-03T15:30:00.000Z", "Australia/Sydney")
    const afterChange = zonedStamp("2026-10-03T16:30:00.000Z", "Australia/Sydney")
    assert.equal(beforeChange.date, "2026-10-04")
    assert.equal(beforeChange.hour, 1)
    assert.equal(afterChange.date, "2026-10-04")
    assert.equal(afterChange.hour, 3)
  })

  it("stores the scan on the campaign timezone day and keeps daily totals past the latest 30", async () => {
    const analytics = createMemoryAnalytics()
    const id = "23456789"
    await analytics.record(id, eventAt("2026-01-15T13:30:00.000Z", "Darwin"), undefined, "Australia/Darwin")
    const darwin = await analytics.report(id, "Australia/Darwin", "2026-01-15", "2026-01-16")
    assert.equal(darwin?.days.find((day) => day.date === "2026-01-15")?.scans, 1)
    assert.equal(darwin?.days.find((day) => day.date === "2026-01-16")?.scans, 0)
    assert.equal(darwin?.hours.find((hour) => hour.hour === 23)?.count, 1)
    assert.equal(darwin?.enquiries, "not-tracked")

    for (let index = 0; index < 35; index += 1) {
      const day = String((index % 28) + 1).padStart(2, "0")
      await analytics.record(
        id,
        eventAt(`2026-03-${day}T01:00:00.000Z`, "Darwin"),
        undefined,
        "Australia/Darwin",
      )
    }
    const stats = await analytics.get(id)
    const report = await analytics.report(id, "Australia/Darwin", "2026-01-01", "2026-03-31")
    assert.equal(stats?.recent.length, 30)
    assert.equal(report?.scans, 36)
    assert.equal(JSON.stringify(report).includes("token"), false)
  })

  it("counts a repeat only when the same campaign cookie comes back", async () => {
    const store = createMemoryStore()
    const analytics = createMemoryAnalytics()
    const created = await store.create({
      name: "=1+1",
      destination: "https://example.com/land",
      placeLabel: "+Townsville",
      timezone: "Australia/Brisbane",
    })
    const other = await store.create({ name: "Other cafe", destination: "https://example.com/other" })
    assert.equal(created.placeLabel, "+Townsville")
    assert.equal(created.timezone, "Australia/Brisbane")
    const saved = await store.update(created.id, {
      name: "=1+1",
      destination: "https://example.com/next",
      placeLabel: "+Townsville",
      timezone: "Australia/Brisbane",
    })
    assert.equal(saved?.id, created.id)
    assert.equal(trackingUrl(saved?.id ?? ""), trackingUrl(created.id))
    assert.equal(suggestedDestination("https://example.com/next", "=1+1")?.includes("utm_medium=qr"), true)
    assert.equal((await store.get(created.id))?.destination, "https://example.com/next")

    const first = await handleVisit(
      new Request(`https://qr.cupspace.com.au/c/${created.id}`, {
        headers: { "user-agent": "Mozilla/5.0 Chrome", "x-nf-client-connection-ip": "203.0.113.50" },
      }),
      store,
      analytics,
    )
    const issued = first.headers.get("set-cookie") ?? ""
    assert.match(issued, new RegExp(`cs_${created.id}=[2-9a-hj-km-np-z]{16}`))
    assert.match(issued, /HttpOnly/)
    assert.match(issued, /Secure/)
    assert.equal(issued.includes("203.0.113.50"), false)
    const token = issued.split(";")[0]?.split("=")[1] ?? ""
    const open = await analytics.report(created.id, "Australia/Brisbane", windowStart, windowEnd)
    assert.equal(open?.repeats, 0)
    assert.equal(open?.uniquenessUnknown, 1)
    assert.equal(open?.recognizedBrowsers, 0)
    assert.equal(JSON.stringify(open).includes(token), false)

    const repeat = await handleVisit(
      new Request(`https://qr.cupspace.com.au/c/${created.id}`, {
        headers: { cookie: `cs_${created.id}=${token}`, "user-agent": "Mozilla/5.0 Chrome" },
      }),
      store,
      analytics,
    )
    assert.equal(repeat.headers.get("set-cookie"), null)
    const again = await handleVisit(
      new Request(`https://qr.cupspace.com.au/c/${created.id}`, {
        headers: { cookie: `cs_${created.id}=${token}` },
      }),
      store,
      analytics,
    )
    assert.equal(again.status, 302)
    const recognized = await analytics.report(created.id, "Australia/Brisbane", windowStart, windowEnd)
    assert.equal(recognized?.scans, 3)
    assert.equal(recognized?.repeats, 2)
    assert.equal(recognized?.recognizedBrowsers, 1)
    assert.equal(recognized?.uniquenessUnknown, 1)

    const blocked = await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`),
      store,
      analytics,
    )
    assert.match(blocked.headers.get("set-cookie") ?? "", /cs_/)
    assert.equal((await analytics.report(created.id, "Australia/Brisbane", windowStart, windowEnd))?.recognizedBrowsers, 1)

    const spoof = "2222222222222222"
    await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`, { headers: { cookie: `cs_${created.id}=${spoof}` } }),
      store,
      analytics,
    )
    const stored = JSON.stringify(analytics.snapshot(created.id))
    assert.equal(stored.includes(spoof), false)
    assert.equal(stored.includes("203.0.113.50"), false)

    const crossed = await handleVisit(
      new Request(`http://127.0.0.1/c/${other.id}`, {
        headers: { cookie: `cs_${other.id}=${token}` },
      }),
      store,
      analytics,
    )
    assert.match(crossed.headers.get("set-cookie") ?? "", new RegExp(`cs_${other.id}=`))
    assert.equal((await analytics.report(other.id, "Australia/Sydney", windowStart, windowEnd))?.repeats, 0)

    const head = await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`, { method: "HEAD", headers: { cookie: `cs_${created.id}=${token}` } }),
      store,
      analytics,
    )
    assert.equal(head.headers.get("set-cookie"), null)
    assert.equal((await store.get(created.id))?.visits, 5)

    const expired = await analytics.record(
      created.id,
      eventAt("2027-01-15T00:00:00.000Z"),
      token,
      "Australia/Brisbane",
    )
    assert.ok(expired?.token)
    assert.notEqual(expired?.token, token)
  })

  it("labels a clear bot without removing it from the visit total", async () => {
    const store = createMemoryStore()
    const analytics = createMemoryAnalytics()
    const created = await store.create({ name: "Harbour", destination: "https://example.com/land" })
    const response = await handleVisit(
      new Request(`http://127.0.0.1/c/${created.id}`, { headers: { "user-agent": "Mozilla/5.0 Googlebot" } }),
      store,
      analytics,
    )
    assert.equal(response.status, 302)
    const report = await analytics.report(created.id, "Australia/Sydney", windowStart, windowEnd)
    assert.equal((await store.get(created.id))?.visits, 1)
    assert.equal(report?.scans, 1)
    assert.equal(report?.automated, 1)
    assert.equal(report?.recent[0]?.automated, true)
  })

  it("does not invent daily history for scans saved before reporting", async () => {
    const id = "abcdefgh"
    let raw: unknown = {
      recorded: 3,
      recent: [
        {
          at: "2026-01-01T00:00:00.000Z",
          city: "Sydney",
          country: "Australia",
          device: "desktop",
          browser: "Chrome",
        },
      ],
      countries: { Australia: 3 },
      devices: { desktop: 3 },
      browsers: { Chrome: 3 },
    }
    const analytics = createBlobsAnalyticsStore({
      async getWithMetadata() {
        return { data: raw, etag: "1" }
      },
      async setJSON() {
        return { modified: true }
      },
      async delete() {
        raw = null
      },
      async list() {
        return [`analytics/${id}`]
      },
    })
    const report = await analytics.report(id, "Australia/Sydney", "2026-01-01", "2026-01-02")
    assert.equal(report?.scans, 0)
    assert.equal(report?.recognizedBrowsers, 0)
    assert.equal(report?.recent[0]?.uniqueness, "unknown")
    assert.equal(report?.recent[0]?.city, "Sydney")
    assert.equal((await analytics.get(id))?.recorded, 3)
  })

  it("requires sign-in, rejects bad ranges, and escapes CSV formulas", async () => {
    const deps = app()
    const analytics = createMemoryAnalytics()
    deps.analytics = analytics
    const created = await deps.store.create({
      name: `=1+1,"quoted"`,
      destination: "https://example.com/land",
      placeLabel: "+cmd",
      timezone: "Australia/Darwin",
    })
    await analytics.record(created.id, eventAt("2026-11-06T01:00:00.000Z", "Darwin"), undefined, "Australia/Darwin")

    assert.equal((await api(deps, `/api/campaigns/${created.id}/report`)).status, 401)
    assert.equal((await api(deps, `/api/campaigns/${created.id}/report.csv`)).status, 401)

    const signedIn = await api(deps, "/api/login", {
      method: "POST",
      body: JSON.stringify({ password: PASSWORD }),
    })
    const header = cookieHeader(signedIn)
    const backwards = await api(deps, `/api/campaigns/${created.id}/report?from=2026-11-06&to=2026-11-01`, {
      headers: { cookie: header },
    })
    assert.equal(backwards.status, 400)
    const impossible = await api(deps, `/api/campaigns/${created.id}/report?from=2026-02-31&to=2026-03-01`, {
      headers: { cookie: header },
    })
    assert.equal(impossible.status, 400)
    const huge = await api(deps, `/api/campaigns/${created.id}/report?from=2020-01-01&to=2026-01-01`, {
      headers: { cookie: header },
    })
    assert.equal(huge.status, 400)

    const csv = await api(deps, `/api/campaigns/${created.id}/report.csv?from=2026-11-01&to=2026-11-06`, {
      headers: { cookie: header },
    })
    assert.equal(csv.status, 200)
    assert.match(csv.headers.get("content-type") ?? "", /text\/csv/)
    const text = await csv.text()
    assert.match(text, /"'=1\+1,""quoted"""/)
    assert.match(text, /"'\+cmd"/)
    assert.equal(text.includes("not connected"), true)
    assert.equal(text.split("\n").some((row) => row.startsWith("=")), false)
    const report = await api(deps, `/api/campaigns/${created.id}/report?from=2026-11-06&to=2026-11-06`, {
      headers: { cookie: header },
    })
    const body = await report.json()
    assert.equal(body.report.scans, 1)
    assert.equal(body.report.enquiries, "not-tracked")
    assert.equal(body.report.cities[0].label, "Darwin")
    assert.equal(JSON.stringify(body).includes("203.0.113"), false)
  })

  it("keeps concurrent repeat cookies to one recognized browser", async () => {
    const analytics = createMemoryAnalytics()
    const id = "23456789"
    const first = await analytics.record(id, eventAt("2026-11-06T00:00:00.000Z"), undefined, "Australia/Sydney")
    await Promise.all(
      Array.from({ length: 10 }, () =>
        analytics.record(id, eventAt("2026-11-06T01:00:00.000Z"), first?.token, "Australia/Sydney"),
      ),
    )
    const report = await analytics.report(id, "Australia/Sydney", "2026-11-06", "2026-11-06")
    assert.equal(report?.scans, 11)
    assert.equal(report?.repeats, 10)
    assert.equal(report?.recognizedBrowsers, 1)
  })
})

describe("qr image", () => {
  it("decodes a high-resolution PNG to the public tracking URL", async () => {
    const png = await qrPng("23456789")
    assert.equal(decodePng(png), `${PUBLIC_ORIGIN}/c/23456789`)
    const svg = await qrSvg("23456789")
    assert.equal(svg.toLowerCase().includes("emet"), false)
  })
})
