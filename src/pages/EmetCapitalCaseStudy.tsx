import { useEffect } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Coffee,
  ScanLine,
  Target,
} from "lucide-react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"

const campaignMetrics = [
  ["60,000", "cups placed"],
  ["6", "target café areas"],
  ["4", "capital cities"],
  ["1", "focused response path"],
]

const campaignSteps = [
  {
    number: "01",
    title: "Follow the audience",
    body: "CupSpace focused placement around Double Bay and Mosman in Sydney, Toorak and Brighton in Melbourne, New Farm in Brisbane and Cottesloe in Perth.",
  },
  {
    number: "02",
    title: "Translate the offer",
    body: "The cup creative made a complex service feel direct: private and non-bank commercial funding for borrowers whose timing or circumstances sat outside standard bank pathways.",
  },
  {
    number: "03",
    title: "Create one next step",
    body: "A campaign QR sent people to a focused Emet Capital site experience where they could understand the lending scenarios, review fit and start a conversation.",
  },
]

const audienceSteps = [
  {
    Icon: Coffee,
    title: "Seen locally",
    body: "The campaign appears during a familiar coffee routine in a carefully selected high-value area.",
  },
  {
    Icon: ScanLine,
    title: "Private lending explained",
    body: "The QR opens a concise mobile page covering commercial property, bridging and business-purpose funding scenarios.",
  },
  {
    Icon: CheckCircle2,
    title: "Enquiry started",
    body: "A clear contact path turns relevant interest into a conversation with the Emet Capital team.",
  },
]

const outcomes = [
  ["4", "capital-city markets reached through one coordinated campaign"],
  ["6", "affluent café areas selected around the intended audience"],
  ["QR", "response connected every physical placement to Emet Capital online"],
  ["New", "customer conversations created for the private-lending team"],
]

