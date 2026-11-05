import assert from "node:assert/strict"
import { before, describe, it } from "node:test"

import { PNG } from "pngjs"
import jsQR from "jsqr"

import { parseCampaign, PUBLIC_ORIGIN, trackingUrl } from "../src/shared/campaign"
import { normalizeDestination, normalizeName } from "../src/shared/destination"
import { decideGate } from "../src/shared/gate"
import { hasValidSession, issueSessionToken, passwordMatches } from "../src/shared/session"
import { createBlobsCampaignStore, blobStoreName, type BlobClient } from "../src/server/blobs-store"
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

const app = (store = createMemoryStore(), limiter = createLoginLimiter()) =>
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

    assert.equal((await api(deps, `/api/campaigns/${campaign.id}`, { method: "DELETE", headers: { cookie: header } })).status, 200)
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

describe("qr image", () => {
  it("decodes a high-resolution PNG to the public tracking URL", async () => {
    const png = await qrPng("23456789")
    assert.equal(decodePng(png), `${PUBLIC_ORIGIN}/c/23456789`)
    const svg = await qrSvg("23456789")
    assert.equal(svg.toLowerCase().includes("emet"), false)
  })
})
