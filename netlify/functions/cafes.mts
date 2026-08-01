import { timingSafeEqual } from "node:crypto"

import type { NetlifyFunction } from "@netlify/functions"

import {
  getCafeRecord,
  listCafeRecords,
  moveCafeRecord,
} from "./_lib/cafe-store"

const jsonResponse = (body: unknown, status = 200, cacheControl = "no-store") =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": cacheControl,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })

const getAdminPin = () => globalThis.Netlify?.env.get("CUPSPACE_ADMIN_PIN") ?? ""

const pinsMatch = (provided: string, expected: string) => {
  if (!provided || !expected || expected.length < 12) {
    return false
  }

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  )
}

const isAdminRequest = (request: Request) => {
  const expectedPin = getAdminPin()
  const providedPin = request.headers.get("x-cupspace-admin-pin") ?? ""

  return pinsMatch(providedPin, expectedPin)
}

const validCafeId = (value: unknown): value is string =>
  typeof value === "string" && /^cafe-[a-z0-9-]+$/.test(value)

const fetchHandler = async (request: Request) => {
  const url = new URL(request.url)
  const wantsAdminView = url.searchParams.get("view") === "admin"

  if (request.method === "GET" && !wantsAdminView) {
    const approved = await listCafeRecords("approved")
    return jsonResponse(
      { cafes: approved.map((record) => record.publicLocation) },
      200,
      "public, max-age=60, stale-while-revalidate=300",
    )
  }

  if (!isAdminRequest(request)) {
    return jsonResponse({ error: "Invalid admin PIN." }, 401)
  }

  if (request.method === "GET") {
    const [pending, approved] = await Promise.all([
      listCafeRecords("pending"),
      listCafeRecords("approved"),
    ])

    return jsonResponse({ pending, approved })
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405)
  }

  const body = (await request.json().catch(() => null)) as {
    id?: unknown
    action?: unknown
  } | null

  if (!body || !validCafeId(body.id)) {
    return jsonResponse({ error: "Invalid café record." }, 400)
  }

  if (body.action === "approve" || body.action === "reject") {
    const record = await getCafeRecord("pending", body.id)
    if (!record) {
      return jsonResponse({ error: "Pending café not found." }, 404)
    }

    const updated = await moveCafeRecord({
      record,
      from: "pending",
      to: body.action === "approve" ? "approved" : "rejected",
    })

    return jsonResponse({ record: updated })
  }

  if (body.action === "unpublish") {
    const record = await getCafeRecord("approved", body.id)
    if (!record) {
      return jsonResponse({ error: "Approved café not found." }, 404)
    }

    const updated = await moveCafeRecord({
      record,
      from: "approved",
      to: "pending",
    })

    return jsonResponse({ record: updated })
  }

  return jsonResponse({ error: "Invalid café action." }, 400)
}

export default {
  fetch: fetchHandler,
  config: {
    path: "/api/cafes",
    method: ["GET", "POST"],
  },
} satisfies NetlifyFunction
