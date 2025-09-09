import { HeroButton } from "@/components/ui/hero-button"
import { Link } from "react-router-dom"
import heroImage from "@/assets/hero-coffee-cup.jpg"

const HeroSection = () => {
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
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full relative">
          <div className="w-1 h-3 bg-white/70 rounded-full absolute left-1/2 top-2 transform -translate-x-1/2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection