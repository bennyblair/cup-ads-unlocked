import SiteHeader from "@/components/layout/SiteHeader"
import CTASection from "@/components/sections/CTASection"
import Footer from "@/components/sections/Footer"
import HeroSection from "@/components/sections/HeroSection"
import NetworkSection from "@/components/sections/NetworkSection"
import ProblemSection from "@/components/sections/ProblemSection"

const Index = () => (
  <div className="public-site">
    <SiteHeader />
    <main>
      <HeroSection />
      <ProblemSection />
      <NetworkSection />
      <CTASection />
    </main>
    <Footer />
  </div>
)

export default Index
