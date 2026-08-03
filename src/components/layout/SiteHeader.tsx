import { Link } from "react-router-dom"

import BrandMark from "@/components/brand/BrandMark"

const SiteHeader = () => (
  <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur">
    <div className="container-custom flex h-[70px] items-center justify-between gap-2 sm:gap-4">
      <BrandMark compactOnMobile className="shrink-0" />

      <nav
        className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.12em] md:flex"
        aria-label="Main navigation"
      >
        <Link className="transition hover:text-primary" to="/how-it-works">
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
      </nav>

      <div className="flex shrink-0 items-stretch whitespace-nowrap text-[0.64rem] font-bold uppercase tracking-[0.06em] min-[400px]:text-[0.68rem] sm:text-xs sm:tracking-[0.08em]">
        <Link
          to="/advertiser-form"
          className="border-2 border-foreground bg-primary px-2.5 py-2.5 text-primary-foreground transition hover:bg-foreground min-[400px]:px-3 sm:px-4"
        >
          <span className="hidden sm:inline">For </span>brands
        </Link>
        <Link
          to="/cafe-form"
          className="-ml-0.5 border-2 border-foreground bg-accent px-2.5 py-2.5 text-accent-foreground transition hover:bg-foreground hover:text-background min-[400px]:px-3 sm:px-4"
        >
          <span className="hidden sm:inline">For </span>cafés
        </Link>
      </div>
    </div>
  </header>
)

export default SiteHeader
