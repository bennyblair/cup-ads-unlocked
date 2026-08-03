import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const LocationsExplorer = lazy(
  () => import("@/components/locations/LocationsExplorer"),
)

const NetworkSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || shouldLoadMap) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true)
          observer.disconnect()
        }
      },
      { rootMargin: "400px" },
    )

    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [shouldLoadMap])

  return (
    <section ref={sectionRef} id="network" className="poster-grid border-b-2 border-foreground py-16 md:py-20">
      <div className="container-custom">
        <div className="mb-9 grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <span className="eyebrow mb-7">The CupSpace network</span>
            <h2 className="heading-section mb-0 max-w-4xl">Pick your patch.</h2>
          </div>
          <div className="lg:pb-2">
            <p className="text-lg font-medium leading-relaxed text-muted-foreground">
              Select a marker, compare live areas or request the exact Australian
              suburb your campaign needs.
            </p>
            <Link
              to="/locations"
              className="mt-5 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.08em] transition hover:border-primary hover:text-primary"
            >
              Open the full map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {shouldLoadMap ? (
          <Suspense
            fallback={
              <div className="flex min-h-[680px] items-center justify-center border-2 border-foreground bg-card text-sm font-bold uppercase tracking-[0.1em] text-primary shadow-elegant">
                Loading the CupSpace map…
              </div>
            }
          >
            <LocationsExplorer
              compact
              className="rounded-none border-2 border-foreground shadow-[9px_9px_0_hsl(var(--foreground))]"
            />
          </Suspense>
        ) : (
          <div className="flex min-h-[680px] items-center justify-center border-2 border-foreground bg-card text-sm font-bold uppercase tracking-[0.1em] text-primary shadow-elegant">
            Map loads as you approach this section
          </div>
        )}
      </div>
    </section>
  )
}

export default NetworkSection
