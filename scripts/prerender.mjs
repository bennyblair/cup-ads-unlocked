import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { pathToFileURL } from "node:url"

const root = process.cwd()
const dist = join(root, "dist")
const templatePath = join(dist, "index.html")
const template = readFileSync(templatePath, "utf8")

if (!template.includes("<!--cupspace-seo-->") || !template.includes('<div id="root"></div>')) {
  throw new Error("Built index.html is missing the CupSpace prerender markers.")
}

const serverEntry = pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href
const originalError = console.error
console.error = (...args) => {
  const text = args.map((item) => String(item)).join(" ")
  if (text.includes("useLayoutEffect does nothing on the server")) return
  originalError(...args)
}
const { render, prerenderPages, sitemapXml } = await import(serverEntry)

const rendered = []

for (const page of prerenderPages) {
  const { html, head, page: resolved } = render(page.path)
  if (!html || !html.includes(resolved.expect)) {
    throw new Error(`Prerender for ${page.path} did not include expected text: ${resolved.expect}`)
  }

  const withHead = template.replace(
    /<!--cupspace-seo-->[\s\S]*?<!--\/cupspace-seo-->/,
    `<!--cupspace-seo-->${head}\n    <!--/cupspace-seo-->`,
  )
  const output = withHead.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  const file = page.path === "/" ? join(dist, "index.html") : join(dist, page.path.slice(1), "index.html")
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, output)
  rendered.push({
    path: page.path,
    file,
    bytes: Buffer.byteLength(output),
    title: resolved.title,
    expect: resolved.expect,
    noindex: Boolean(resolved.noindex),
  })
  console.log(`prerendered ${page.path} (${rendered.at(-1).bytes} bytes)`)
}

writeFileSync(join(dist, "sitemap.xml"), sitemapXml)
writeFileSync(join(root, "dist-ssr", "seo-manifest.json"), JSON.stringify(rendered, null, 2))
console.log(`wrote sitemap with ${sitemapXml.match(/<loc>/g)?.length ?? 0} urls`)
