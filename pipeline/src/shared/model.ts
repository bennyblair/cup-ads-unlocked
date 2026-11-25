export const STAGES = [
  "Cold sent",
  "Replied",
  "Interested",
  "Needs pricing",
  "Pricing sent",
  "Call needed",
  "Negotiating",
  "Won",
  "Active campaign",
  "Hold",
  "Lost/Declined",
  "Do not contact",
] as const

export const PERSONAS = ["Ben", "Josh", "Dan", "Jess", "Amy"] as const

export const NEXT_ACTIONS = ["Send pricing", "Reply", "Call", "Follow up", "Wait", "None"] as const

export const WAITING_ON = ["Us", "Them", "None"] as const

export const REQUEST_STATUSES = ["New", "In progress", "Needs Ben", "Done", "Rejected"] as const

export const ACTION_TABS = ["Send pricing", "Reply", "Call", "Follow up"] as const

export type ActionTab = (typeof ACTION_TABS)[number]

export const INBOXES = [
  "info@cupspace.com.au",
  "josh@cupspace.com.au",
  "dan@cupspace.com.au",
  "ben@cupspacehq.com.au",
  "josh@cupspacehq.com.au",
  "dan@cupspacehq.com.au",
  "ben@gocupspace.com.au",
  "josh@gocupspace.com.au",
  "dan@gocupspace.com.au",
  "ben@cupspaceau.com.au",
  "josh@cupspaceau.com.au",
  "dan@cupspaceau.com.au",
] as const

export const CLOSED_STAGES = ["Lost/Declined", "Do not contact"] as const
export const PAUSED_STAGE = "Hold"

export type Lead = {
  id: string
  name: string
  business: string
  role: string
  email: string
  phone: string
  suburb: string
  state: string
  sector: string
  inbox: string
  persona: string
  stage: string
  nextAction: string
  waitingOn: string
  nextActionDue: string
  lastInbound: string
  lastOutbound: string
  lastContactBy: string
  threadSubject: string
  latestSummary: string
  valuePackage: string
  notes: string
  sourceMessageId: string
  syncKey: string
}

export type SendStat = {
  id: string
  key: string
  date: string
  inbox: string
  sent: number
  bounces: number
  replies: number
}

export type DashboardRequest = {
  id: string
  instruction: string
  leadId: string
  status: string
  submittedAt: string
  botResponse: string
  completedAt: string
}

export type InboxWindow = {
  days: number
  rows: { inbox: string; sent: number; bounces: number; replies: number; replyRate: number }[]
  totals: { sent: number; bounces: number; replies: number; replyRate: number }
  trend: { date: string; sent: number; bounces: number; replies: number }[]
}

export type Overview = {
  timezone: "Australia/Sydney"
  today: string
  counts: {
    waitingOnUs: number
    callsDue: number
    pricingToSend: number
    repliesNeeded: number
    followUpsDue: number
    activeCampaigns: number
    won: number
  }
  windows: InboxWindow[]
}

export type DashboardMode = "live" | "example"

export type DashboardPayload = {
  mode: DashboardMode
  syncedAt: string
  stale: boolean
  warning: string | null
  leads: Lead[]
  requests: DashboardRequest[]
  overview: Overview
}

export const emptyLead = (id: string, name: string): Lead => ({
  id,
  name,
  business: "",
  role: "",
  email: "",
  phone: "",
  suburb: "",
  state: "",
  sector: "",
  inbox: "",
  persona: "",
  stage: "",
  nextAction: "",
  waitingOn: "",
  nextActionDue: "",
  lastInbound: "",
  lastOutbound: "",
  lastContactBy: "",
  threadSubject: "",
  latestSummary: "",
  valuePackage: "",
  notes: "",
  sourceMessageId: "",
  syncKey: "",
})
