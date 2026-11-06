import { normalizeDestination, normalizeName, normalizePlaceLabel } from "./destination"
import { isCampaignTimezone, type CampaignTimezone } from "./timezone"

export const PUBLIC_ORIGIN = "https://qr.cupspace.com.au"
export const CAMPAIGN_ID_PATTERN = /^[2-9a-hj-km-np-z]{8}$/
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"

export type Campaign = {
  id: string
  name: string
  destination: string
  visits: number
  createdAt: string
  placeLabel?: string
  timezone?: CampaignTimezone
}

export const isCampaignId = (value: string) =>
  CAMPAIGN_ID_PATTERN.test(value) && !value.includes("emet")

export const trackingUrl = (id: string) => {
  if (!isCampaignId(id)) throw new Error("Invalid campaign id.")
  const url = `${PUBLIC_ORIGIN}/c/${id}`
  const lower = url.toLowerCase()
  if (
    lower.includes("emet") ||
    lower.includes("bit.ly") ||
    lower.includes("tinyurl") ||
    lower.includes("t.co/")
  ) {
    throw new Error("Refusing to encode a third-party tracking URL.")
  }
  return url
}

export const createCampaignId = (existing: ReadonlySet<string>) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(8))
    const id = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("")
    if (!existing.has(id) && isCampaignId(id)) return id
  }
  throw new Error("Could not allocate a campaign id.")
}

export class StoreError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "StoreError"
    this.status = status
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export const parseCampaign = (input: unknown, status = 400): Campaign => {
  if (!isRecord(input)) throw new StoreError("A campaign record is invalid.", status)

  const { id, name, destination, visits, createdAt } = input
  if (typeof id !== "string" || !isCampaignId(id)) {
    throw new StoreError("A campaign id is invalid.", status)
  }

  const parsedName = normalizeName(typeof name === "string" ? name : "")
  if (!parsedName.ok) throw new StoreError(parsedName.error, status)

  const parsedDestination = normalizeDestination(
    typeof destination === "string" ? destination : "",
  )
  if (!parsedDestination.ok) throw new StoreError(parsedDestination.error, status)

  if (
    typeof visits !== "number" ||
    !Number.isInteger(visits) ||
    visits < 0 ||
    visits > Number.MAX_SAFE_INTEGER
  ) {
    throw new StoreError("A visit count is invalid.", status)
  }

  if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) {
    throw new StoreError("A created date is invalid.", status)
  }
  if (new Date(createdAt).toISOString() !== createdAt) {
    throw new StoreError("A created date is invalid.", status)
  }

  const campaign: Campaign = {
    id,
    name: parsedName.value,
    destination: parsedDestination.value,
    visits,
    createdAt,
  }
  if (typeof input.placeLabel === "string") {
    const label = normalizePlaceLabel(input.placeLabel)
    if (label.ok && label.value) campaign.placeLabel = label.value
  }
  if (typeof input.timezone === "string" && isCampaignTimezone(input.timezone)) {
    campaign.timezone = input.timezone
  }
  return campaign
}

export const cloneCampaign = (campaign: Campaign): Campaign => {
  const clone: Campaign = {
    id: campaign.id,
    name: campaign.name,
    destination: campaign.destination,
    visits: campaign.visits,
    createdAt: campaign.createdAt,
  }
  if (campaign.placeLabel) clone.placeLabel = campaign.placeLabel
  if (campaign.timezone) clone.timezone = campaign.timezone
  return clone
}
