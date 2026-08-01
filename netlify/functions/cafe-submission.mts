import { randomUUID } from "node:crypto"

import type { NetlifyFunction } from "@netlify/functions"

import { buildCafeApplicationRecord } from "../../src/lib/cafe-record"
import { saveCafeRecord } from "./_lib/cafe-store"

const isCafeSubmission = (data: Record<string, string>) => {
  const formName = data["form-name"]

  if (formName) {
    return formName === "cafe-form"
  }

  return Boolean(data.cafeName && data.exactLatitude && data.exactLongitude)
}

export default {
  async formSubmitted(event) {
    if (!isCafeSubmission(event.data)) {
      return
    }

    const createdAt = new Date().toISOString()
    const id = `cafe-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`
    const record = buildCafeApplicationRecord({
      id,
      createdAt,
      data: event.data,
    })

    await saveCafeRecord(record)
  },
} satisfies NetlifyFunction
