import { Card } from "@/components/ui/card"
import { TrendingDown, Target } from "lucide-react"

const ProblemSection = () => {
  return (
    <section id="problem" className="section-padding bg-gradient-subtle">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="heading-section">The Problem</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Two industries facing critical challenges that CupSpace solves
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Café Problem */}
          <Card className="p-8 shadow-elegant border-0">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mr-4">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-primary">For Cafés</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Cafés face <strong>rising costs and tough margins</strong> — consumables like cups eat into profits while rent and labor costs continue to climb in an increasingly competitive hospitality landscape.
            </p>
          </Card>
          
          {/* Advertiser Problem */}
          <Card className="p-8 shadow-elegant border-0">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-primary">For Advertisers</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Advertisers are <strong>overspending on crowded digital channels</strong> while missing tangible, high-visibility daily touchpoints that create genuine connections with consumers.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection