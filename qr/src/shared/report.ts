import type { ScanEvent } from "./scan"
import type { CampaignTimezone } from "./timezone"

export type ScanReport = {
  timezone: CampaignTimezone
  from: string
  to: string
  scans: number
  repeats: number
  uniquenessUnknown: number
  recognizedBrowsers: number
  automated: number
  days: { date: string; scans: number; repeats: number; unknown: number; recognized: number; automated: number }[]
  weekdays: { label: string; count: number }[]
  hours: { hour: number; count: number }[]
  cities: { label: string; count: number }[]
  devices: { label: string; count: number }[]
  browsers: { label: string; count: number }[]
  recent: ScanEvent[]
  enquiries: "not-tracked"
}
