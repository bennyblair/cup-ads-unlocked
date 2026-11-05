import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { MIN_PASSWORD_LENGTH, MIN_SECRET_LENGTH } from "../shared/session"
import { createMemoryStore } from "./memory-store"
import { startServer } from "./node-server"

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

const loadEnvFile = (file: string) => {
  if (!existsSync(file)) return
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(resolve(appRoot, ".env"))

const password = process.env.QR_ADMIN_PASSWORD ?? ""
const sessionSecret = process.env.QR_SESSION_SECRET ?? ""

if (password.length < MIN_PASSWORD_LENGTH || sessionSecret.length < MIN_SECRET_LENGTH) {
  console.error(
    `Set QR_ADMIN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) and QR_SESSION_SECRET (at least ${MIN_SECRET_LENGTH} characters) before starting QR Studio.`,
  )
  process.exit(1)
}

if (!existsSync(resolve(appRoot, "dist/index.html"))) {
  console.error("Build the QR Studio UI first: npm run build")
  process.exit(1)
}

const server = await startServer({
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? "127.0.0.1",
  password,
  sessionSecret,
  staticDir: resolve(appRoot, "dist"),
  store: createMemoryStore(resolve(appRoot, ".data/campaigns.json")),
})

console.log(`CupSpace QR Studio is running at ${server.url}`)
