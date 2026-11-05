import { getStore } from "@netlify/blobs"

import { parseCampaign, StoreError, type Campaign } from "../shared/campaign"
import { createDocumentStore, type CampaignStore } from "./document-store"

export const PRODUCTION_STORE = "cupspace-qr"
const DOCUMENT_KEY = "campaigns"

export type BlobClient = {
  getWithMetadata(
    key: string,
    options: { type: "json"; consistency: "strong" },
  ): Promise<{ data: unknown; etag?: string } | null>
  setJSON(
    key: string,
    data: unknown,
    options: { onlyIfMatch?: string; onlyIfNew?: boolean },
  ): Promise<{ modified: boolean }>
  delete(key: string): Promise<void>
  list(prefix: string): Promise<string[]>
}

export const blobStoreName = (context = process.env.CONTEXT) => {
  if (!context || context === "production") return PRODUCTION_STORE
  const safe = context.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40)
  return `${PRODUCTION_STORE}-${safe || "preview"}`
}

const parseDocument = (data: unknown): Campaign[] => {
  if (!data || typeof data !== "object" || !Array.isArray((data as { campaigns?: unknown }).campaigns)) {
    throw new StoreError("Stored campaign data is not in the expected format.", 500)
  }
  return (data as { campaigns: unknown[] }).campaigns.map((campaign) => parseCampaign(campaign, 500))
}

export const createBlobsCampaignStore = (client: BlobClient): CampaignStore =>
  createDocumentStore(
    async () => {
      const result = await client.getWithMetadata(DOCUMENT_KEY, {
        type: "json",
        consistency: "strong",
      })
      if (!result || result.data == null) return { campaigns: [], etag: null }
      return { campaigns: parseDocument(result.data), etag: result.etag ?? null }
    },
    async (campaigns, etag) => {
      const payload = { campaigns }
      if (!etag) {
        const created = await client.setJSON(DOCUMENT_KEY, payload, { onlyIfNew: true })
        return created.modified
      }
      const updated = await client.setJSON(DOCUMENT_KEY, payload, { onlyIfMatch: etag })
      return updated.modified
    },
  )

export const netlifyCampaignStore = () => {
  const store = getStore({
    name: blobStoreName(),
    consistency: "strong",
  })
  return createBlobsCampaignStore({
    getWithMetadata: (key, options) => store.getWithMetadata(key, options),
    setJSON: (key, data, options) =>
      options.onlyIfMatch
        ? store.setJSON(key, data, { onlyIfMatch: options.onlyIfMatch })
        : store.setJSON(key, data, { onlyIfNew: true }),
    delete: (key) => store.delete(key),
    list: async (prefix) => {
      const listed = await store.list({ prefix })
      return listed.blobs.map((blob) => blob.key)
    },
  })
}
