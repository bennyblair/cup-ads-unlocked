import { ArrowDownRight, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { HeroButton } from "@/components/ui/hero-button"

const CTASection = () => (
  <section id="cta" className="border-b-2 border-foreground bg-accent py-14 sm:py-16">
    <div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
      <div>
        <span className="mb-5 inline-block text-xs font-bold uppercase tracking-[0.2em]">
          Choose your side
        </span>
        <h2 className="max-w-3xl font-display text-4xl uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
          Put the next cup to work.
        </h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link to="/advertiser-form">
          <HeroButton size="lg" className="w-full sm:w-auto">
            Plan a campaign <ArrowRight className="ml-2 h-4 w-4" />
          </HeroButton>
        </Link>
        <Link to="/cafe-form">
          <HeroButton size="lg" variant="outline" className="w-full bg-background sm:w-auto">
            Get cups supplied <ArrowDownRight className="ml-2 h-4 w-4" />
          </HeroButton>
        </Link>
      </div>
    </div>
  </section>
)

export default CTASection
