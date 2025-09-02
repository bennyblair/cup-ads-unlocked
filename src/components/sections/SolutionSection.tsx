import { Card } from "@/components/ui/card"
import { Coffee, Users, Zap } from "lucide-react"
import brandedCupsImage from "@/assets/branded-cups-collection.jpg"

const SolutionSection = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="heading-section">The BrandPak Solution</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A revolutionary platform that transforms every takeaway coffee cup into premium advertising space.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <Coffee className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Free Branded Cups</h3>
                  <p className="text-muted-foreground">BrandPak provides branded cups to cafés at no cost, eliminating a significant operational expense.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Improved Unit Economics</h3>
                  <p className="text-muted-foreground">Cafés improve their margins significantly in a challenging hospitality climate.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Untapped Medium</h3>
                  <p className="text-muted-foreground">Brands access a unique, high-impact channel where every cup in hand provides minutes of daily brand visibility.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="cup-showcase">
            <img 
              src={brandedCupsImage} 
              alt="Collection of branded coffee cups with various advertisements"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolutionSection