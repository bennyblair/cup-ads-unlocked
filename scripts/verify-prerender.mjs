import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const dist = join(root, "dist")
const manifest = JSON.parse(readFileSync(join(root, "dist-ssr", "seo-manifest.json"), "utf8"))
const failures = []
const fail = (message) => failures.push(message)

const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")

const banned = (label, value) => {
  if (value.includes("\u2014")) fail(`${label} contains an em dash`)
  if (value.includes(" -- ")) fail(`${label} contains a double dash`)
}

for (const page of manifest) {
  if (!existsSync(page.file)) {
    fail(`missing file for ${page.path}`)
    continue
  }
  const html = readFileSync(page.file, "utf8")
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? ""
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? ""
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join("\n")
  const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? ""

  if (!html.includes(`<div id="root">`) || html.includes('<div id="root"></div>')) {
    fail(`${page.path} root is empty`)
  }
  if (!html.includes(page.expect)) fail(`${page.path} is missing content: ${page.expect}`)
  if (!title.includes("CupSpace") && !title.includes("Café")) fail(`${page.path} title looks wrong: ${title}`)
  if (!description) fail(`${page.path} is missing a meta description`)
  if (!canonical.startsWith("https://cupspace.com.au")) fail(`${page.path} canonical is missing`)
  if (!html.includes('property="og:title"') || !html.includes('property="og:description"') || !html.includes('property="og:url"')) {
    fail(`${page.path} is missing Open Graph tags`)
  }
  if (!jsonLd.includes("CUPSPACE PTY LTD") || !jsonLd.includes("71 690 786 817")) {
    fail(`${page.path} JSON-LD is missing the legal name or ABN`)
  }
  if (!jsonLd.includes("LocalBusiness") || !jsonLd.includes("Coffee cup advertising")) {
    fail(`${page.path} JSON-LD is missing LocalBusiness or Service`)
  }
  if (jsonLd.includes('"telephone"') || jsonLd.includes("streetAddress")) {
    fail(`${page.path} JSON-LD includes an unconfirmed phone or street address`)
  }
  if (page.noindex && !robots.includes("noindex")) fail(`${page.path} should be noindex`)
  if (!page.noindex && robots.includes("noindex")) fail(`${page.path} should be indexable`)
  if (page.bytes < 4000) fail(`${page.path} HTML is still too small (${page.bytes} bytes)`)

  banned(`${page.path} title`, title)
  banned(`${page.path} description`, description)
  banned(`${page.path} json-ld`, jsonLd)
  banned(`${page.path} visible text`, textOf(html))

  for (const match of html.matchAll(/\s(?:src|href)="(\/assets\/[^"]+)"/g)) {
    const asset = join(dist, match[1])
    if (!existsSync(asset)) fail(`${page.path} references missing asset ${match[1]}`)
  }
}

const requiredPaths = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/coffee-cup-advertising-sydney",
  "/locations",
  "/case-studies",
  "/advertiser-form",
  "/cafe-form",
]
for (const path of requiredPaths) {
  if (!manifest.some((page) => page.path === path)) fail(`manifest missing ${path}`)
}

const sydney = readFileSync(join(dist, "coffee-cup-advertising-sydney", "index.html"), "utf8")
if (!sydney.includes("How can I advertise my business on coffee cups in Sydney?")) {
  fail("Sydney page does not answer the target question")
}

const llms = readFileSync(join(dist, "llms.txt"), "utf8")
banned("llms.txt", llms)
for (const phrase of [
  "CUPSPACE PTY LTD",
  "71 690 786 817",
  "info@cupspace.com.au",
  "local cafés",
  "QR code",
  "Sydney, New South Wales, and Australia",
]) {
  if (!llms.includes(phrase)) fail(`llms.txt missing: ${phrase}`)
}

const robots = readFileSync(join(dist, "robots.txt"), "utf8")
if (!robots.includes("Sitemap: https://cupspace.com.au/sitemap.xml")) fail("robots.txt missing sitemap")
if (!robots.includes("https://cupspace.com.au/llms.txt")) fail("robots.txt missing llms.txt")
if (!robots.includes("Disallow: /admin/")) fail("robots.txt should keep the admin page out")

const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8")
for (const url of [
  "https://cupspace.com.au/",
  "https://cupspace.com.au/contact",
  "https://cupspace.com.au/privacy",
  "https://cupspace.com.au/terms",
  "https://cupspace.com.au/coffee-cup-advertising-sydney",
]) {
  if (!sitemap.includes(url)) fail(`sitemap missing ${url}`)
}
if (sitemap.includes("/admin/cafes")) fail("sitemap includes the admin page")

const linkedin = readFileSync(join(root, "docs", "linkedin-company-page.md"), "utf8")
banned("linkedin draft", linkedin)
if (!linkedin.includes("CUPSPACE PTY LTD") || !linkedin.includes("Advertising Services")) {
  fail("LinkedIn draft is incomplete")
}

if (failures.length) {
  console.error(failures.join("\n"))
  process.exit(1)
}

const home = manifest.find((page) => page.path === "/")
console.log("Crawlable HTML check passed.")
console.log(`Home page raw HTML: ${home.bytes} bytes (live shell before this change: 2206 bytes).`)
for (const page of manifest) {
  console.log(`${String(page.bytes).padStart(7)}  ${page.path}`)
}
console.log(`llms.txt ${statSync(join(dist, "llms.txt")).size} bytes`)
