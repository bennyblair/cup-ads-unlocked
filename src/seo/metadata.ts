import { seoGuides } from "@/content/seoGuides"

export const SITE_ORIGIN = "https://cupspace.com.au"
export const LEGAL_NAME = "CUPSPACE PTY LTD"
export const BRAND_NAME = "CupSpace"
export const ABN = "71 690 786 817"
export const CONTACT_EMAIL = "info@cupspace.com.au"
export const PHONE_DISPLAY = "0485 931 539"
export const PHONE_TEL = "+61485931539"
export const PHONE_INTERNATIONAL = "+61 485 931 539"
export const OG_IMAGE = `${SITE_ORIGIN}/og-cupspace-logo.png`

// TODO(Ben): add streetAddress only after it is confirmed.
// Do not invent a street address.

export type PageSeo = {
  path: string
  title: string
  description: string
  expect: string
  noindex?: boolean
  sitemap?: boolean
  changefreq: string
  priority: string
  faq?: [string, string][]
}

const page = (
  path: string,
  title: string,
  description: string,
  expect: string,
  changefreq: string,
  priority: string,
  extra: Partial<PageSeo> = {},
): PageSeo => ({
  path,
  title,
  description,
  expect,
  changefreq,
  priority,
  sitemap: extra.noindex ? false : true,
  ...extra,
})

const guidePages: PageSeo[] = seoGuides.map((guide) =>
  page(
    `/${guide.slug}`,
    guide.title,
    guide.description,
    guide.h1,
    "monthly",
    guide.slug === "coffee-cup-advertising-sydney" ? "0.9" : "0.8",
    { faq: guide.faq },
  ),
)

export const pages: PageSeo[] = [
  page(
    "/",
    "CupSpace | Cups for Cafés. Reach for Brands.",
    "Free branded takeaway cups for cafés. Local, trackable cup advertising for brands across Australia. CupSpace is CUPSPACE PTY LTD.",
    "Cups for",
    "weekly",
    "1.0",
  ),
  page(
    "/about",
    "Our Story | CupSpace",
    "How CupSpace started: three mates, a closed café, and the idea that a takeaway cup could help cafés with cup costs and give brands a local channel.",
    "A café closed",
    "monthly",
    "0.8",
  ),
  page(
    "/advertiser-form",
    "Advertise with CupSpace",
    "Enquire about advertising on takeaway coffee cups served by local cafés. Tell CupSpace who you want to reach and which suburbs matter.",
    "Put your campaign in hand.",
    "monthly",
    "0.7",
  ),
  page(
    "/cafe-form",
    "Partner as a Café | CupSpace",
    "Cafés can apply to receive branded takeaway cups through CupSpace. Tell us about your café and how you operate.",
    "Put your cup costs down.",
    "monthly",
    "0.7",
  ),
  page(
    "/savings-calculator",
    "Café Savings Calculator | CupSpace",
    "Estimate the takeaway cup cost a café might offset if CupSpace supplies the cups. A calculator for café partners.",
    "What are your cups costing you?",
    "monthly",
    "0.6",
  ),
  page(
    "/locations",
    "CupSpace Locations | Coverage and Campaign Areas",
    "See CupSpace café coverage across Australia and request the suburb where a coffee cup campaign should run.",
    "Pick your patch.",
    "weekly",
    "0.9",
  ),
  page(
    "/case-studies",
    "Case Studies | CupSpace",
    "Case studies of CupSpace coffee cup campaigns, including how brands used café cups and QR codes.",
    "Local campaigns. Real-world attention.",
    "monthly",
    "0.8",
  ),
  page(
    "/case-studies/buyers-agent",
    "Buyers Agent Case Study | CupSpace",
    "How a Sydney buyers agency used takeaway coffee cups in two café areas to start local property conversations.",
    "The coffee run that opened 32 doors.",
    "monthly",
    "0.7",
  ),
  page(
    "/case-studies/emet-capital",
    "Emet Capital Case Study | CupSpace",
    "How CupSpace placed Emet Capital on coffee cups in affluent areas of Sydney, Melbourne, Brisbane and Perth.",
    "Private lending, placed in the right postcodes.",
    "monthly",
    "0.7",
  ),
  page(
    "/case-studies/kraken",
    "Kraken Case Study | CupSpace",
    "How a Kraken coffee cup campaign put the brand into a daily café ritual, with a QR code from the cup to the phone.",
    "A global brand.",
    "monthly",
    "0.7",
  ),
  ...guidePages,
  page(
    "/contact",
    "Contact CupSpace | CUPSPACE PTY LTD",
    "Contact CUPSPACE PTY LTD (CupSpace) about coffee cup advertising or café supply. Email info@cupspace.com.au. ABN 71 690 786 817.",
    "Contact CupSpace",
    "monthly",
    "0.7",
  ),
  page(
    "/privacy",
    "Privacy | CupSpace",
    "Draft privacy notice for CUPSPACE PTY LTD (CupSpace), the Australian business that advertises on takeaway coffee cups through local cafés.",
    "Privacy",
    "yearly",
    "0.3",
  ),
  page(
    "/terms",
    "Terms of use | CupSpace",
    "Draft terms for the CupSpace website, run by CUPSPACE PTY LTD. Advertising on takeaway coffee cups through local cafés.",
    "Terms of use",
    "yearly",
    "0.3",
  ),
  page(
    "/admin/cafes",
    "Café Approvals | CupSpace",
    "Private CupSpace page for reviewing café applications.",
    "Café approvals",
    "yearly",
    "0.0",
    { noindex: true, sitemap: false },
  ),
]

