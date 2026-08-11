import { useEffect } from "react"
import { ArrowRight, Building2, Home } from "lucide-react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"

const studies = [
  {
    category: "Private lending / capital cities",
    title: "Emet Capital",
    headline: "Private lending, placed in the right postcodes.",
    summary:
      "How CupSpace used café placement across affluent capital-city areas to put Emet Capital in front of property investors, developers and business owners.",
    facts: ["4 capital cities", "6 café areas", "60,000 cups"],
    to: "/case-studies/emet-capital",
    Icon: Building2,
    tone: "bg-primary text-primary-foreground",
  },
  {
    category: "Property / Sydney",
    title: "Buyers agency",
    headline: "The coffee run that opened 32 doors.",
    summary:
      "How a Sydney buyers agency used 20,000 takeaway cups across two cafés to turn morning routines into measurable property conversations.",
    facts: ["2 café areas", "20,000 cups", "32 booked calls"],
    to: "/case-studies/buyers-agent",
    Icon: Home,
    tone: "bg-accent text-accent-foreground",
  },
]

const CaseStudiesIndex = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Case Studies | CupSpace"
  }, [])

  return (
    <div className="public-site">
      <SiteHeader />

      <main>
        <header className="paper-noise border-b-2 border-foreground">
          <div className="container-custom py-14 sm:py-20 lg:py-24">
            <span className="eyebrow mb-7">CupSpace / case studies</span>
            <h1 className="max-w-6xl font-display text-[clamp(3.4rem,8vw,8.5rem)] uppercase leading-[0.9] tracking-[-0.055em]">
              Local campaigns. Real-world attention.
            </h1>
            <p className="mt-8 max-w-3xl border-l-4 border-primary pl-5 text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
              See how brands use CupSpace to choose the right café areas, put a
              useful message in people&apos;s hands and create a measurable path
              from coffee to customer.
            </p>
          </div>
        </header>

        <section className="poster-grid section-padding border-b-2 border-foreground">
          <div className="container-custom">
            <div className="grid border-2 border-foreground lg:grid-cols-2">
              {studies.map((study, index) => (
                <article
                  key={study.to}
                  className={`flex min-h-full flex-col p-6 sm:p-10 lg:p-12 ${
                    study.tone
                  } ${
                    index
                      ? "border-t-2 border-foreground lg:border-l-2 lg:border-t-0"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">
                      {study.category}
                    </span>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-current">
                      <study.Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <p className="mt-12 text-sm font-bold uppercase tracking-[0.12em]">
                    {study.title}
                  </p>
                  <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-[-0.035em] sm:text-6xl">
                    {study.headline}
                  </h2>
                  <p className="mt-7 max-w-2xl text-lg leading-relaxed opacity-75">
                    {study.summary}
                  </p>

                  <ul className="mt-9 flex flex-wrap gap-2" aria-label="Campaign facts">
                    {study.facts.map((fact) => (
                      <li
                        key={fact}
                        className="border border-current px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
                      >
                        {fact}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={study.to}
                    className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 border-2 border-current bg-background px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-foreground transition hover:bg-foreground hover:text-background sm:w-fit"
                  >
                    Read case study <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-14 sm:py-20">
          <div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <span className="eyebrow">Your campaign / next</span>
              <h2 className="mt-7 max-w-4xl font-display text-4xl uppercase leading-[0.95] sm:text-6xl">
                Put your audience within reach.
              </h2>
            </div>
            <Link
              to="/advertiser-form"
              className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-foreground"
            >
              Build a campaign brief <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CaseStudiesIndex
