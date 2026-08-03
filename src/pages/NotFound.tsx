import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname)
  }, [location.pathname])

  return (
    <div className="public-site">
      <SiteHeader />
      <main className="poster-grid flex min-h-[calc(100svh-70px)] items-center border-b-2 border-foreground">
        <div className="container-custom py-20">
          <span className="eyebrow mb-7">Wrong turn / 404</span>
          <h1 className="font-display text-[clamp(6rem,20vw,16rem)] leading-[0.75] tracking-[-0.07em] text-primary">404</h1>
          <p className="mt-9 max-w-xl text-2xl font-bold">This cup has left the café.</p>
          <Link to="/" className="mt-8 inline-flex border-2 border-foreground bg-accent px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] shadow-[5px_5px_0_hsl(var(--foreground))]">Back to CupSpace</Link>
        </div>
      </main>
    </div>
  )
}

export default NotFound
