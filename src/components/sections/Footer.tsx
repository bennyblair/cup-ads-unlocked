import { Link } from "react-router-dom"

import BrandMark from "@/components/brand/BrandMark"

const Footer = () => (
  <footer id="contact" className="bg-foreground py-12 text-background sm:py-16">
    <div className="container-custom">
      <div className="grid gap-10 border-b border-background/30 pb-12 lg:grid-cols-[1.4fr_0.6fr_0.6fr]">
        <div>
          <div className="inline-flex border-2 border-background bg-background px-3 py-2">
            <BrandMark />
          </div>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-background/65">
            Branded takeaway cups for cafés. Local, trackable physical media for advertisers.
          </p>
          <a className="mt-5 inline-block border-b border-accent text-sm font-bold" href="mailto:info@cupspace.com.au">
            info@cupspace.com.au
          </a>
        </div>

        <nav aria-label="Explore" className="text-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent">Explore</p>
          <ul className="space-y-3 text-background/70">
            <li><Link className="hover:text-background" to="/locations">Locations</Link></li>
            <li><Link className="hover:text-background" to="/case-studies">Case studies</Link></li>
            <li><Link className="hover:text-background" to="/savings-calculator">Savings calculator</Link></li>
            <li><Link className="hover:text-background" to="/about">Our story</Link></li>
          </ul>
        </nav>

        <nav aria-label="Get started" className="text-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent">Get started</p>
          <ul className="space-y-3 text-background/70">
            <li><Link className="hover:text-background" to="/advertiser-form">For brands</Link></li>
            <li><Link className="hover:text-background" to="/cafe-form">For cafés</Link></li>
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
