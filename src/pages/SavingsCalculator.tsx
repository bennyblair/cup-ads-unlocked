import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SavingsCalculator = () => {
  const [cupsPerWeek, setCupsPerWeek] = useState(1000)
  const costPerCup = 0.18
  const weeklySavings = cupsPerWeek * costPerCup
  const monthlySavings = weeklySavings * 4.33
  const annualSavings = weeklySavings * 52

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Café Savings Calculator | CupSpace"
  }, [])

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCupsPerWeek(Number.parseInt(event.target.value))
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value) || 0
    setCupsPerWeek(Math.max(0, Math.min(10000, value)))
  }

  const sliderProgress = ((cupsPerWeek - 50) / (5000 - 50)) * 100

  return (
    <div className="public-site">
      <SiteHeader />
      <main>
        <section className="poster-grid border-b-2 border-foreground py-16 sm:py-20">
          <div className="container-custom">
            <span className="eyebrow mb-7">Café calculator / $0.18 per set</span>
            <h1 className="heading-section max-w-5xl">What are your cups costing you?</h1>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
              Set your weekly takeaway volume to estimate the cup-and-lid cost
              CupSpace could cover. The estimate uses $0.18 per cup and lid.
            </p>

            <div className="mt-12 grid items-stretch lg:grid-cols-[0.9fr_1.1fr]">
              <section className="border-2 border-foreground bg-card p-6 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your weekly volume</p>
                <div className="mt-10">
                  <Label htmlFor="cups-slider" className="text-base font-bold">Takeaway cups per week</Label>
                  <input
                    id="cups-slider"
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={cupsPerWeek}
                    onChange={handleSliderChange}
                    className="mt-6 h-3 w-full cursor-pointer appearance-none border-2 border-foreground"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${sliderProgress}%, hsl(var(--background)) ${sliderProgress}%, hsl(var(--background)) 100%)`,
                    }}
                  />
                  <style>{`
                    input[type="range"]::-webkit-slider-thumb { appearance: none; width: 26px; height: 26px; border: 2px solid hsl(var(--foreground)); border-radius: 0; background: hsl(var(--primary)); cursor: pointer; }
                    input[type="range"]::-moz-range-thumb { width: 26px; height: 26px; border: 2px solid hsl(var(--foreground)); border-radius: 0; background: hsl(var(--primary)); cursor: pointer; }
                  `}</style>
                  <div className="mt-3 flex justify-between text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"><span>50</span><span>5,000</span></div>
                </div>

                <div className="mt-10 border-t-2 border-foreground pt-7">
                  <Label htmlFor="cups-input" className="text-base font-bold">Enter an exact number</Label>
                  <Input id="cups-input" type="number" min="0" max="10000" value={cupsPerWeek} onChange={handleInputChange} className="mt-3 h-16 font-display text-3xl" />
                  <p className="mt-3 text-sm text-muted-foreground">About {Math.round(cupsPerWeek / 7).toLocaleString()} cups each day.</p>
                </div>
              </section>

              <section className="border-2 border-t-0 border-foreground bg-primary p-6 text-primary-foreground sm:p-10 lg:-ml-0.5 lg:border-l-0 lg:border-t-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Potential annual cup cost</p>
                <p className="mt-7 font-display text-[clamp(4rem,9vw,8rem)] leading-none tracking-[-0.06em]">${annualSavings.toLocaleString()}</p>
                <p className="mt-4 max-w-lg text-lg leading-relaxed text-primary-foreground/70">
                  That is the estimated amount currently spent on takeaway cups
                  and lids each year at the selected volume.
                </p>

                <dl className="mt-10 grid border-y-2 border-primary-foreground/50 sm:grid-cols-2">
                  <div className="py-6 sm:border-r-2 sm:border-primary-foreground/50 sm:pr-6"><dt className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/60">Per week</dt><dd className="mt-2 font-display text-3xl">${weeklySavings.toFixed(0)}</dd></div>
                  <div className="border-t-2 border-primary-foreground/50 py-6 sm:border-t-0 sm:pl-6"><dt className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/60">Per month</dt><dd className="mt-2 font-display text-3xl">${monthlySavings.toFixed(0)}</dd></div>
                </dl>

                <Link to="/cafe-form" className="mt-9 inline-block"><HeroButton variant="outline" size="lg" className="bg-background text-foreground">Apply as a café <ArrowRight className="ml-2 h-4 w-4" /></HeroButton></Link>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default SavingsCalculator
