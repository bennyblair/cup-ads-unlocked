import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Our Story | CupSpace"
  }, [])

  return (
    <div className="public-site">
      <SiteHeader />
      <main>
        <section className="border-b-2 border-foreground bg-primary py-20 text-primary-foreground sm:py-28">
          <div className="container-custom">
            <span className="eyebrow mb-8">Our story / three mates</span>
            <h1 className="max-w-6xl font-display text-[clamp(3rem,10vw,9rem)] uppercase leading-[0.9] tracking-[-0.055em] sm:leading-[0.82]">
              A café closed. The idea opened.
            </h1>
            <p className="mt-9 max-w-2xl border-l-4 border-accent pl-5 text-xl leading-relaxed text-primary-foreground/75">
              CupSpace started with a simple question: could the takeaway cup
              itself help cafés spend less and give brands a better local channel?
            </p>
          </div>
        </section>

        <section className="paper-noise section-padding border-b-2 border-foreground">
          <div className="container-custom grid gap-14 lg:grid-cols-[0.65fr_1.35fr]">
            <div>
              <span className="eyebrow">The short version</span>
            </div>
            <div className="max-w-4xl space-y-8 text-xl leading-relaxed sm:text-2xl">
              <p>
                It started with three mates watching a favourite local café close.
                Rising costs had taken out more than a place to buy coffee; the
                neighbourhood lost a meeting point and local jobs.
              </p>
              <p>
                Takeaway cups were one of those constant costs. They were also
                blank space moving through the streets every morning.
              </p>
              <blockquote className="border-y-2 border-foreground py-8 font-display text-4xl uppercase leading-[0.95] text-primary sm:text-6xl">
                “What if the cup paid for itself?”
              </blockquote>
              <p>
                That became CupSpace: advertisers fund useful, well-placed cup
                media; cafés receive cup supply; QR codes give each campaign a
                direct response path.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground">
          <div className="container-custom py-20 sm:py-24">
            <h2 className="heading-section max-w-4xl">What we want to change.</h2>
            <div className="mt-12 grid border-2 border-foreground md:grid-cols-3">
              {[
                ["Cafés", "Remove a recurring cup cost so more money stays behind the counter."],
                ["Brands", "Make local advertising tangible, useful and easy to act on."],
                ["Communities", "Help independent cafés keep doing what makes an area feel local."],
              ].map(([title, body], index) => (
                <article key={title} className={`min-h-[280px] p-8 ${index ? "border-t-2 border-foreground md:border-l-2 md:border-t-0" : ""}`}>
                  <span className="font-display text-6xl text-accent">0{index + 1}</span>
                  <h3 className="mt-10 font-display text-3xl uppercase text-primary">{title}</h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-accent py-16 sm:py-20">
          <div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <h2 className="max-w-3xl font-display text-4xl uppercase leading-[0.9] sm:text-6xl">Put the next cup to work.</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground" to="/advertiser-form">For brands <ArrowRight className="h-4 w-4" /></Link>
              <Link className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-background px-6 py-4 text-sm font-bold uppercase tracking-[0.08em]" to="/cafe-form">For cafés <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default About
