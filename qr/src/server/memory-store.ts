import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs"
import { dirname } from "node:path"

import { parseCampaign, type Campaign } from "../shared/campaign"
import { createDocumentStore } from "./document-store"

const parseFile = (raw: string): Campaign[] => {
  const parsed = JSON.parse(raw) as unknown
  const campaigns = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { campaigns?: unknown }).campaigns)
      ? (parsed as { campaigns: unknown[] }).campaigns
      : null
  if (!campaigns) throw new Error("Local campaign file is not valid.")
  return campaigns.map((campaign) => parseCampaign(campaign, 500))
}

export const createMemoryStore = (filePath?: string) => {
  let version = 0
  let etag: string | null = null
  let campaigns: Campaign[] = []

  if (filePath && existsSync(filePath)) {
    campaigns = parseFile(readFileSync(filePath, "utf8"))
    version = 1
    etag = "1"
  }

  const persist = (next: Campaign[]) => {
    if (!filePath) return
    mkdirSync(dirname(filePath), { recursive: true })
    const temporary = `${filePath}.${process.pid}.tmp`
    writeFileSync(temporary, `${JSON.stringify({ campaigns: next }, null, 2)}\n`)
    renameSync(temporary, filePath)
  }

  return createDocumentStore(
    async () => {
      await Promise.resolve()
      return { campaigns, etag }
    },
    async (next, expected) => {
      await Promise.resolve()
      if (etag !== expected) return false
      const previousCampaigns = campaigns
      const previousVersion = version
      const previousEtag = etag
      version += 1
      etag = String(version)
      campaigns = next
      try {
        persist(next)
      } catch (error) {
        campaigns = previousCampaigns
        version = previousVersion
        etag = previousEtag
        throw error
      }
      return true
    },
  )
}