const EmetCapitalCaseStudy = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Emet Capital Case Study | CupSpace"
  }, [])

  return (
    <div className="public-site">
      <SiteHeader />

      <main>
        <article>
          <header className="paper-noise border-b-2 border-foreground">
            <div className="container-custom py-14 lg:py-20">
              <Link
                to="/case-studies"
                className="mb-8 inline-flex min-h-11 items-center gap-2 border-b-2 border-foreground text-xs font-bold uppercase tracking-[0.1em] transition hover:border-primary hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" /> All case studies
              </Link>
              <div className="max-w-6xl">
                <span className="eyebrow mb-8">
                  Emet Capital / private lending
                </span>
                <h1 className="font-display text-[clamp(3rem,7.4vw,7.8rem)] uppercase leading-[0.95] tracking-[-0.05em] sm:leading-[0.9]">
                  Private lending, placed in the right postcodes.
                </h1>
                <p className="mt-8 max-w-3xl border-l-4 border-primary pl-5 text-xl font-medium leading-relaxed text-muted-foreground">
                  How CupSpace hyper-targeted affluent areas across four capital
                  cities to put Emet Capital in front of property investors,
                  developers and business owners—and turn local attention into
                  new customer conversations.
                </p>
              </div>
            </div>

            <div className="border-t-2 border-foreground bg-secondary/70">
              <div className="container-custom py-4 text-xs font-bold uppercase tracking-[0.13em] text-muted-foreground">
                Commercial finance / Sydney, Melbourne, Brisbane and Perth
              </div>
            </div>
          </header>

          <section className="border-b-2 border-foreground bg-foreground text-background">
            <div className="container-custom grid grid-cols-2 lg:grid-cols-4">
              {campaignMetrics.map(([value, label], index) => (
                <div
                  key={label}
                  className={`px-3 py-7 sm:px-8 sm:py-9 ${
                    index % 2 ? "border-l border-background/25" : ""
                  } ${index >= 2 ? "border-t border-background/25" : ""} ${
                    index ? "lg:border-l lg:border-t-0" : "lg:border-l-0"
                  }`}
                >
                  <p className="font-display text-4xl text-accent sm:text-6xl">
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
            <div className="container-custom grid gap-10 sm:gap-14 lg:grid-cols-[0.65fr_1.35fr]">
              <div>
                <span className="eyebrow">The brief</span>
                <dl className="mt-8 space-y-5 border-l-2 border-foreground pl-5 text-sm">
                  <div>
                    <dt className="font-bold uppercase tracking-[0.1em]">Client</dt>
                    <dd className="mt-1 text-muted-foreground">Emet Capital</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[0.1em]">Audience</dt>
                    <dd className="mt-1 text-muted-foreground">
                      Property investors, developers and business owners
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[0.1em]">Run</dt>
                    <dd className="mt-1 text-muted-foreground">
                      6 café areas / 4 capital cities
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="max-w-4xl">
                <h2 className="heading-section">
                  Reach the people behind the deal.
                </h2>
                <div className="space-y-7 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  <p>
                    Emet Capital connects Australian businesses, property
                    investors and developers with commercial finance, including
                    private and non-bank lending. The service is highly relevant
                    when a transaction is time-sensitive, complex or outside a
                    traditional bank&apos;s standard criteria.
                  </p>
                  <p>
                    The audience is valuable but difficult to isolate through
                    broad media. They are not always actively searching for
                    finance, and the need often appears around an acquisition,
                    refinance, development or business opportunity.
                  </p>
                  <p className="border-y-2 border-foreground py-7 font-display text-3xl uppercase leading-[1.02] text-primary sm:text-5xl">
                    The right postcode can say as much as the right keyword.
                  </p>
                  <p>
                    CupSpace built the campaign around geography and routine.
                    Instead of buying undifferentiated city-wide reach, Emet
                    Capital appeared through cafés in affluent areas with strong
                    concentrations of property ownership, professional services
                    and business decision-makers.
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
                Local relevance. Commercial intent.
              </h2>
              <ol className="mt-10 grid border-2 border-primary-foreground lg:grid-cols-3">
                {audienceSteps.map(({ Icon, title, body }, index) => (
                  <li
                    key={title}
                    className={`p-6 sm:p-9 ${
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
                Hyper-targeted without feeling targeted.
              </h2>

              <div className="mt-12 grid border-2 border-foreground lg:grid-cols-3">
                {campaignSteps.map((step, index) => (
                  <article
                    key={step.number}
                    className={`bg-card p-6 sm:p-9 ${
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
            <div className="container-custom grid gap-10 sm:gap-14 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <span className="eyebrow">The result</span>
                <h2 className="heading-section mt-8">
                  National reach with a local filter.
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  The campaign created repeated visibility in a small number of
                  deliberately chosen markets. Each cup connected the physical
                  placement to Emet Capital online, helping turn awareness into
                  site traffic, enquiries and new commercial lending
                  conversations.
                </p>
              </div>

              <div className="border-2 border-foreground bg-secondary/60 p-5 shadow-elegant sm:p-10">
                <div className="space-y-5 sm:space-y-6">
                  {outcomes.map(([value, label]) => (
                    <div
                      key={label}
                      className="flex flex-col items-start border-b border-foreground/20 pb-5 sm:grid sm:grid-cols-[110px_1fr] sm:items-baseline sm:gap-4 last:border-0 last:pb-0"
                    >
                      <strong className="whitespace-nowrap font-display text-[2.75rem] leading-none text-primary sm:text-4xl">
                        {value}
                      </strong>
                      <span className="mt-2 leading-relaxed text-muted-foreground sm:mt-0">
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
                  Why it worked
                </span>
                <p className="mt-7 max-w-5xl font-display text-3xl uppercase leading-[1.02] sm:text-6xl sm:leading-[0.98]">
                  Emet Capital did not need to reach everyone. It needed to show
                  up consistently around the people most likely to recognise the
                  value of a flexible commercial funding conversation.
                </p>
              </div>
              <div className="border-l-4 border-foreground pl-5 text-lg leading-relaxed text-accent-foreground/75">
                <Target className="mb-4 h-7 w-7" />
                Café placement made the media feel local while the QR response
                kept the campaign measurable across every city.
              </div>
            </div>
          </section>

          <section className="bg-background py-16 sm:py-20">
            <div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <span className="eyebrow">Your campaign / next</span>
                <h2 className="mt-7 max-w-4xl font-display text-4xl uppercase leading-[0.92] sm:text-6xl">
                  Put your next valuable audience within reach.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Tell us the people, postcodes and action your campaign needs.
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
                  to="/case-studies"
                  className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-background px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] transition hover:bg-accent"
                >
                  All case studies <Building2 className="h-4 w-4" />
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

export default EmetCapitalCaseStudy
