import HeroSection from "@/components/sections/HeroSection"
import ProblemSection from "@/components/sections/ProblemSection"
import SolutionSection from "@/components/sections/SolutionSection"
import BenefitsSection from "@/components/sections/BenefitsSection"
import QRShowcaseSection from "@/components/sections/QRShowcaseSection"
import ProfitabilityDemo from "@/components/sections/ProfitabilityDemo"
import ProcessSection from "@/components/sections/ProcessSection"
import ImpactSection from "@/components/sections/ImpactSection"
import CTASection from "@/components/sections/CTASection"
import Footer from "@/components/sections/Footer"

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <QRShowcaseSection />
      <ProcessSection />
      <ImpactSection />
      <CTASection />
      <ProfitabilityDemo />
      <Footer />
    </div>
  );
};

export default Index;
