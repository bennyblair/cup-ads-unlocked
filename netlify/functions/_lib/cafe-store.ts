import { getStore } from "@netlify/blobs"

import type { CafeApplicationRecord } from "../../../src/types/cafes"

const storeName = "cupspace-cafes"

export const cafeStore = () => getStore(storeName)

export const getCafeRecord = async (
  status: "pending" | "approved" | "rejected",
  id: string,
) =>
  (await cafeStore().get(`${status}/${id}`, {
    type: "json",
    consistency: "strong",
  })) as CafeApplicationRecord | null

export const listCafeRecords = async (
  status: "pending" | "approved",
) => {
  const records: CafeApplicationRecord[] = []
  const store = cafeStore()

  for await (const page of store.list({
    prefix: `${status}/`,
    paginate: true,
  })) {
    const pageRecords = await Promise.all(
      page.blobs.map((blob) =>
        store.get(blob.key, { type: "json", consistency: "strong" }),
      ),
    )

    pageRecords.forEach((record) => {
      if (record) {
        records.push(record as CafeApplicationRecord)
      }
    })
  }

  return records.sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  )
}

export const saveCafeRecord = async (record: CafeApplicationRecord) => {
  await cafeStore().setJSON(`${record.status}/${record.id}`, record)
}

export const moveCafeRecord = async ({
  record,
  from,
  to,
}: {
  record: CafeApplicationRecord
  from: "pending" | "approved"
  to: "pending" | "approved" | "rejected"
}) => {
  const updatedRecord: CafeApplicationRecord = {
    ...record,
    status: to,
    updatedAt: new Date().toISOString(),
  }

  await cafeStore().setJSON(`${to}/${record.id}`, updatedRecord)
  await cafeStore().delete(`${from}/${record.id}`)

  return updatedRecord
}
