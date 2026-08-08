import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import BrandMark from "@/components/brand/BrandMark"

const Footer = () => (
  <footer id="contact" className="bg-foreground py-12 text-background sm:py-16">
    <div className="container-custom">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-background/30 pb-10 sm:gap-x-10 lg:grid-cols-[1.4fr_0.6fr_0.6fr] lg:pb-12">
        <div className="col-span-2 lg:col-span-1">
          <div className="inline-flex border-2 border-background bg-background px-3 py-2">
            <BrandMark />
          </div>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-background/65">
            Branded takeaway cups for cafés. Local, trackable physical media for advertisers.
          </p>
          <a className="mt-5 inline-block border-b border-accent text-sm font-bold" href="mailto:info@cupspace.com.au">
            info@cupspace.com.au
          </a>
          <Link
            to="/case-studies"
            className="mt-7 flex min-h-12 max-w-lg items-center justify-between gap-4 border-2 border-background bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] transition hover:bg-accent hover:text-foreground"
          >
            Buyers agent case study <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>

        <nav aria-label="Explore" className="text-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent">Explore</p>
          <ul className="space-y-1 text-background/70">
            <li><Link className="flex min-h-11 items-center hover:text-background" to="/locations">Locations</Link></li>
            <li><Link className="flex min-h-11 items-center hover:text-background" to="/case-studies">Case studies</Link></li>
            <li><Link className="flex min-h-11 items-center hover:text-background" to="/savings-calculator">Savings calculator</Link></li>
            <li><Link className="flex min-h-11 items-center hover:text-background" to="/about">Our story</Link></li>
          </ul>
        </nav>

        <nav aria-label="Get started" className="text-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent">Get started</p>
          <ul className="space-y-1 text-background/70">
            <li><Link className="flex min-h-11 items-center hover:text-background" to="/advertiser-form">For brands</Link></li>
            <li><Link className="flex min-h-11 items-center hover:text-background" to="/cafe-form">For cafés</Link></li>
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-2 pt-7 text-xs uppercase tracking-[0.12em] text-background/45 sm:flex-row sm:justify-between">
        <p>© 2026 CupSpace. Australia.</p>
        <p>Physical media / local impact</p>
      </div>
    </div>
  </footer>
)

export default Footer
