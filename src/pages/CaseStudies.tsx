import { useEffect } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Coffee,
  MapPin,
  ScanLine,
} from "lucide-react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"

const campaignMetrics = [
  ["20,000", "cups handed over"],
  ["1,600", "landing-page visits"],
  ["224", "qualified enquiries"],
  ["32", "strategy calls booked"],
]

const campaignSteps = [
  {
    number: "01",
    title: "Choose the streets",
    body: "Two cafés were selected across Marrickville and Newtown—areas where the audience already lived, worked and inspected property. Each café received 10,000 campaign cups.",
  },
  {
    number: "02",
    title: "Make the cup useful",
    body: "The cup creative led with one practical promise: a clearer buying plan before the next auction. A single QR code opened a mobile suburb brief and consultation form.",
  },
  {
    number: "03",
    title: "Follow the response",
    body: "Unique campaign links connected scans, site visits and bookings, giving the agency a simple view of which café areas created the strongest conversations.",
  },
]

const journeySteps = [
  {
    Icon: Coffee,
    title: "Cup received",
    body: "A buyer picks up their regular coffee in a target suburb.",
  },
  {
    Icon: ScanLine,
    title: "Site opened",
    body: "The cup QR opens a fast, mobile suburb-readiness checklist.",
  },
  {
    Icon: CheckCircle2,
    title: "Conversation started",
    body: "A short form turns interest into a 20-minute buying-plan call.",
  },
]

