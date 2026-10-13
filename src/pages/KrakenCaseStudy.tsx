import { useEffect } from "react"
import { ArrowLeft, ArrowRight, Coffee, ScanLine, Smartphone } from "lucide-react"
import { Link } from "react-router-dom"
import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"
import campaignCup from "@/assets/kraken-campaign-cup.png"
import cafeCup from "@/assets/kraken-cafe-cup.png"
import krakenLogo from "@/assets/kraken-logo.svg"

const moments = [
  { Icon: Coffee, title: "A familiar starting point", body: "Georgie Boy Coffee Co. branding kept the café at the heart of the experience. The line ‘Your coffee has a bonus today!’ introduced a reason to turn the cup around." },
  { Icon: ScanLine, title: "A clear brand moment", body: "The reverse brought Kraken into focus: a prominent logo, a concise promotional message and a QR code grouped together on the cup." },
  { Icon: Smartphone, title: "An online next step", body: "The printed QR gave interested customers a way to explore the campaign on their phone, connecting the coffee run with a digital brand experience." },
]

export default function KrakenCaseStudy() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Kraken Case Study | CupSpace"
  }, [])

  return (
    <div className="public-site">
      <SiteHeader />
      <main>
        <article>
          <header className="overflow-hidden border-b-2 border-foreground bg-[#7132f5] text-white">
            <div className="container-custom py-10 sm:py-16">
              <Link to="/case-studies" className="inline-flex min-h-11 items-center gap-2 border-b border-white/60 text-sm font-bold hover:text-[#e4d5ff]">
                <ArrowLeft size={16} /> All case studies
              </Link>
              <div className="mt-9 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className="min-w-0">
                  <img src={krakenLogo} width={650} height={101} alt="Kraken" className="mb-8 h-auto w-44 brightness-0 invert sm:w-52" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e4d5ff]">Kraken / café campaign</p>
                  <h1 className="mt-6 font-display text-[clamp(2.7rem,5.5vw,5.8rem)] uppercase leading-[1.02] tracking-[-0.045em]">A global brand.<br />A daily ritual.</h1>
                  <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">Kraken, carried beyond the screen. A branded coffee cup brought the crypto platform into an everyday moment, with a simple path from cup to phone.</p>
                </div>
                <figure className="min-w-0 border-2 border-white/40 bg-[#211044]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={campaignCup} width={1200} height={1600} fetchPriority="high" alt="Kraken-branded takeaway cup held on a city street, showing the logo, campaign offer and QR code" className="h-full w-full origin-[42%_75%] scale-[1.75] object-cover object-[42%_75%]" />
                  </div>
                </figure>
              </div>
            </div>
          </header>

          <section className="section-padding border-b-2 border-foreground bg-[#f1ebff]">
            <div className="container-custom grid gap-8 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5824bd]">The idea</p>
                <dl className="mt-6 space-y-5 text-sm">
                  {[['Brand', 'Kraken'], ['Café creative', 'Georgie Boy Coffee Co.'], ['Format', 'Branded takeaway cup + QR']].map(([label,value]) => <div key={label}><dt className="font-bold uppercase tracking-wider">{label}</dt><dd className="mt-1">{value}</dd></div>)}
                </dl>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#5824bd]">Meet Kraken</p>
                <p className="mb-9 max-w-3xl text-lg leading-relaxed"><a href="https://www.kraken.com/why-kraken" target="_blank" rel="noopener noreferrer" className="font-bold text-[#5824bd] underline underline-offset-4 hover:text-[#211044]">Kraken</a> is a global cryptocurrency platform where people can buy, sell and trade digital assets such as Bitcoin. This campaign brought that digital brand into the everyday coffee run.</p>
                <h2 className="font-display text-3xl uppercase leading-[1.08] tracking-tight sm:text-5xl">Meet people in the moment they already make time for.</h2>
                <p className="mt-6 text-lg leading-relaxed">Coffee is a physical pause in a digital day. This campaign paired a familiar café identity with Kraken’s branding, giving each side of the cup a distinct job: one introduced the message, the other presented the brand and the next step.</p>
                <p className="mt-5 text-lg leading-relaxed">The creative did not rely on a separate flyer or another screen placement. The cup itself carried the message, with the logo and QR visible together in the customer’s hand.</p>
              </div>
            </div>
          </section>

          <section className="section-padding border-b-2 border-foreground">
            <div className="container-custom">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5824bd]">The creative / a connected journey</p>
              <h2 className="mt-5 max-w-4xl font-display text-4xl uppercase leading-[1.05] sm:text-6xl">Pick up. Turn around. Explore.</h2>
              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {moments.map(({Icon,title,body},i) => <div key={title} className="border-2 border-[#7132f5]/30 bg-[#f1ebff] p-6 sm:p-8"><div className="flex items-center justify-between text-[#5824bd]"><Icon size={28} /><span className="font-display text-3xl">0{i+1}</span></div><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-4 leading-relaxed">{body}</p></div>)}
              </div>
            </div>
          </section>

          <section className="section-padding border-b-2 border-foreground bg-[#211044] text-white">
            <div className="container-custom grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <figure className="border border-white/30">
                <div className="aspect-square overflow-hidden"><img src={cafeCup} width={1200} height={1600} loading="lazy" alt="The café side of the campaign cup with Georgie Boy Coffee Co. branding and the message Your coffee has a bonus today" className="h-full w-full origin-[52%_77%] scale-[1.65] object-cover object-[52%_77%]" /></div>
              </figure>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c6a5ff]">The campaign in the real world</p>
                <h2 className="mt-6 font-display text-4xl uppercase leading-[1.05] sm:text-5xl">From café counter to city street.</h2>
                <p className="mt-6 text-lg leading-relaxed text-white/85">The campaign photos show the finished creative out in the city: the café identity, Kraken branding and a digital call to action, all carried on a single takeaway cup.</p>
                <p className="mt-5 text-lg leading-relaxed text-white/85">That is the role of cup media here: give an online brand a tangible presence in an everyday routine, then make the next step easy to find.</p>
              </div>
            </div>
          </section>

          <section className="bg-[#f1ebff] py-14 sm:py-20">
            <div className="container-custom flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <h2 className="max-w-3xl font-display text-3xl uppercase leading-[1.08] sm:text-5xl">Give your brand a place in the coffee run.</h2>
              <Link to="/advertiser-form" className="inline-flex min-h-12 shrink-0 items-center gap-3 border-2 border-[#5824bd] bg-[#5824bd] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#211044]">Plan a campaign <ArrowRight size={18} /></Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}
