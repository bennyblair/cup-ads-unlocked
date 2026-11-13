import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"

import App from "./App"
import { pages, renderHeadTags, renderSitemap, resolvePage, type PageSeo } from "./seo/metadata"

export const prerenderPages: PageSeo[] = pages

export const sitemapXml = renderSitemap()

export const render = (url: string) => {
  const page = resolvePage(url)
  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  )

  return { html, head: renderHeadTags(page), page }
}
