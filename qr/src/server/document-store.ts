import {
  cloneCampaign,
  createCampaignId,
  parseCampaign,
  StoreError,
  type Campaign,
} from "../shared/campaign"
import { normalizeDestination, normalizeName, normalizePlaceLabel } from "../shared/destination"
import { isCampaignTimezone } from "../shared/timezone"

export type VisitResult =
  | { status: "counted"; destination: string; visits: number }
  | { status: "missing" }
  | { status: "failed"; destination: string | null }

export type CampaignDraft = {
  name: string
  destination: string
  placeLabel?: string
  timezone?: string
}

const applyOptional = (campaign: Campaign, input: CampaignDraft) => {
  const next = cloneCampaign(campaign)
  if ("placeLabel" in input) {
    const label = normalizePlaceLabel(input.placeLabel ?? "")
    if (!label.ok) throw new StoreError(label.error)
    if (label.value) next.placeLabel = label.value
    else delete next.placeLabel
  }
  if ("timezone" in input) {
    if (!input.timezone) delete next.timezone
    else if (isCampaignTimezone(input.timezone)) next.timezone = input.timezone
    else throw new StoreError("Choose a campaign timezone.")
  }
  return next
}

export type CampaignStore = {
  list(): Promise<Campaign[]>
  get(id: string): Promise<Campaign | null>
  create(input: CampaignDraft): Promise<Campaign>
  update(id: string, input: CampaignDraft): Promise<Campaign | null>
  delete(id: string): Promise<boolean>
  incrementVisits(id: string): Promise<VisitResult>
  replaceAll(campaigns: unknown[]): Promise<Campaign[]>
}

type Document = { campaigns: Campaign[]; etag: string | null }

const MAX_CAMPAIGNS = 2000
const MAX_ATTEMPTS = 80

const sortCampaigns = (campaigns: Campaign[]) =>
  campaigns
    .map(cloneCampaign)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt) || first.id.localeCompare(second.id))

export const createDocumentStore = (
  read: () => Promise<Document>,
  write: (campaigns: Campaign[], etag: string | null) => Promise<boolean>,
): CampaignStore => {
  // One Node process can serve many scans at once. Queue them here so they
  // do not all read the same version. Compare-and-swap still covers races
  // between separate server instances.
  let tail: Promise<void> = Promise.resolve()
  const exclusive = <T>(operation: () => Promise<T>) => {
    const run = tail.then(operation, operation)
    tail = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }

  const mutate = async <T>(
    change: (campaigns: Campaign[]) => { campaigns: Campaign[]; result: T; changed: boolean },
  ): Promise<T> =>
    exclusive(async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const current = await read()
        const outcome = change(current.campaigns.map(cloneCampaign))
        if (!outcome.changed) return outcome.result
        const saved = await write(outcome.campaigns.map(cloneCampaign), current.etag)
        if (saved) return outcome.result
      }
      throw new StoreError("Campaigns were updated at the same time. Try again.", 503)
    })

  return {
    async list() {
      const { campaigns } = await read()
      return sortCampaigns(campaigns)
    },

    async get(id) {
      const { campaigns } = await read()
      return campaigns.find((campaign) => campaign.id === id) ?? null
    },

    async create(input) {
      const name = normalizeName(input.name)
      const destination = normalizeDestination(input.destination)
      if (!name.ok) throw new StoreError(name.error)
      if (!destination.ok) throw new StoreError(destination.error)

      return mutate((campaigns) => {
        if (campaigns.length >= MAX_CAMPAIGNS) {
          throw new StoreError("Campaign limit reached. Delete an old campaign first.")
        }
        const campaign = applyOptional(
          {
            id: createCampaignId(new Set(campaigns.map((item) => item.id))),
            name: name.value,
            destination: destination.value,
            visits: 0,
            createdAt: new Date().toISOString(),
          },
          input,
        )
        return { campaigns: [campaign, ...campaigns], result: campaign, changed: true }
      })
    },

    async update(id, input) {
      const name = normalizeName(input.name)
      const destination = normalizeDestination(input.destination)
      if (!name.ok) throw new StoreError(name.error)
      if (!destination.ok) throw new StoreError(destination.error)

      return mutate((campaigns) => {
        const index = campaigns.findIndex((campaign) => campaign.id === id)
        if (index === -1) return { campaigns, result: null, changed: false }
        const updated = applyOptional(
          {
            ...campaigns[index],
            name: name.value,
            destination: destination.value,
          },
          input,
        )
        const next = campaigns.slice()
        next[index] = updated
        return { campaigns: next, result: updated, changed: true }
      })
    },

    async delete(id) {
      return mutate((campaigns) => {
        const next = campaigns.filter((campaign) => campaign.id !== id)
        if (next.length === campaigns.length) return { campaigns, result: false, changed: false }
        return { campaigns: next, result: true, changed: true }
      })
    },

    async incrementVisits(id) {
      try {
        return await mutate((campaigns) => {
          const index = campaigns.findIndex((campaign) => campaign.id === id)
          if (index === -1) return { campaigns, result: { status: "missing" } as VisitResult, changed: false }
          const current = campaigns[index]
          const visits =
            current.visits >= Number.MAX_SAFE_INTEGER ? current.visits : current.visits + 1
          const next = campaigns.slice()
          next[index] = { ...current, visits }
          return {
            campaigns: next,
            result: {
              status: "counted",
              destination: current.destination,
              visits,
            } satisfies VisitResult,
            changed: visits !== current.visits,
          }
        })
      } catch (error) {
        if (error instanceof StoreError && error.status === 503) {
          const current = await read().catch(() => null)
          const campaign = current?.campaigns.find((item) => item.id === id) ?? null
          return { status: "failed", destination: campaign?.destination ?? null }
        }
        throw error
      }
    },

    async replaceAll(incoming) {
      const campaigns = incoming.map((campaign) => parseCampaign(campaign))
      const ids = new Set<string>()
      for (const campaign of campaigns) {
        if (ids.has(campaign.id)) throw new StoreError("Backup contains a duplicate campaign id.")
        ids.add(campaign.id)
      }
      if (campaigns.length > MAX_CAMPAIGNS) {
        throw new StoreError("That backup has too many campaigns.")
      }

      await mutate(() => ({ campaigns, result: true, changed: true }))
      return sortCampaigns(campaigns)
    },
  }
}
