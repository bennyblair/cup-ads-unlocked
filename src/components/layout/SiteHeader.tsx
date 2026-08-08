import { Menu, X } from "lucide-react"
import { Link } from "react-router-dom"

import BrandMark from "@/components/brand/BrandMark"

const SiteHeader = () => (
  <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur">
    <div className="container-custom flex h-16 items-center justify-between gap-4 sm:h-[70px]">
      <BrandMark />

      <nav
        className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.12em] lg:flex"
        aria-label="Main navigation"
      >
        <Link className="transition hover:text-primary" to="/#solution">
          The model
        </Link>
        <Link className="transition hover:text-primary" to="/locations">
          Locations
        </Link>
        <Link className="transition hover:text-primary" to="/savings-calculator">
          Savings
        </Link>
        <Link className="transition hover:text-primary" to="/about">
          Our story
        </Link>
        <Link className="transition hover:text-primary" to="/case-studies">
          Case studies
        </Link>
      </nav>

      <div className="hidden items-stretch text-xs font-bold uppercase tracking-[0.08em] lg:flex">
        <Link
          to="/advertiser-form"
          className="border-2 border-foreground bg-primary px-3 py-2.5 text-primary-foreground transition hover:bg-foreground sm:px-4"
        >
          <span className="hidden sm:inline">For </span>brands
        </Link>
        <Link
          to="/cafe-form"
          className="-ml-0.5 border-2 border-foreground bg-accent px-3 py-2.5 text-accent-foreground transition hover:bg-foreground hover:text-background sm:px-4"
        >
          <span className="hidden sm:inline">For </span>cafés
        </Link>
      </div>

      <details className="group relative lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 border-2 border-foreground bg-background px-3 text-xs font-bold uppercase tracking-[0.1em] [&::-webkit-details-marker]:hidden">
          <Menu className="h-4 w-4 group-open:hidden" />
          <X className="hidden h-4 w-4 group-open:block" />
          Menu
        </summary>
        <nav
          aria-label="Mobile navigation"
          className="absolute right-0 top-[calc(100%+0.65rem)] w-[min(21rem,calc(100vw-2rem))] border-2 border-foreground bg-background p-2 shadow-[7px_7px_0_hsl(var(--foreground))]"
        >
          <div className="grid text-sm font-bold uppercase tracking-[0.08em]">
            <Link className="min-h-12 border-b border-foreground/20 px-3 py-3" to="/#solution">The model</Link>
            <Link className="min-h-12 border-b border-foreground/20 px-3 py-3" to="/locations">Locations</Link>
            <Link className="min-h-12 border-b border-foreground/20 px-3 py-3" to="/savings-calculator">Savings</Link>
            <Link className="min-h-12 border-b border-foreground/20 px-3 py-3" to="/about">Our story</Link>
            <Link className="min-h-12 px-3 py-3" to="/case-studies">Case studies</Link>
          </div>
          <div className="mt-2 grid grid-cols-2 text-center text-xs font-bold uppercase tracking-[0.08em]">
            <Link to="/advertiser-form" className="min-h-12 border-2 border-foreground bg-primary px-3 py-3 text-primary-foreground">For brands</Link>
            <Link to="/cafe-form" className="-ml-0.5 min-h-12 border-2 border-foreground bg-accent px-3 py-3 text-accent-foreground">For cafés</Link>
          </div>
        </nav>
      </details>
    </div>
  </header>
)

export default SiteHeader
