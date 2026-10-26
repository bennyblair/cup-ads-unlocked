import { Fragment, ReactNode, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"
import NotFound from "@/pages/NotFound"
import { seoGuides, type Block } from "@/content/seoGuides"

const inline = (text: string): ReactNode[] =>
  text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) return <Link key={i} to={link[2]} className="font-semibold text-primary underline underline-offset-4">{link[1]}</Link>
    const bold = part.match(/^\*\*([^*]+)\*\*$/)
    if (bold) return <strong key={i} className="text-foreground">{bold[1]}</strong>
    return <Fragment key={i}>{part}</Fragment>
  })

const setMeta = (selector: string, attr: string, value: string) => {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

const renderBlock = (block: Block, i: number) => {
  switch (block.type) {
    case "h2":
      return <h2 key={i} className="mt-14 font-display text-3xl uppercase leading-[0.95] text-primary sm:text-5xl">{block.text}</h2>
    case "p":
      return <p key={i} className="mt-5 text-lg leading-relaxed text-muted-foreground">{inline(block.text)}</p>
    case "note":
      return <p key={i} className="mt-8 border-l-4 border-accent pl-5 text-lg leading-relaxed">{inline(block.text)}</p>
    case "ol":
    case "ul": {
      const Tag = block.type
      return (
        <Tag key={i} className={`mt-6 space-y-3 pl-6 text-lg leading-relaxed text-muted-foreground ${block.type === "ol" ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item) => <li key={item}>{inline(item)}</li>)}
        </Tag>
      )
    }
    case "table":
      return (
        <div key={i} className="mt-6 overflow-x-auto border-2 border-foreground">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="bg-primary text-primary-foreground">
              <tr>{block.head.map((h, j) => <th key={j} className="p-3 font-bold uppercase tracking-[0.05em]">{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-t-2 border-foreground">
                  {row.map((cell, j) => <td key={j} className={`p-3 ${j === 0 ? "font-bold" : "text-muted-foreground"}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

const SeoGuidePage = ({ slug }: { slug: string }) => {
  const guide = seoGuides.find((g) => g.slug === slug)

  useEffect(() => {
    if (!guide) return
    window.scrollTo(0, 0)
    document.title = guide.title
    const url = `https://cupspace.com.au/${guide.slug}`
    setMeta('meta[name="description"]', "content", guide.description)
    setMeta('meta[property="og:title"]', "content", guide.title)
    setMeta('meta[property="og:description"]', "content", guide.description)
    setMeta('meta[property="og:url"]', "content", url)
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", url)
    const ld = document.createElement("script")
    ld.type = "application/ld+json"
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    })
    document.head.appendChild(ld)
    return () => { ld.remove() }
  }, [guide])

  if (!guide) return <NotFound />
  const related = guide.related.map((s) => seoGuides.find((g) => g.slug === s)).filter(Boolean)

  return (
    <div className="public-site">
      <SiteHeader />
      <main>
        <section className="border-b-2 border-foreground bg-primary py-20 text-primary-foreground sm:py-28">
          <div className="container-custom">
            <span className="eyebrow mb-8">{guide.eyebrow}</span>
            <h1 className="max-w-6xl font-display text-[clamp(2.75rem,8vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em]">{guide.h1}</h1>
            <p className="mt-9 max-w-2xl border-l-4 border-accent pl-5 text-xl leading-relaxed text-primary-foreground/75">{guide.intro}</p>
          </div>
        </section>

        <section className="paper-noise section-padding border-b-2 border-foreground">
          <div className="container-custom max-w-4xl">
            {guide.blocks.map(renderBlock)}

            <h2 className="mt-16 font-display text-3xl uppercase leading-[0.95] text-primary sm:text-5xl">FAQ</h2>
            <div className="mt-6 border-2 border-foreground">
              {guide.faq.map(([q, a], i) => (
                <div key={q} className={`p-6 ${i ? "border-t-2 border-foreground" : ""}`}>
                  <h3 className="font-display text-xl uppercase">{q}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{a}</p>
                </div>
              ))}
            </div>

            {related.length > 0 && (
              <div className="mt-14">
                <span className="eyebrow">Related guides</span>
                <ul className="mt-4 space-y-2">
                  {related.map((g) => (
                    <li key={g!.slug}><Link to={`/${g!.slug}`} className="font-semibold text-primary underline underline-offset-4">{g!.h1}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="bg-accent py-16 sm:py-20">
          <div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <h2 className="max-w-3xl font-display text-4xl uppercase leading-[0.9] sm:text-6xl">Put the next cup to work.</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground" to={guide.cta.to}>{guide.cta.label} <ArrowRight className="h-4 w-4" /></Link>
              <Link className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-background px-6 py-4 text-sm font-bold uppercase tracking-[0.08em]" to="/cafe-form">For cafés <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="container-custom mt-6 text-sm">Or email <a className="font-bold underline" href="mailto:info@cupspace.com.au">info@cupspace.com.au</a></div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default SeoGuidePage
