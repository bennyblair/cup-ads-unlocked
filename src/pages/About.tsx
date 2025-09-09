import { Link } from "react-router-dom"
import { ArrowLeft, Coffee, Users, Lightbulb, Target } from "lucide-react"
import { Card } from "@/components/ui/card"

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header with back link */}
      <header className="container-custom py-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center text-primary hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center">
            <Coffee className="w-8 h-8 text-accent mr-3" />
            <span className="text-2xl font-bold text-primary">CupSpace</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="heading-section">About CupSpace</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Born from loss, built for change
            </p>
          </div>

          {/* Our Story */}
          <Card className="p-12 border-0 shadow-elegant mb-12">
            <div className="flex items-center mb-8">
              <Users className="w-8 h-8 text-accent mr-4" />
              <h2 className="text-3xl font-bold text-primary">Our Story</h2>
            </div>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                It started with three mates and a devastating reality check. Our favourite café closed down.
              </p>
              
              <p>
                <strong className="text-primary">The same story that's happening across Australia.</strong> Rising rents, increasing costs, razor-thin margins, and fierce competition were forcing beloved local cafés to shut their doors forever. We watched our community lose not just a coffee shop, but a gathering place, a local business that employed people, and a piece of what made our neighbourhood special.
              </p>
              
              <p>
                But in that moment of loss, we had a realisation that would change everything.
              </p>
              
              <p className="text-xl font-semibold text-primary bg-accent/5 p-6 rounded-xl border-l-4 border-accent">
                "Every takeaway cup is prime real estate. And it's being wasted."
              </p>
              
              <p>
                We saw thousands of cups leaving cafés every day, each one a missed opportunity. These weren't just containers for coffee – they were mobile billboards, conversation starters, and direct pathways to engaged customers. The cup itself could be the solution that helps cafés improve their economics while giving brands something digital advertising simply can't provide: <strong className="text-primary">tangible, memorable, daily touchpoints</strong>.
              </p>
            </div>
          </Card>

          {/* Our Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 border-0 shadow-elegant">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-accent mr-4" />
                <h3 className="text-2xl font-bold text-primary">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To save Australian cafés by transforming their biggest expense into their biggest opportunity. We're not just reducing costs – we're creating a sustainable ecosystem where great coffee culture can thrive alongside smart business innovation.
              </p>
            </Card>

            <Card className="p-8 border-0 shadow-elegant">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-8 h-8 text-accent mr-4" />
                <h3 className="text-2xl font-bold text-primary">The Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A future where every café can focus on what they do best – creating amazing coffee experiences – while their cups work as silent partners, generating value through thoughtful, tasteful partnerships with brands that respect the café's community and culture.
              </p>
            </Card>
          </div>

          {/* Why It Matters */}
          <Card className="p-12 border-0 shadow-elegant">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">Why This Matters</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-xl font-semibold text-primary mb-3">For Cafés</h4>
                <p className="text-muted-foreground">
                  Every café that survives and thrives means jobs preserved, communities maintained, and Australia's incredible coffee culture protected.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-xl font-semibold text-primary mb-3">For Brands</h4>
                <p className="text-muted-foreground">
                  Authentic connections with customers through brands they choose to engage with, not ads they're forced to see.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-xl font-semibold text-primary mb-3">For Communities</h4>
                <p className="text-muted-foreground">
                  Local businesses that can afford to stay, neighbourhoods that keep their character, and coffee culture that continues to evolve.
                </p>
              </div>
            </div>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-xl text-muted-foreground mb-8">
              We're not just building a business. We're building a movement to save the cafés we love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/advertiser-form" 
                className="bg-gradient-primary text-accent-foreground font-semibold px-8 py-4 rounded-xl shadow-accent hover:shadow-lg hover:scale-105 transition-all duration-300 inline-block"
              >
                Partner with Us
              </Link>
              <Link 
                to="/cafe-form" 
                className="border-2 border-primary text-primary font-semibold px-8 py-4 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 inline-block"
              >
                Join as a Café
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About