export const notFoundPage: PageSeo = {
  path: "/404",
  title: "Page not found | CupSpace",
  description:
    "This page is not on the CupSpace website. CupSpace is CUPSPACE PTY LTD, advertising on takeaway coffee cups through local cafés.",
  expect: "404",
  noindex: true,
  sitemap: false,
  changefreq: "yearly",
  priority: "0.0",
}

export const normalisePath = (pathname: string) => {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`
  const withoutQuery = withLeadingSlash.split("?")[0]?.split("#")[0] ?? "/"
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1)
  }
  return withoutQuery || "/"
}

export const canonicalUrl = (path: string) =>
  path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`

export const resolvePage = (pathname: string): PageSeo => {
  const path = normalisePath(pathname)
  return pages.find((entry) => entry.path === path) ?? { ...notFoundPage, path }
}

const areaServed = ["Sydney, New South Wales", "Australia"]

const organizationId = `${SITE_ORIGIN}/#organization`
const websiteId = `${SITE_ORIGIN}/#website`
const serviceId = `${SITE_ORIGIN}/#service`

const organizationNode = {
  "@type": ["Organization", "LocalBusiness"],
  "@id": organizationId,
  name: BRAND_NAME,
  legalName: LEGAL_NAME,
  brand: {
    "@type": "Brand",
    name: BRAND_NAME,
  },
  taxID: ABN,
  identifier: {
    "@type": "PropertyValue",
    name: "Australian Business Number",
    value: ABN,
  },
  url: SITE_ORIGIN,
  email: CONTACT_EMAIL,
  telephone: PHONE_INTERNATIONAL,
  logo: OG_IMAGE,
  image: OG_IMAGE,
  slogan: "Cups for cafés. Reach for brands.",
  description:
    "CupSpace is the brand of CUPSPACE PTY LTD, an Australian business that places advertising on takeaway coffee cups distributed through local cafés. The website is https://cupspace.com.au. This is not cupspace.com, and it is not an unrelated app that uses a similar name.",
  areaServed,
  // TODO(Ben): street address stays unpublished until you confirm one.
}

const serviceNode = {
  "@type": "Service",
  "@id": serviceId,
  name: "Coffee cup advertising",
  serviceType: "Advertising on takeaway coffee cups distributed through local cafés",
  provider: { "@id": organizationId },
  areaServed,
  url: `${SITE_ORIGIN}/coffee-cup-advertising-sydney`,
  description:
    "A brand is printed on takeaway coffee cups. The cups go out through local cafés in the suburbs an advertiser wants to reach. A QR code on the cup can link to the advertiser so enquiries can be tracked.",
}

export const buildJsonLd = (pageSeo: PageSeo) => {
  const url = canonicalUrl(pageSeo.path)
  const graph: Record<string, unknown>[] = [
    organizationNode,
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_ORIGIN,
      name: BRAND_NAME,
      description:
        "CupSpace, the brand of CUPSPACE PTY LTD, advertises on takeaway coffee cups distributed through local cafés in Sydney and Australia.",
      publisher: { "@id": organizationId },
      inLanguage: "en-AU",
    },
    serviceNode,
    {
      "@type": pageSeo.path === "/contact" ? "ContactPage" : "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: pageSeo.title,
      description: pageSeo.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      publisher: { "@id": organizationId },
      inLanguage: "en-AU",
    },
  ]

  if (pageSeo.faq && pageSeo.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      isPartOf: { "@id": websiteId },
      mainEntity: pageSeo.faq.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    })
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  }
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

