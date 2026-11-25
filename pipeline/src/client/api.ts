import type { DashboardPayload, DashboardRequest } from "../shared/model"

export class AuthError extends Error {
  constructor() {
    super("Sign in required.")
    this.name = "AuthError"
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readJson = async (response: Response) => {
  const type = response.headers.get("content-type") ?? ""
  if (!type.includes("json")) return null
  return (await response.json()) as unknown
}

const request = async (path: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers)
  headers.set("x-cupspace-pipeline", "1")
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json")

  const response = await fetch(path, { ...init, headers, credentials: "same-origin" })
  const body = await readJson(response)
  if (response.status === 401) throw new AuthError()
  if (!response.ok) {
    const message = isRecord(body) && typeof body.error === "string" ? body.error : "Request failed."
    throw new Error(message)
  }
  return body
}

export const login = (password: string) =>
  request("/api/login", { method: "POST", body: JSON.stringify({ password }) })

export const logout = () => request("/api/logout", { method: "POST" })

export const loadDashboard = async (refresh = false) =>
  (await request(refresh ? "/api/dashboard?refresh=1" : "/api/dashboard")) as DashboardPayload

export const createRequest = async (instruction: string, leadId?: string) =>
  (await request("/api/requests", {
    method: "POST",
    body: JSON.stringify(leadId ? { instruction, leadId } : { instruction }),
  })) as { request: DashboardRequest; mode: DashboardPayload["mode"] }
