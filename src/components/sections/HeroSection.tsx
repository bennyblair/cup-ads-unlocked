import { HeroButton } from "@/components/ui/hero-button"
import { Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import heroImage from "@/assets/cupspace-hero-cup.jpg"

const HeroSection = () => {
  const scrollToNext = () => {
    const nextSection = document.querySelector('#problem');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 34, 34, 0.7), rgba(34, 34, 34, 0.7)), url(${heroImage})`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container-custom text-center text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="heading-hero text-white mb-6">
            CupSpace: Where Every Coffee Becomes <span className="text-accent">Ad Space</span>
          </h1>
          
          <p className="text-hero-sub text-white/90 mb-12 max-w-3xl mx-auto">
            Helping cafés cut costs while giving brands a powerful new way to connect.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/advertiser-form">
              <HeroButton size="lg" variant="primary">
                Advertise with Us
              </HeroButton>
            </Link>
            <Link to="/cafe-form">
              <HeroButton size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Partner as a Café
              </HeroButton>
            </Link>
          </div>
          
          {/* Savings Calculator Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/savings-calculator" 
              className="inline-flex items-center text-white/90 hover:text-white text-sm font-medium underline underline-offset-4 hover:underline-offset-8 transition-all duration-300"
            >
              💰 See how much your café can save with CupSpace
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 w-full flex justify-center">
        <button 
          onClick={scrollToNext}
          className="flex items-center justify-center w-12 h-12 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/50 transition-all animate-bounce cursor-pointer"
          aria-label="Scroll to next section"
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </section>
  )
}

export default HeroSection