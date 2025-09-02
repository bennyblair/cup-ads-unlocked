import { Card } from "@/components/ui/card"
import { Search, Truck, QrCode } from "lucide-react"

const ProcessSection = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="heading-section">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A simple three-step process that creates value for everyone
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <Card className="p-8 text-center border-0 shadow-elegant relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
            </div>
            
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6 mt-4">
              <Search className="w-8 h-8 text-accent" />
            </div>
            
            <h3 className="text-xl font-bold text-primary mb-4">We Source Advertisers</h3>
            <p className="text-muted-foreground leading-relaxed">
              We connect with brands looking for innovative, high-impact advertising opportunities in the local market.
            </p>
          </Card>
          
          {/* Step 2 */}
          <Card className="p-8 text-center border-0 shadow-elegant relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6 mt-4">
              <Truck className="w-8 h-8 text-accent" />
            </div>
            
            <h3 className="text-xl font-bold text-primary mb-4">We Supply Branded Cups with QR Codes</h3>
            <p className="text-muted-foreground leading-relaxed">
              High-quality takeaway cups featuring advertiser branding and trackable QR codes are delivered directly to partner cafés at no cost.
            </p>
          </Card>
          
          {/* Step 3 */}
          <Card className="p-8 text-center border-0 shadow-elegant relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
            </div>
            
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6 mt-4">
              <QrCode className="w-8 h-8 text-accent" />
            </div>
            
            <h3 className="text-xl font-bold text-primary mb-4">Measurable Results</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cafés save money, brands capture qualified leads through QR codes, and customers access exclusive offers - everyone wins with trackable ROI.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default ProcessSection