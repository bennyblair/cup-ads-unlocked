import { buildCafeApplicationRecord } from "@/lib/cafe-record"
import type {
  AdminCafesResponse,
  CafeApplicationRecord,
  PublicCafeLocation,
  PublicCafesResponse,
} from "@/types/cafes"

const developmentStorageKey = "cupspace-development-cafe-applications"
export const developmentAdminPin = "cupspace-preview"
export const cafesUpdatedEvent = "cupspace:cafes-updated"

const getDevelopmentRecords = (): CafeApplicationRecord[] => {
  try {
    const stored = window.localStorage.getItem(developmentStorageKey)
    return stored ? (JSON.parse(stored) as CafeApplicationRecord[]) : []
  } catch {
    return []
  }
}

const setDevelopmentRecords = (records: CafeApplicationRecord[]) => {
  window.localStorage.setItem(developmentStorageKey, JSON.stringify(records))
  window.dispatchEvent(new CustomEvent(cafesUpdatedEvent))
}

const readJsonResponse = async <ResponseBody>(response: Response) => {
  const body = (await response.json().catch(() => null)) as
    | (ResponseBody & { error?: string })
    | null

  if (!response.ok || !body) {
    throw new Error(body?.error ?? "CupSpace café data is currently unavailable.")
  }

  return body
}

export const saveDevelopmentCafeSubmission = (formData: FormData) => {
  const data: Record<string, string> = {}
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      data[key] = value
    }
  })

  const createdAt = new Date().toISOString()
  const record = buildCafeApplicationRecord({
    id: `cafe-preview-${crypto.randomUUID().slice(0, 8)}`,
    createdAt,
    data,
  })

  setDevelopmentRecords([record, ...getDevelopmentRecords()])
}

export const getPublicCafeLocations = async (): Promise<
  PublicCafeLocation[]
> => {
  if (import.meta.env.DEV) {
    return getDevelopmentRecords()
      .filter((record) => record.status === "approved")
      .flatMap((record) => (record.publicLocation ? [record.publicLocation] : []))
  }

  const response = await fetch("/api/cafes", {
    headers: { Accept: "application/json" },
  })
  const body = await readJsonResponse<PublicCafesResponse>(response)
  return body.cafes
}

export const getAdminCafeApplications = async (
  pin: string,
): Promise<AdminCafesResponse> => {
  if (import.meta.env.DEV) {
    if (pin !== developmentAdminPin) {
      throw new Error("Invalid preview admin PIN.")
    }

    const records = getDevelopmentRecords()
    return {
      pending: records.filter((record) => record.status === "pending"),
      approved: records.filter((record) => record.status === "approved"),
    }
  }

  const response = await fetch("/api/cafes?view=admin", {
    headers: {
      Accept: "application/json",
      "x-cupspace-admin-pin": pin,
    },
    cache: "no-store",
  })

  return readJsonResponse<AdminCafesResponse>(response)
}

export const updateCafeApplication = async ({
  id,
  action,
  pin,
}: {
  id: string
  action: "approve" | "reject" | "unpublish"
  pin: string
}) => {
  if (import.meta.env.DEV) {
    if (pin !== developmentAdminPin) {
      throw new Error("Invalid preview admin PIN.")
    }

    const records = getDevelopmentRecords()
    const record = records.find((candidate) => candidate.id === id)
    if (!record) {
      throw new Error("Café application not found.")
    }

    if (action === "approve" && !record.publicLocation) {
      throw new Error("This application has no map location to publish.")
    }

    if (action === "reject") {
      setDevelopmentRecords(records.filter((candidate) => candidate.id !== id))
      return
    }

    const nextStatus = action === "approve" ? "approved" : "pending"
    setDevelopmentRecords(
      records.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : candidate,
      ),
    )
    return
  }

  const response = await fetch("/api/cafes", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-cupspace-admin-pin": pin,
    },
    body: JSON.stringify({ id, action }),
  })

  await readJsonResponse<{ record: CafeApplicationRecord }>(response)
}
