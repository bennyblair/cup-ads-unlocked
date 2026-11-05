import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { existsSync, statSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { extname, join, normalize, sep } from "node:path"

import { createMemoryAnalytics } from "./analytics-store"
import { createLoginLimiter, handleRequest, type AppDependencies } from "./http"
import { createMemoryStore } from "./memory-store"

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8",
}

export const createStaticServer = (root: string) => {
  const rootPath = normalize(root)
  return async (pathname: string) => {
    let decoded = pathname
    try {
      decoded = decodeURIComponent(pathname)
    } catch {
      return null
    }
    if (decoded.includes("\0") || decoded.includes("\\")) return null
    const full = normalize(join(rootPath, decoded.replace(/^\/+/, "")))
    if (full !== rootPath && !full.startsWith(`${rootPath}${sep}`)) return null
    if (!existsSync(full) || !statSync(full).isFile()) return null
    const body = await readFile(full)
    const cache = full.includes(`${sep}assets${sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-store"
    return new Response(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[extname(full).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": cache,
        "X-Content-Type-Options": "nosniff",
      },
    })
  }
}

const readRaw = async (req: IncomingMessage) => {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.length
    if (total > 1_000_000) return null
    chunks.push(buffer)
  }
  return new Uint8Array(Buffer.concat(chunks))
}

const toFetchRequest = async (req: IncomingMessage, origin: string) => {
  const method = req.method ?? "GET"
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else if (value !== undefined) {
      headers.set(key, value)
    }
  }
  const hasBody = method !== "GET" && method !== "HEAD"
  const body = hasBody ? await readRaw(req) : undefined
  if (body === null) return null
  return new Request(new URL(req.url ?? "/", origin), {
    method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
  })
}

const writeFetchResponse = async (res: ServerResponse, response: Response, method: string) => {
  for (const cookie of response.headers.getSetCookie()) res.appendHeader("set-cookie", cookie)
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return
    res.setHeader(key, value)
  })
  res.writeHead(response.status)
  if (method === "HEAD" || response.body === null) {
    res.end()
    return
  }
  res.end(Buffer.from(await response.arrayBuffer()))
}

export const startServer = async (options: {
  port?: number
  host?: string
  password: string
  sessionSecret: string
  staticDir: string
  store?: AppDependencies["store"]
  analytics?: AppDependencies["analytics"]
  limiter?: AppDependencies["limiter"]
}) => {
  const store = options.store ?? createMemoryStore()
  const deps: AppDependencies = {
    store,
    analytics: options.analytics ?? createMemoryAnalytics(),
    password: options.password,
    sessionSecret: options.sessionSecret,
    limiter: options.limiter ?? createLoginLimiter(),
    serveStatic: createStaticServer(options.staticDir),
  }
  const host = options.host ?? "127.0.0.1"
  const server = createServer(async (req, res) => {
    const origin = `http://${req.headers.host ?? host}`
    try {
      const request = await toFetchRequest(req, origin)
      if (!request) {
        res.writeHead(413, { "Content-Type": "text/plain; charset=utf-8" })
        res.end("Request is too large.")
        return
      }
      const response = await handleRequest(request, deps)
      await writeFetchResponse(res, response, req.method ?? "GET")
    } catch {
      console.error("qr dev server failed")
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
      res.end("Something went wrong.")
    }
  })

  const port = await new Promise<number>((resolve, reject) => {
    server.once("error", reject)
    server.listen(options.port ?? 0, host, () => {
      const address = server.address()
      resolve(typeof address === "object" && address ? address.port : 0)
    })
  })

  return {
    url: `http://${host}:${port}`,
    store,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
  }
}