export const renderHeadTags = (pageSeo: PageSeo) => {
  const url = canonicalUrl(pageSeo.path)
  const robots = pageSeo.noindex ? "noindex, nofollow" : "index, follow"
  const json = JSON.stringify(buildJsonLd(pageSeo)).replace(/</g, "\\u003c")
  const title = escapeHtml(pageSeo.title)
  const description = escapeHtml(pageSeo.description)

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta name="robots" content="${robots}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:site_name" content="CupSpace" />
    <meta property="og:locale" content="en_AU" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:secure_url" content="${OG_IMAGE}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="CupSpace logo. Cups for cafés. Reach for brands." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="twitter:image:alt" content="CupSpace logo. Cups for cafés. Reach for brands." />
    <script type="application/ld+json" id="cupspace-jsonld">${json}</script>`
}

const upsertMeta = (selector: string, attributes: Record<string, string>, content: string) => {
  let element = document.querySelector(selector)
  if (!element) {
    element = document.createElement("meta")
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value)
    }
    document.head.appendChild(element)
  }
  element.setAttribute("content", content)
}

export const applyDocumentHead = (pageSeo: PageSeo) => {
  const url = canonicalUrl(pageSeo.path)
  document.title = pageSeo.title
  upsertMeta('meta[name="description"]', { name: "description" }, pageSeo.description)
  upsertMeta('meta[name="robots"]', { name: "robots" }, pageSeo.noindex ? "noindex, nofollow" : "index, follow")
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, pageSeo.title)
  upsertMeta('meta[property="og:description"]', { property: "og:description" }, pageSeo.description)
  upsertMeta('meta[property="og:type"]', { property: "og:type" }, "website")
  upsertMeta('meta[property="og:url"]', { property: "og:url" }, url)
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, BRAND_NAME)
  upsertMeta('meta[property="og:locale"]', { property: "og:locale" }, "en_AU")
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, pageSeo.title)
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, pageSeo.description)

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement("link")
    canonical.rel = "canonical"
    document.head.appendChild(canonical)
  }
  canonical.href = url

  let jsonLd = document.getElementById("cupspace-jsonld")
  if (!jsonLd) {
    jsonLd = document.createElement("script")
    jsonLd.id = "cupspace-jsonld"
    jsonLd.setAttribute("type", "application/ld+json")
    document.head.appendChild(jsonLd)
  }
  jsonLd.textContent = JSON.stringify(buildJsonLd(pageSeo))
}

export const renderSitemap = () => {
  const urls = pages
    .filter((entry) => entry.sitemap !== false && !entry.noindex)
    .map(
      (entry) => `  <url>
    <loc>${canonicalUrl(entry.path)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}
