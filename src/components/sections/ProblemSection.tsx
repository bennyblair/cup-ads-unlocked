import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

const ProblemSection = () => (
  <section id="problem" className="border-b-2 border-foreground">
    <div className="grid lg:grid-cols-2">
      <article className="bg-primary px-4 py-14 text-primary-foreground sm:px-10 sm:py-20 lg:px-[max(3rem,calc((100vw-1440px)/2+3rem))] lg:py-28">
        <p className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-accent">
          For cafés
        </p>
        <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-[-0.04em] sm:text-7xl sm:leading-[0.9]">
          Cups cost money. Ours don&apos;t.
        </h2>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
          CupSpace supplies branded takeaway cups at no cost, helping cafés
          remove a recurring expense without changing how they serve coffee.
        </p>
        <Link
          to="/savings-calculator"
          className="mt-9 inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-sm font-bold uppercase tracking-[0.1em]"
        >
          See the savings <ArrowUpRight className="h-4 w-4" />
        </Link>
      </article>

      <article className="bg-accent px-4 py-14 text-accent-foreground sm:px-10 sm:py-20 lg:px-[max(3rem,calc((100vw-1440px)/2+3rem))] lg:py-28">
        <p className="mb-8 text-xs font-bold uppercase tracking-[0.2em]">
          For brands
        </p>
        <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-[-0.04em] sm:text-7xl sm:leading-[0.9]">
          Reach that leaves the screen.
        </h2>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-accent-foreground/80">
          Put your campaign in people&apos;s hands, choose the areas that matter,
          and use trackable QR codes to turn attention into action.
        </p>
        <Link
          to="/locations"
          className="mt-9 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.1em]"
        >
          Choose an area <ArrowUpRight className="h-4 w-4" />
        </Link>
      </article>
    </div>
  </section>
)

export default ProblemSection
