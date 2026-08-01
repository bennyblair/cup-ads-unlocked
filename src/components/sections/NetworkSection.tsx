import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const LocationsExplorer = lazy(
  () => import("@/components/locations/LocationsExplorer"),
)

const NetworkSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || shouldLoadMap) {
      return
    }

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
  <section ref={sectionRef} id="network" className="section-padding bg-gradient-subtle">
    <div className="container-custom">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent">
          The CupSpace network
        </p>
        <h2 className="heading-section">Choose where your campaign lands</h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Explore anonymous approximate markers for approved partner cafés and
          the Australian areas we are actively building toward. Target areas are
          clearly marked and are not claimed partners.
        </p>
        <Link
          to="/locations"
          className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:text-accent"
        >
          Open the full locations page
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {shouldLoadMap ? (
        <Suspense
          fallback={
            <div className="flex min-h-[680px] items-center justify-center rounded-3xl border border-border bg-card text-sm font-semibold text-primary shadow-elegant">
              Loading the CupSpace map…
            </div>
          }
        >
          <LocationsExplorer />
        </Suspense>
      ) : (
        <div className="flex min-h-[680px] items-center justify-center rounded-3xl border border-border bg-card text-sm font-semibold text-primary shadow-elegant">
          Map loads as you approach this section
        </div>
      )}
    </div>
  </section>
  )
}

export default NetworkSection
