export const SCAN_TOKEN_PATTERN = /^[2-9a-hj-km-np-z]{16}$/
export const SCAN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

export const scanCookieName = (id: string) => `cs_${id}`

export const scanCookieToken = (header: string | null, id: string) => {
  const prefix = `${scanCookieName(id)}=`
  for (const part of (header ?? "").split(";")) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(prefix)) continue
    const value = trimmed.slice(prefix.length)
    return SCAN_TOKEN_PATTERN.test(value) ? value : undefined
  }
  return undefined
}

export const scanCookieHeader = (id: string, token: string, secure: boolean) =>
  `${scanCookieName(id)}=${token}; Path=/; Max-Age=${SCAN_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`
