const steps = [
  ["01", "Choose the patch", "Tell us the audience, suburb and action your campaign needs."],
  ["02", "Print + deliver", "We coordinate the cup artwork and supply approved partner cafés."],
  ["03", "Serve + measure", "Cups go over the counter and QR response gives the campaign a next step."],
] as const

const ProcessSection = () => (
  <section id="process" className="section-padding border-b-2 border-foreground bg-foreground text-background">
    <div className="container-custom">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="eyebrow mb-6 border-background">From brief to coffee run</span>
          <h2 className="font-display text-5xl uppercase leading-[0.9] tracking-[-0.04em] sm:text-7xl md:text-8xl">
            How it moves.
          </h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed text-background/65">
          A physical campaign with a simple digital response path.
        </p>
      </div>

      <div className="grid border-2 border-background md:grid-cols-3">
        {steps.map(([number, title, body], index) => (
          <article
            key={number}
            className={`relative min-h-[300px] p-7 sm:p-9 ${index ? "border-t-2 border-background md:border-l-2 md:border-t-0" : ""}`}
          >
            <span className="font-display text-7xl leading-none text-accent">{number}</span>
            <h3 className="mt-12 font-display text-2xl uppercase leading-none sm:text-3xl">{title}</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-background/65">{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default ProcessSection
