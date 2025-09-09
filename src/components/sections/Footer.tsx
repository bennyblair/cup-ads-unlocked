import { Coffee } from "lucide-react"

const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Coffee className="w-8 h-8 text-accent mr-3" />
              <span className="text-2xl font-bold">CupSpace</span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Transforming takeaway coffee cups into powerful advertising space while helping cafés improve their margins.
            </p>
            <p className="text-sm text-primary-foreground/60">
              © 2024 CupSpace. All rights reserved.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#hero" className="hover:text-accent transition-colors">Home</a></li>
              <li><a href="#problem" className="hover:text-accent transition-colors">The Problem</a></li>
              <li><a href="#solution" className="hover:text-accent transition-colors">Our Solution</a></li>
              <li><a href="#process" className="hover:text-accent transition-colors">How It Works</a></li>
              <li><a href="#contact" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Get Started */}
          <div>
            <h4 className="font-semibold mb-4">Get Started</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#cta" className="hover:text-accent transition-colors">Get Started</a></li>
              <li><a href="#cta" className="hover:text-accent transition-colors">Advertise with Us</a></li>
              <li><a href="#cta" className="hover:text-accent transition-colors">Partner as a Café</a></li>
              <li><a href="#contact" className="hover:text-accent transition-colors">About</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>Making every coffee cup count. Supporting Australian cafés and brands.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer