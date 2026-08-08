import { useEffect } from "react"

import LocationsExplorer from "@/components/locations/LocationsExplorer"
import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"

const Locations = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "CupSpace Locations | Coverage and Campaign Areas"
  }, [])

  return (
    <div className="public-site">
      <SiteHeader />
      <main className="poster-grid border-b-2 border-foreground">
        <section className="container-custom py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <span className="eyebrow mb-7">Australia / network map</span>
              <h1 className="heading-section mb-0">Pick your patch.</h1>
            </div>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-muted-foreground lg:pb-2">
              Explore the CupSpace network. Click a circle to zoom, choose an
              area, or request the suburb your campaign needs.
            </p>
          </div>

          <LocationsExplorer className="mt-12 rounded-none border-2 border-foreground shadow-[9px_9px_0_hsl(var(--foreground))]" />
          <p className="mt-5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Public markers are intentionally approximate and do not reveal café
            names, contact information or private delivery coordinates.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Locations
