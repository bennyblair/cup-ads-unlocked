import HeroSection from "@/components/sections/HeroSection"
import ProblemSection from "@/components/sections/ProblemSection"
import SolutionSection from "@/components/sections/SolutionSection"
import ProcessSection from "@/components/sections/ProcessSection"
import CTASection from "@/components/sections/CTASection"
import Footer from "@/components/sections/Footer"

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ProcessSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
