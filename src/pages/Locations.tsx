import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Coffee } from "lucide-react"

import LocationsExplorer from "@/components/locations/LocationsExplorer"

const Locations = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "CupSpace Locations | Partner Cafés and Target Areas"
  }, [])

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container-custom py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center text-sm font-semibold text-primary transition hover:text-accent sm:text-base"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <div className="flex items-center">
            <Coffee className="mr-2 h-7 w-7 text-accent sm:h-8 sm:w-8" />
            <span className="text-xl font-bold text-primary sm:text-2xl">
              CupSpace
            </span>
          </div>
        </div>
      </header>

      <main className="container-custom pb-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Australia-wide opportunities
          </p>
          <h1 className="heading-section">Find your CupSpace location</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Explore live partner coverage or request the exact suburb where you
            want your next campaign to run.
          </p>
        </div>

        <LocationsExplorer />
      </main>
    </div>
  )
}

export default Locations
