import { useEffect } from "react"
import { ArrowDownRight, ArrowRight, Check } from "lucide-react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import CTASection from "@/components/sections/CTASection"
import Footer from "@/components/sections/Footer"
import ProcessSection from "@/components/sections/ProcessSection"
import SolutionSection from "@/components/sections/SolutionSection"
import { HeroButton } from "@/components/ui/hero-button"

const audiences = [
  {
    id: "brands",
    eyebrow: "For brands",
    title: "Reach people beyond the feed.",
    body: "Digital ads compete for a split second of attention. CupSpace puts your brand inside the daily coffee run—at the café counter, through the suburb and into the workplace.",
    points: [
      "Choose the exact suburbs and audience you need",
      "Turn a useful everyday object into local brand attention",
      "Connect real-world reach to trackable QR response",
    ],
    action: "Plan a campaign",
    href: "/advertiser-form",
    tone: "bg-accent text-accent-foreground",
  },
  {
    id: "cafes",
    eyebrow: "For cafés",
    title: "Take a recurring cup cost off the counter.",
    body: "Tell CupSpace what your café uses. Approved campaign supply arrives branded and ready to serve, without changing the way you make coffee.",
    points: [
      "Share your weekly cup requirements",
      "Receive approved campaign supply at no cost",
      "Your venue stays private until campaign confirmation",
    ],
    action: "Get cups supplied",
    href: "/cafe-form",
    tone: "bg-primary text-primary-foreground",
  },
] as const

const HowItWorks = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "How CupSpace Works | CupSpace"

    const frame = window.requestAnimationFrame(() => {
      const sectionId = window.location.hash.slice(1)
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ block: "start" })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="public-site">
      <SiteHeader />
      <main>
        <section className="paper-noise border-b-2 border-foreground py-20 sm:py-24">
          <div className="container-custom">
            <span className="eyebrow mb-7">How CupSpace works</span>
            <h1 className="max-w-6xl font-display text-[clamp(3.8rem,9vw,8rem)] uppercase leading-[0.84] tracking-[-0.055em]">
              One cup.<br />Two wins.
            </h1>
            <p className="mt-8 max-w-2xl border-l-4 border-primary pl-5 text-xl leading-relaxed text-muted-foreground">
              Brands fund useful local media. Cafés receive branded takeaway
              cup supply. CupSpace coordinates what happens between them.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/advertiser-form">
                <HeroButton size="lg" className="w-full sm:w-auto">
                  Plan a campaign <ArrowRight className="ml-2 h-4 w-4" />
                </HeroButton>
              </Link>
              <Link to="/cafe-form">
                <HeroButton size="lg" variant="outline" className="w-full sm:w-auto">
                  Get cups supplied <ArrowDownRight className="ml-2 h-4 w-4" />
                </HeroButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground">
          <div className="grid lg:grid-cols-2">
            {audiences.map((audience) => (
              <article
                key={audience.id}
                id={audience.id}
                className={`${audience.tone} scroll-mt-20 px-6 py-16 sm:px-10 sm:py-20 lg:px-[max(3rem,calc((100vw-1440px)/2+3rem))]`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  {audience.eyebrow}
                </p>
                <h2 className="mt-6 max-w-2xl font-display text-4xl uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
                  {audience.title}
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-75">
                  {audience.body}
                </p>
                <ul className="mt-8 space-y-3" aria-label={`${audience.eyebrow} benefits`}>
                  {audience.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 font-medium">
                      <Check className="mt-0.5 h-5 w-5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={audience.href}
                  className="mt-9 inline-flex items-center gap-2 border-b-2 border-current pb-1 text-sm font-bold uppercase tracking-[0.1em]"
                >
                  {audience.action} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <SolutionSection />
        <ProcessSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default HowItWorks
