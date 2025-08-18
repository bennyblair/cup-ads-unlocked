import { Card } from "@/components/ui/card"
import { Heart, Zap, MapPin } from "lucide-react"

const ImpactSection = () => {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">Our Impact</h2>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Building a sustainable ecosystem that benefits everyone
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 text-center bg-primary-foreground text-primary border-0">
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-4">Supporting Local Cafés</h3>
            <p className="text-muted-foreground leading-relaxed">
              Helping Australian cafés thrive by reducing operational costs and improving their bottom line in challenging times.
            </p>
          </Card>
          
          <Card className="p-8 text-center bg-primary-foreground text-primary border-0">
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-4">New Advertising Ecosystem</h3>
            <p className="text-muted-foreground leading-relaxed">
              Creating innovative pathways for brands to connect authentically with consumers in their daily routines.
            </p>
          </Card>
          
          <Card className="p-8 text-center bg-primary-foreground text-primary border-0">
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-4">Reaching Real People</h3>
            <p className="text-muted-foreground leading-relaxed">
              Bridging the digital-physical gap by helping brands connect with people in meaningful, offline moments.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default ImpactSection