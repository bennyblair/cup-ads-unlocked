import type { ReactNode } from "react"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"

const DraftPage = ({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: string
  lede: string
  children: ReactNode
}) => (
  <div className="public-site">
    <SiteHeader />
    <main>
      <section className="border-b-2 border-foreground bg-primary py-20 text-primary-foreground sm:py-28">
        <div className="container-custom">
          <span className="eyebrow mb-8">{eyebrow}</span>
          <h1 className="max-w-6xl font-display text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em]">{title}</h1>
          <p className="mt-9 max-w-2xl border-l-4 border-accent pl-5 text-xl leading-relaxed text-primary-foreground/75">{lede}</p>
        </div>
      </section>
      <section className="paper-noise section-padding border-b-2 border-foreground">
        <div className="container-custom max-w-3xl space-y-5 text-lg leading-relaxed">
          <p className="border-2 border-foreground bg-accent px-4 py-3 text-sm font-bold leading-relaxed text-accent-foreground">
            Draft for review. This is a starting point for CUPSPACE PTY LTD and needs approval before anyone relies on it.
          </p>
          {children}
        </div>
      </section>
    </main>
    <Footer />
  </div>
)

export default DraftPage
