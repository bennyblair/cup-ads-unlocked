import { ArrowDownRight, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import brandedCup from "@/assets/branded-cups-collection-updated.jpg"
import { HeroButton } from "@/components/ui/hero-button"

const HeroSection = () => (
  <section id="hero" className="paper-noise relative overflow-hidden border-b-2 border-foreground">
    <div className="container-custom grid min-h-[calc(100svh-70px)] items-center gap-12 py-14 lg:grid-cols-[1.08fr_0.72fr] lg:gap-16 lg:py-20">
      <div className="relative z-10">
        <span className="eyebrow mb-7">Australia&apos;s cup media network</span>
        <h1 className="heading-hero max-w-5xl">
          Cups for <span className="text-primary">cafes.</span>
          <br />
          Reach for <span className="text-accent [-webkit-text-stroke:2px_hsl(var(--foreground))]">brands.</span>
        </h1>
        <p className="text-hero-sub mt-8 max-w-2xl border-l-4 border-primary pl-5">
          Cut through crowded feeds with intimate, hyper-local cup advertising.
          Brands choose the suburbs and drive trackable action, while cafés get
          their cups supplied at no cost.
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

      <div className="relative mx-auto w-full max-w-[520px] lg:mr-2">
        <div className="absolute -left-5 -top-5 h-full w-full border-2 border-foreground bg-accent sm:-left-8 sm:-top-8" />
        <figure className="relative border-2 border-foreground bg-primary p-3 shadow-[10px_10px_0_hsl(var(--foreground))]">
          <div className="relative aspect-[4/5] overflow-hidden bg-primary">
            <img
              src={brandedCup}
              alt="Green CupSpace branded takeaway cup"
              className="h-full w-full object-cover object-center saturate-[0.85] contrast-[1.08]"
            />
            <div className="pointer-events-none absolute inset-0 bg-primary/10 mix-blend-multiply" />
          </div>
          <figcaption className="flex items-center justify-between gap-4 bg-primary px-2 pb-1 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground">
            <span>Physical media / Local reach</span>
            <span>01</span>
          </figcaption>
        </figure>

        <div className="absolute -right-3 top-12 rotate-3 border-2 border-foreground bg-background px-4 py-3 font-display text-xl uppercase leading-none shadow-[4px_4px_0_hsl(var(--foreground))] sm:-right-8 sm:text-2xl">
          Held.<br />Seen.<br /><span className="text-primary">Scanned.</span>
        </div>
      </div>
    </div>

  </section>
)

export default HeroSection
