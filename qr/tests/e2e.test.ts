import assert from "node:assert/strict"
import { mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

import { PNG } from "pngjs"
import jsQR from "jsqr"
import puppeteer from "puppeteer-core"

import { PUBLIC_ORIGIN } from "../src/shared/campaign"
import { createMemoryStore } from "../src/server/memory-store"
import { startServer } from "../src/server/node-server"

const PASSWORD = "test-only-qr-password"
const SECRET = "test-only-session-secret-32b-xxxx"
const staticDir = fileURLToPath(new URL("../dist", import.meta.url))
const artifacts = "/opt/cursor/artifacts"

const decodePng = (bytes: Uint8Array) => {
  const png = PNG.sync.read(Buffer.from(bytes))
  const pixels = new Uint8ClampedArray(png.data.length)
  pixels.set(png.data)
  return jsQR(pixels, png.width, png.height)?.data ?? null
}

describe("QR Studio in the browser", () => {
  it("creates, edits, downloads, counts and deletes a campaign", { timeout: 120_000 }, async () => {
    await mkdir(artifacts, { recursive: true })
    const server = await startServer({
      password: PASSWORD,
      sessionSecret: SECRET,
      staticDir,
      store: createMemoryStore(),
    })
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    })
    const downloadDir = await mkdtemp(join(tmpdir(), "cupspace-qr-"))

    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
      const blocked = await page.goto(`${server.url}/api/campaigns`, { waitUntil: "networkidle0" })
      assert.equal(blocked?.status(), 401)

      await page.goto(server.url, { waitUntil: "networkidle0" })
      assert.ok(page.url().endsWith("/login"))
      await page.screenshot({ path: join(artifacts, "qr-login-mobile.png") })
      await page.type("#password", "not-the-admin-password")
      await page.click("[data-testid=sign-in]")
      await page.waitForSelector("[role=alert]")

      await page.click("#password", { clickCount: 3 })
      await page.type("#password", PASSWORD)
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("[data-testid=sign-in]"),
      ])
      assert.ok(page.url().endsWith("/"))
      await page.waitForSelector("[data-testid=create-qr]")
      await page.screenshot({ path: join(artifacts, "qr-dashboard-empty-mobile.png"), fullPage: true })

      await page.click("[data-testid=create-qr]")
      await page.waitForSelector("dialog[open] [data-testid=dialog-close]")
      const closeBox = await page.$eval("[data-testid=dialog-close]", (element) => {
        const rect = element.getBoundingClientRect()
        return { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width }
      })
      assert.ok(closeBox.height >= 44)
      assert.ok(closeBox.width >= 44)
      assert.ok(closeBox.top >= 0)
      assert.ok(closeBox.bottom <= 844)
      await page.screenshot({ path: join(artifacts, "qr-create-dialog-mobile.png") })
      await page.click("[data-testid=dialog-close]")
      await page.waitForSelector("dialog", { hidden: true })

      await page.click("[data-testid=create-qr]")
      await page.waitForSelector("#campaign-name")
      await page.type("#campaign-name", "Harbour launch")
      await page.type("#campaign-destination", "client.com/offer")
      await page.evaluate(() => {
        const form = document.querySelector("dialog form") as HTMLFormElement | null
        form?.requestSubmit()
        form?.requestSubmit()
      })
      await page.waitForSelector(".campaign-row h3")
      const names = await page.$$eval(".campaign-row h3", (nodes) => nodes.map((node) => node.textContent?.trim()))
      assert.deepEqual(names, ["Harbour launch"])
      const trackingUrl = await page.$eval(".tracking a", (element) => element.getAttribute("href"))
      assert.match(trackingUrl ?? "", /^https:\/\/qr\.cupspace\.com\.au\/c\/[2-9a-hj-km-np-z]{8}$/)
      assert.equal((trackingUrl ?? "").toLowerCase().includes("emet"), false)
      const shownDestination = await page.$eval(".destination a", (element) => element.textContent?.trim())
      assert.equal(shownDestination, "https://client.com/offer")

      await page.click("[data-testid=edit-campaign]")
      await page.waitForSelector("dialog[open] #campaign-destination")
      await page.click("#campaign-destination", { clickCount: 3 })
      await page.keyboard.press("Backspace")
      await page.type("#campaign-destination", "https://example.com/next")
      await page.click("dialog .primary-button")
      await page.waitForSelector("dialog", { hidden: true })
      assert.equal(await page.$eval(".tracking a", (element) => element.getAttribute("href")), trackingUrl)
      assert.equal(
        await page.$eval(".destination a", (element) => element.textContent?.trim()),
        "https://example.com/next",
      )

      const id = trackingUrl?.split("/").pop()
      const pngBytes = await page.evaluate(async (campaignId) => {
        const response = await fetch(`/api/campaigns/${campaignId}/qr.png`, {
          credentials: "same-origin",
          headers: { "x-cupspace-qr": "1" },
        })
        if (!response.ok) throw new Error(`download failed: ${response.status}`)
        return Array.from(new Uint8Array(await response.arrayBuffer()))
      }, id)
      const decoded = decodePng(Uint8Array.from(pngBytes))
      assert.equal(decoded, `${PUBLIC_ORIGIN}/c/${id}`)

      const tracked = await fetch(`${server.url}/c/${id}`, { redirect: "manual" })
      assert.equal(tracked.status, 302)
      assert.equal(tracked.headers.get("location"), "https://example.com/next")
      await page.click("[data-testid=refresh]")
      await page.waitForFunction(
        () => document.querySelector("[data-testid=visit-count]")?.textContent?.includes("1"),
      )

      await page.setViewport({ width: 1280, height: 900 })
      await page.screenshot({ path: join(artifacts, "qr-dashboard-desktop.png"), fullPage: true })

      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
      await page.click("[data-testid=delete-campaign]")
      const confirmation = await page.$eval("dialog", (element) => element.textContent ?? "")
      assert.match(confirmation, /Harbour launch/)
      assert.match(confirmation, /stop working permanently/)
      const confirmButton = await page.$("[data-testid=confirm-delete]")
      assert.equal(await confirmButton?.evaluate((element) => (element as HTMLButtonElement).disabled), true)
      await page.type("#delete-confirm", "remove")
      assert.equal(await confirmButton?.evaluate((element) => (element as HTMLButtonElement).disabled), true)
      await page.click("dialog .ghost-button")
      await page.waitForSelector("dialog", { hidden: true })
      assert.equal(await page.$eval(".campaign-row h3", (element) => element.textContent?.trim()), "Harbour launch")
      await page.click("[data-testid=delete-campaign]")
      await page.waitForSelector("#delete-confirm")
      await page.type("#delete-confirm", "DELETE")
      await page.click("[data-testid=confirm-delete]")
      await page.waitForSelector(".campaign-row h3", { hidden: true })
      const removed = await fetch(`${server.url}/c/${id}`, { redirect: "manual" })
      assert.equal(removed.status, 404)

      await page.click("[data-testid=sign-out]")
      await page.waitForSelector("[data-testid=sign-in]")
      const status = await page.evaluate(async () => (await fetch("/api/campaigns", { credentials: "same-origin" })).status)
      assert.equal(status, 401)
      await page.goto(server.url, { waitUntil: "networkidle0" })
      assert.ok(page.url().endsWith("/login"))
      assert.equal((await page.content()).includes("Harbour launch"), false)
    } finally {
      await browser.close()
      await server.close()
      await rm(downloadDir, { recursive: true, force: true })
    }
  })
})
