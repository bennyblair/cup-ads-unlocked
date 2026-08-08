const specs = [
  {
    number: "01",
    title: "Supply",
    body: "Branded takeaway cups are delivered to approved café partners at no cost.",
  },
  {
    number: "02",
    title: "Placement",
    body: "Campaigns are matched to the suburbs and café audiences a brand wants to reach.",
  },
  {
    number: "03",
    title: "Response",
    body: "A campaign QR code gives customers a direct next step and makes response measurable.",
  },
]

const SolutionSection = () => (
  <section id="solution" className="poster-grid section-padding border-b-2 border-foreground">
    <div className="container-custom grid gap-10 sm:gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div className="lg:sticky lg:top-28">
        <span className="eyebrow mb-7">The model / no fluff</span>
        <h2 className="heading-section max-w-3xl">
          Built to do more than hold coffee.
        </h2>
        <p className="max-w-xl text-lg font-medium leading-relaxed text-muted-foreground">
          CupSpace turns an everyday café essential into useful, local media.
          The café gets the cups. The brand gets the space. The customer gets a
          clear reason to scan.
        </p>
      </div>

      <div className="border-t-2 border-foreground bg-background">
        {specs.map((spec) => (
          <article
            key={spec.number}
            className="grid gap-3 border-b-2 border-foreground py-6 sm:grid-cols-[100px_1fr] sm:gap-5 sm:py-10"
          >
            <span className="font-display text-5xl leading-none text-accent [-webkit-text-stroke:1.5px_hsl(var(--foreground))] sm:text-6xl">
              {spec.number}
            </span>
            <div>
              <h3 className="font-display text-3xl uppercase tracking-[-0.03em] text-primary sm:text-4xl">
                {spec.title}
              </h3>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {spec.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default SolutionSection
