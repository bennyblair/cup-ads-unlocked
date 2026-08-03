import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

const ProblemSection = () => (
  <section id="audiences" className="border-b-2 border-foreground">
    <div className="grid lg:grid-cols-2">
      <article className="bg-accent px-6 py-14 text-accent-foreground sm:px-10 sm:py-16 lg:px-[max(3rem,calc((100vw-1440px)/2+3rem))] lg:py-20">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em]">
          For brands / beyond the feed
        </p>
        <h2 className="max-w-xl font-display text-5xl uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
          Own the local coffee run.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-accent-foreground/80">
          Feeds are crowded and easy to scroll past. Put your brand inside a
          daily neighbourhood ritual—in the exact suburbs you want to reach.
        </p>
        <Link
          to="/how-it-works#brands"
          className="mt-7 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.1em]"
        >
          Why cup media works <ArrowUpRight className="h-4 w-4" />
        </Link>
      </article>

      <article className="bg-primary px-6 py-14 text-primary-foreground sm:px-10 sm:py-16 lg:px-[max(3rem,calc((100vw-1440px)/2+3rem))] lg:py-20">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-accent">
          For cafés
        </p>
        <h2 className="max-w-xl font-display text-5xl uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl">
          Free cups. Lower overhead.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
          Branded takeaway cups supplied at no cost to approved café partners.
        </p>
        <Link
          to="/how-it-works#cafes"
          className="mt-7 inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-sm font-bold uppercase tracking-[0.1em]"
        >
          How café supply works <ArrowUpRight className="h-4 w-4" />
        </Link>
      </article>
    </div>
  </section>
)

export default ProblemSection
