export type CampaignView = {
  id: string
  name: string
  destination: string
  visits: number
  createdAt: string
  trackingUrl: string
}

export class AuthError extends Error {
  constructor() {
    super("Sign in required.")
    this.name = "AuthError"
  }
}

const parseJson = async (response: Response) => {
  const type = response.headers.get("content-type") ?? ""
  if (!type.includes("json")) return null
  return (await response.json()) as { error?: unknown; campaigns?: CampaignView[]; campaign?: CampaignView; ok?: boolean }
}

const request = async (path: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers)
  headers.set("x-cupspace-qr", "1")
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json")

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
  })
  const body = await parseJson(response)
  if (response.status === 401) throw new AuthError()
  if (!response.ok) {
    const message = body && typeof body.error === "string" ? body.error : "Request failed."
    throw new Error(message)
  }
  return body
}

export const login = (password: string) =>
  request("/api/login", { method: "POST", body: JSON.stringify({ password }) })

export const logout = () => request("/api/logout", { method: "POST" })

export const listCampaigns = async () => {
  const body = await request("/api/campaigns")
  return body?.campaigns ?? []
}

export const createCampaign = async (input: { name: string; destination: string }) => {
  const body = await request("/api/campaigns", { method: "POST", body: JSON.stringify(input) })
  if (!body?.campaign) throw new Error("Campaign was not created.")
  return body.campaign
}

export const updateCampaign = async (id: string, input: { name: string; destination: string }) => {
  const body = await request(`/api/campaigns/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  if (!body?.campaign) throw new Error("Campaign was not updated.")
  return body.campaign
}

export const deleteCampaign = (id: string) => request(`/api/campaigns/${id}`, { method: "DELETE" })

export const downloadQr = async (campaign: CampaignView, format: "svg" | "png") => {
  const response = await fetch(`/api/campaigns/${campaign.id}/qr.${format}`, {
    credentials: "same-origin",
    headers: { "x-cupspace-qr": "1" },
  })
  if (response.status === 401) throw new AuthError()
  if (!response.ok) throw new Error("Could not download the QR code.")
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `cupspace-${campaign.id}.${format}`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const downloadBackup = async () => {
  const response = await fetch("/api/export", {
    credentials: "same-origin",
    headers: { "x-cupspace-qr": "1" },
  })
  if (response.status === 401) throw new AuthError()
  if (!response.ok) throw new Error("Could not download the backup.")
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "cupspace-qr-backup.json"
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const restoreBackup = async (campaigns: unknown[]) => {
  const body = await request("/api/import", {
    method: "POST",
    body: JSON.stringify({ confirm: "REPLACE ALL CAMPAIGNS", campaigns }),
  })
  return body?.campaigns ?? []
}
