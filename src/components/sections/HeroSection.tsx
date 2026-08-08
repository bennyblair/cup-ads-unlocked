import { ArrowDownRight, ArrowRight, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import brandedCup from "@/assets/branded-cups-collection-updated.jpg"
import { HeroButton } from "@/components/ui/hero-button"

const HeroSection = () => (
  <section id="hero" className="paper-noise relative overflow-hidden border-b-2 border-foreground">
    <div className="container-custom grid items-center gap-10 py-12 sm:gap-12 sm:py-14 lg:min-h-[calc(100svh-70px)] lg:grid-cols-[1.08fr_0.72fr] lg:gap-16 lg:py-20">
      <div className="relative z-10">
        <span className="eyebrow mb-6 sm:mb-7">Australia&apos;s cup media network</span>
        <h1 className="heading-hero max-w-5xl">
          Cups for <span className="text-primary">cafés.</span>
          <br />
          Reach for <span className="text-accent [-webkit-text-stroke:2px_hsl(var(--foreground))]">brands.</span>
        </h1>
        <p className="text-hero-sub mt-6 max-w-2xl border-l-4 border-primary pl-4 sm:mt-8 sm:pl-5">
          Free branded takeaway cups for cafés. Local, trackable campaigns for
          advertisers. One useful piece of media, carried through the community.
        </p>

        <div className="mt-7 flex flex-col gap-4 sm:mt-9 sm:flex-row">
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

        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold">
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 border-b-2 border-foreground pb-1 transition hover:border-primary hover:text-primary"
          >
            <MapPin className="h-4 w-4" /> Explore the network
          </Link>
          <Link
            to="/savings-calculator"
            className="border-b-2 border-foreground pb-1 transition hover:border-primary hover:text-primary"
          >
            Calculate café savings
          </Link>
        </div>
      </div>

      <div className="relative mx-auto w-[calc(100%-1rem)] max-w-[340px] sm:max-w-[440px] lg:mr-2 lg:max-w-[520px]">
        <div className="absolute -left-3 -top-3 h-full w-full border-2 border-foreground bg-accent sm:-left-8 sm:-top-8" />
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

        <div className="absolute -right-2 top-9 rotate-3 border-2 border-foreground bg-background px-3 py-2 font-display text-lg uppercase leading-none shadow-[4px_4px_0_hsl(var(--foreground))] sm:-right-8 sm:top-12 sm:px-4 sm:py-3 sm:text-2xl">
          Held.<br />Seen.<br /><span className="text-primary">Scanned.</span>
        </div>
      </div>
    </div>

    <div className="overflow-hidden border-t-2 border-foreground bg-foreground py-3 text-background">
      <div className="ticker-track flex whitespace-nowrap font-display text-lg uppercase tracking-[-0.02em]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 gap-10 pr-10"
            aria-hidden={copy === 1}
          >
            <span>Local reach</span><span className="text-accent">✦</span>
            <span>Free café cups</span><span className="text-accent">✦</span>
            <span>Trackable QR</span><span className="text-accent">✦</span>
            <span>Campaigns people carry</span><span className="text-accent">✦</span>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default HeroSection
