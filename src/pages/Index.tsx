import SiteHeader from "@/components/layout/SiteHeader"
import CTASection from "@/components/sections/CTASection"
import Footer from "@/components/sections/Footer"
import ExplainerVideoSection from "@/components/sections/ExplainerVideoSection"
import HeroSection from "@/components/sections/HeroSection"
import NetworkSection from "@/components/sections/NetworkSection"
import ProblemSection from "@/components/sections/ProblemSection"
import ProcessSection from "@/components/sections/ProcessSection"
import SolutionSection from "@/components/sections/SolutionSection"

const Index = () => (
  <div className="public-site">
    <SiteHeader />
    <main>
      <HeroSection />
      <ExplainerVideoSection />
      <ProblemSection />
      <SolutionSection />
      <NetworkSection />
      <ProcessSection />
      <CTASection />
    </main>
    <Footer />
  </div>
)

export default Index
