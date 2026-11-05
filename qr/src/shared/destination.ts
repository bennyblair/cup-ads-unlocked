const MAX_DESTINATION_LENGTH = 2000
const MAX_NAME_LENGTH = 80

export type ParsedField = { ok: true; value: string } | { ok: false; error: string }

const hasScheme = (value: string) => /^[a-z][a-z0-9+.-]*:/i.test(value)

export const normalizeName = (input: string): ParsedField => {
  if (typeof input !== "string") {
    return { ok: false, error: "Enter a campaign name." }
  }

  const name = input.trim().replace(/\s+/g, " ")
  if (!name) return { ok: false, error: "Enter a campaign name." }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Campaign name must be 80 characters or fewer." }
  }
  if (/[\u0000-\u001F\u007F]/.test(name)) {
    return { ok: false, error: "Campaign name cannot include control characters." }
  }

  return { ok: true, value: name }
}

export const normalizeDestination = (input: string): ParsedField => {
  if (typeof input !== "string") {
    return { ok: false, error: "Enter a destination URL." }
  }

  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: "Enter a destination URL." }
  if (trimmed.length > MAX_DESTINATION_LENGTH) {
    return { ok: false, error: "That destination URL is too long." }
  }
  if (/[\s\u0000-\u001F\u007F\\]/.test(trimmed) || trimmed.startsWith("//")) {
    return {
      ok: false,
      error: "Enter a valid http or https URL, such as client.com/offer.",
    }
  }

  const candidate = hasScheme(trimmed) ? trimmed : `https://${trimmed}`
  if (!/^https?:\/\//i.test(candidate)) {
    return { ok: false, error: "Destination must be an http or https URL." }
  }

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return {
      ok: false,
      error: "Enter a valid http or https URL, such as client.com/offer.",
    }
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Destination must be an http or https URL." }
  }
  if (url.username || url.password) {
    return { ok: false, error: "Destination cannot include a username or password." }
  }
  if (!url.hostname || url.hostname === ".") {
    return {
      ok: false,
      error: "Enter a valid http or https URL, such as client.com/offer.",
    }
  }

  const host = url.hostname.toLowerCase()
  if (host === "qr.cupspace.com.au" || host.endsWith(".qr.cupspace.com.au")) {
    return {
      ok: false,
      error: "The destination cannot be a qr.cupspace.com.au tracking link.",
    }
  }

  return { ok: true, value: url.href }
}
