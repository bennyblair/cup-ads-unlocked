import { emptyLead, type DashboardRequest, type Lead, type SendStat } from "./model"

export const NOTION_VERSION = "2025-09-03"

export const DATA_SOURCES = {
  pipeline: "423f6a93-3cf6-8125-b13c-000b01672973",
  sendStats: "423f6a93-3cf6-8145-a846-000bee657fed",
  requests: "423f6a93-3cf6-8112-a86e-000b857c39ec",
} as const

const UUID = /^[0-9a-f]{32}$/i

export const normalizePageId = (value: string) => {
  const raw = value.replace(/-/g, "").toLowerCase()
  if (!UUID.test(raw)) return ""
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`
}

export type NotionProperty = {
  type?: unknown
  title?: unknown
  rich_text?: unknown
  email?: unknown
  phone_number?: unknown
  select?: unknown
  date?: unknown
  number?: unknown
  relation?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const clip = (value: string, max: number) => value.replace(/\u0000/g, "").slice(0, max)

const plain = (value: unknown, max: number) => {
  if (!Array.isArray(value)) return ""
  const text = value
    .map((item) => (isRecord(item) && typeof item.plain_text === "string" ? item.plain_text : ""))
    .join("")
  return clip(text.trim(), max)
}

const property = (properties: Record<string, unknown>, name: string): NotionProperty => {
  const value = properties[name]
  return isRecord(value) ? (value as NotionProperty) : {}
}

export const readTitle = (prop: NotionProperty) => plain(prop.title, 500)

export const readRich = (prop: NotionProperty) => plain(prop.rich_text, 5000)

export const readEmail = (prop: NotionProperty) =>
  typeof prop.email === "string" ? clip(prop.email.trim(), 320) : ""

export const readPhone = (prop: NotionProperty) =>
  typeof prop.phone_number === "string" ? clip(prop.phone_number.trim(), 40) : ""

export const readSelect = (prop: NotionProperty) => {
  if (!isRecord(prop.select)) return ""
  const name = prop.select.name
  return typeof name === "string" ? clip(name.trim(), 120) : ""
}

export const readDate = (prop: NotionProperty) => {
  if (!isRecord(prop.date)) return ""
  const start = prop.date.start
  return typeof start === "string" ? clip(start.trim(), 40) : ""
}

export const readNumber = (prop: NotionProperty) => {
  const value = prop.number
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return value < 0 ? 0 : value
}

export const readRelationId = (prop: NotionProperty) => {
  if (!Array.isArray(prop.relation)) return ""
  for (const item of prop.relation) {
    if (!isRecord(item) || typeof item.id !== "string") continue
    const id = normalizePageId(item.id)
    if (id) return id
  }
  return ""
}

const propertiesOf = (page: Record<string, unknown>) =>
  isRecord(page.properties) ? page.properties : {}

export const mapLead = (page: unknown): Lead | null => {
  if (!isRecord(page) || typeof page.id !== "string") return null
  if (typeof page.object === "string" && page.object !== "page") return null
  const id = normalizePageId(page.id)
  if (!id) return null
  const props = propertiesOf(page)
  const lead = emptyLead(id, readTitle(property(props, "Name")) || "Untitled")
  lead.business = readRich(property(props, "Business"))
  lead.role = readRich(property(props, "Role"))
  lead.email = readEmail(property(props, "Email"))
  lead.phone = readPhone(property(props, "Phone (mobile)"))
  lead.suburb = readRich(property(props, "Area/suburb"))
  lead.state = readSelect(property(props, "State"))
  lead.sector = readRich(property(props, "Sector"))
  lead.inbox = readSelect(property(props, "CupSpace inbox"))
  lead.persona = readSelect(property(props, "Persona"))
  lead.stage = readSelect(property(props, "Stage"))
  lead.nextAction = readSelect(property(props, "Next action"))
  lead.waitingOn = readSelect(property(props, "Waiting on"))
  lead.nextActionDue = readDate(property(props, "Next action due"))
  lead.lastInbound = readDate(property(props, "Last inbound date"))
  lead.lastOutbound = readDate(property(props, "Last outbound date"))
  lead.lastContactBy = readRich(property(props, "Last contact by"))
  lead.threadSubject = readRich(property(props, "Thread subject"))
  lead.latestSummary = readRich(property(props, "Latest summary"))
  lead.valuePackage = readRich(property(props, "Value/package"))
  lead.notes = readRich(property(props, "Notes"))
  lead.sourceMessageId = readRich(property(props, "Source message id/UID"))
  lead.syncKey = readRich(property(props, "Sync key"))
  return lead
}

export const mapSendStat = (page: unknown): SendStat | null => {
  if (!isRecord(page) || typeof page.id !== "string") return null
  if (typeof page.object === "string" && page.object !== "page") return null
  const id = normalizePageId(page.id)
  if (!id) return null
  const props = propertiesOf(page)
  return {
    id,
    key: readTitle(property(props, "Key")),
    date: readDate(property(props, "Date")),
    inbox: readSelect(property(props, "Inbox")),
    sent: readNumber(property(props, "Sent count")),
    bounces: readNumber(property(props, "Bounces")),
    replies: readNumber(property(props, "Replies")),
  }
}

export const mapRequest = (page: unknown): DashboardRequest | null => {
  if (!isRecord(page) || typeof page.id !== "string") return null
  if (typeof page.object === "string" && page.object !== "page") return null
  const id = normalizePageId(page.id)
  if (!id) return null
  const props = propertiesOf(page)
  return {
    id,
    instruction: readTitle(property(props, "Instruction")) || "Untitled",
    leadId: readRelationId(property(props, "Lead")),
    status: readSelect(property(props, "Status")),
    submittedAt: readDate(property(props, "Submitted at")),
    botResponse: readRich(property(props, "Bot response")),
    completedAt: readDate(property(props, "Completed at")),
  }
}

export type RequestDraft = {
  instruction: string
  leadId?: string
  submittedAt: string
  dataSourceId?: string
}

export const buildRequestCreateBody = ({
  instruction,
  leadId,
  submittedAt,
  dataSourceId = DATA_SOURCES.requests,
}: RequestDraft) => {
  const properties: Record<string, unknown> = {
    Instruction: {
      title: [{ type: "text", text: { content: instruction } }],
    },
    Status: { select: { name: "New" } },
    "Submitted at": { date: { start: submittedAt } },
  }
  if (leadId) properties.Lead = { relation: [{ id: leadId }] }
  return {
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties,
  }
}
