const COOKIE_NAME = "cupspace_qr_session"
const SESSION_MS = 7 * 24 * 60 * 60 * 1000
const MAX_SESSION_MS = 8 * 24 * 60 * 60 * 1000

const encoder = new TextEncoder()
const keys = new Map<string, CryptoKey>()

export const MIN_PASSWORD_LENGTH = 16
export const MIN_SECRET_LENGTH = 32

export const authConfigured = (password: string, secret: string) =>
  password.length >= MIN_PASSWORD_LENGTH && secret.length >= MIN_SECRET_LENGTH

const bytesToBase64Url = (bytes: Uint8Array) => {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

const base64UrlToBytes = (value: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

const hmacKey = async (secret: string) => {
  const cached = keys.get(secret)
  if (cached) return cached
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
  keys.set(secret, key)
  return key
}

export const passwordMatches = async (provided: string, expected: string) => {
  if (
    expected.length < MIN_PASSWORD_LENGTH ||
    provided.length < 1 ||
    provided.length > 200
  ) {
    return false
  }

  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(`cupspace-qr\0${provided}`)),
    crypto.subtle.digest("SHA-256", encoder.encode(`cupspace-qr\0${expected}`)),
  ])
  const a = new Uint8Array(left)
  const b = new Uint8Array(right)
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index]
  return diff === 0
}

const passwordTag = async (password: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`cupspace-qr-password\0${password}`))
  return bytesToBase64Url(new Uint8Array(digest)).slice(0, 16)
}

export const issueSessionToken = async (secret: string, password: string) => {
  if (secret.length < MIN_SECRET_LENGTH || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error("Session secret is not configured.")
  }
  const payload = bytesToBase64Url(
    encoder.encode(JSON.stringify({ v: 1, exp: Date.now() + SESSION_MS, pw: await passwordTag(password) })),
  )
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload))
  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`
}

export const readCookie = (request: Request, name = COOKIE_NAME) => {
  const header = request.headers.get("cookie")
  if (!header || header.length > 4096) return null
  for (const part of header.split(";")) {
    const trimmed = part.trim()
    const separator = trimmed.indexOf("=")
    if (separator === -1) continue
    if (trimmed.slice(0, separator) === name) return trimmed.slice(separator + 1)
  }
  return null
}

export const hasValidSession = async (request: Request, secret: string, password: string) => {
  if (secret.length < MIN_SECRET_LENGTH || password.length < MIN_PASSWORD_LENGTH) return false
  const token = readCookie(request)
  if (!token || token.length > 500) return false
  const [payload, signature, extra] = token.split(".")
  if (!payload || !signature || extra !== undefined) return false
  const signatureBytes = base64UrlToBytes(signature)
  const payloadBytes = base64UrlToBytes(payload)
  if (!signatureBytes || !payloadBytes) return false

  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    signatureBytes,
    encoder.encode(payload),
  )
  if (!valid) return false

  try {
    const data = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      v?: unknown
      exp?: unknown
      pw?: unknown
    }
    if (data.v !== 1 || typeof data.exp !== "number" || !Number.isFinite(data.exp)) return false
    if (data.pw !== (await passwordTag(password))) return false
    const now = Date.now()
    return data.exp > now && data.exp <= now + MAX_SESSION_MS
  } catch {
    return false
  }
}

export const sessionCookie = (token: string, secure: boolean) => {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${SESSION_MS / 1000}`,
  ]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export const clearSessionCookie = (secure: boolean) => {
  const parts = [`${COOKIE_NAME}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export const requestIsSecure = (request: Request) => new URL(request.url).protocol === "https:"