const CaseStudies = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Buyers Agent Case Study | CupSpace"
  }, [])

  return (
    <div className="public-site">
      <SiteHeader />

      <main>
        <article>
          <header className="paper-noise border-b-2 border-foreground">
            <div className="container-custom py-14 lg:py-20">
              <div className="max-w-6xl">
                <span className="eyebrow mb-8">
                  Campaign example / buyers agency
                </span>
                <h1 className="font-display text-[clamp(3.8rem,7.4vw,7.8rem)] uppercase leading-[0.9] tracking-[-0.05em]">
                  The coffee run that opened 32 doors.
                </h1>
                <p className="mt-8 max-w-2xl border-l-4 border-primary pl-5 text-xl font-medium leading-relaxed text-muted-foreground">
                  How a Sydney buyers agency used 20,000 takeaway cups across
                  two cafés to turn local morning routines into measurable
                  property conversations.
                </p>
              </div>
            </div>

            <div className="border-t-2 border-foreground bg-secondary/70">
              <div className="container-custom py-4 text-xs font-bold uppercase tracking-[0.13em] text-muted-foreground">
                Buyers agency / Sydney inner east and inner west
              </div>
            </div>
          </header>

          <section className="border-b-2 border-foreground bg-foreground text-background">
            <div className="container-custom grid sm:grid-cols-2 lg:grid-cols-4">
              {campaignMetrics.map(([value, label], index) => (
                <div
                  key={label}
                  className={`px-6 py-9 sm:px-8 ${
                    index ? "border-t border-background/25" : ""
                  } ${
                    index % 2 ? "sm:border-l" : "sm:border-l-0"
                  } ${
                    index >= 2 ? "sm:border-t" : "sm:border-t-0"
                  } ${
                    index ? "lg:border-l lg:border-t-0" : "lg:border-l-0"
                  }`}
                >
                  <p className="font-display text-5xl text-accent sm:text-6xl">
                    {value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-background/60">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="section-padding border-b-2 border-foreground">
            <div className="container-custom grid gap-14 lg:grid-cols-[0.65fr_1.35fr]">
              <div>
                <span className="eyebrow">The brief</span>
                <dl className="mt-8 space-y-5 border-l-2 border-foreground pl-5 text-sm">
                  <div>
                    <dt className="font-bold uppercase tracking-[0.1em]">Client</dt>
                    <dd className="mt-1 text-muted-foreground">
                      Buyers agency
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[0.1em]">Market</dt>
                    <dd className="mt-1 text-muted-foreground">
                      Sydney inner east and inner west
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[0.1em]">Run</dt>
                    <dd className="mt-1 text-muted-foreground">
                      6 weeks / 2 cafés / 10,000 cups each
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="max-w-4xl">
                <h2 className="heading-section">
                  Be useful before asking for attention.
                </h2>
                <div className="space-y-7 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  <p>
                    The buyers agency was built for time-poor buyers who wanted
                    local advice without the usual property noise. It had a strong
                    referral network, but paid social was placing it beside every
                    mortgage calculator, listing portal and competing agent in the
                    market.
                  </p>
                  <p>
                    The challenge was not awareness alone. It was context. The
                    agency needed to show up when potential buyers were thinking
                    about suburbs, commutes and the shape of their next move—not
                    while they were clearing another crowded feed.
                  </p>
                  <p className="border-y-2 border-foreground py-7 font-display text-3xl uppercase leading-[1.02] text-primary sm:text-5xl">
                    Property decisions are local. So are coffee habits.
                  </p>
                  <p>
                    CupSpace connected those two behaviours. A six-week run placed
                    10,000 cups in each of two selected cafés near high-intent
                    buyer audiences, then gave every cup a direct path to a
                    genuinely useful suburb-planning site.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b-2 border-foreground bg-primary py-16 text-primary-foreground sm:py-20">
            <div className="container-custom">
              <span className="inline-flex border-2 border-primary-foreground bg-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-accent-foreground">
                The audience journey
              </span>
              <h2 className="mt-8 max-w-4xl font-display text-4xl uppercase leading-[0.95] sm:text-6xl">
                One cup. One useful next step.
              </h2>
              <ol className="mt-10 grid border-2 border-primary-foreground lg:grid-cols-3">
                {journeySteps.map(({ Icon, title, body }, index) => (
                  <li
                    key={title}
                    className={`p-7 sm:p-9 ${
                      index
                        ? "border-t-2 border-primary-foreground lg:border-l-2 lg:border-t-0"
                        : ""
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center border-2 border-primary-foreground bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-7 font-bold uppercase tracking-[0.08em]">
                      {title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-primary-foreground/70">
                      {body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="poster-grid section-padding border-b-2 border-foreground">
            <div className="container-custom">
              <span className="eyebrow">Campaign build / three moves</span>
              <h2 className="heading-section mt-8 max-w-5xl">
                Designed around the buyer, not the billboard.
              </h2>

              <div className="mt-12 grid border-2 border-foreground lg:grid-cols-3">
                {campaignSteps.map((step, index) => (
                  <article
                    key={step.number}
                    className={`bg-card p-7 sm:p-9 ${
                      index
                        ? "border-t-2 border-foreground lg:border-l-2 lg:border-t-0"
                        : ""
                    }`}
                  >
                    <p className="font-display text-6xl text-accent">
                      {step.number}
                    </p>
                    <h3 className="mt-8 font-display text-3xl uppercase leading-none text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-5 leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section-padding border-b-2 border-foreground">
            <div className="container-custom grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <span className="eyebrow">The result</span>
                <h2 className="heading-section mt-8">
                  A small format created a full funnel.
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  The strongest response came from repeat exposure around
                  Marrickville and Newtown. People did not need to make a property
                  decision on the spot; they only needed a useful reason to keep
                  the agency in mind and an easy way to take the next step.
                </p>
              </div>

              <div className="border-2 border-foreground bg-secondary/60 p-7 shadow-elegant sm:p-10">
                <div className="space-y-6">
                  {[
                    ["8.0%", "of cup handoffs became landing-page visits"],
                    ["14.0%", "of visitors completed a qualified enquiry"],
                    ["6", "new exclusive buyer briefs were signed"],
                    ["2", "buyers exchanged on homes within seven weeks"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[110px_1fr] items-baseline gap-4 border-b border-foreground/20 pb-5 last:border-0 last:pb-0"
                    >
                      <strong className="font-display text-4xl text-primary">
                        {value}
                      </strong>
                      <span className="leading-relaxed text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-b-2 border-foreground bg-accent py-16 sm:py-20">
            <div className="container-custom grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  The success story
                </span>
                <p className="mt-7 max-w-5xl font-display text-4xl uppercase leading-[0.98] sm:text-6xl">
                  Two buyers scanned over weekend coffee, returned to the site
                  that night and booked the following week. Both went on to sign
                  buyer briefs and exchange on homes in their target areas within
                  seven weeks.
                </p>
              </div>
              <p className="border-l-4 border-foreground pl-5 text-lg leading-relaxed text-accent-foreground/75">
                The campaign worked because the physical moment, local context and
                digital follow-up all pointed to the same useful action.
              </p>
            </div>
          </section>

          <section className="bg-background py-16 sm:py-20">
            <div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <span className="eyebrow">Your campaign / next</span>
                <h2 className="mt-7 max-w-4xl font-display text-4xl uppercase leading-[0.92] sm:text-6xl">
                  Put your next local audience within reach.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Tell us who you need to reach, where they spend their mornings
                  and what action matters most.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                <Link
                  to="/advertiser-form"
                  className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-foreground"
                >
                  Build a campaign brief <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/locations"
                  className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-background px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] transition hover:bg-accent"
                >
                  Explore locations <MapPin className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  )
}

export default CaseStudies
