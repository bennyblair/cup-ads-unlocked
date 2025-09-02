import { Card } from "@/components/ui/card"
import { Coffee, Megaphone, DollarSign, Eye, Map, Award, QrCode } from "lucide-react"
import cafeLifestyleImage from "@/assets/cafe-lifestyle.jpg"
import qrCodeCupsImage from "@/assets/qr-code-collection.jpg"

const BenefitsSection = () => {
  return (
    <section className="section-padding bg-gradient-subtle">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* For Cafés */}
          <div>
            <div className="text-center mb-12">
              <h2 className="heading-section text-primary">For Cafés</h2>
              <p className="text-xl text-muted-foreground">
                Transform your bottom line with zero-cost consumables
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6 border-0 shadow-elegant">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Free Cup Supply</h3>
                </div>
                <p className="text-muted-foreground">Eliminate cup costs entirely while maintaining high-quality takeaway packaging.</p>
              </Card>
              
              <Card className="p-6 border-0 shadow-elegant">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <Coffee className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Better Margins</h3>
                </div>
                <p className="text-muted-foreground">Improve unit economics in a challenging hospitality climate with reduced operational costs.</p>
              </Card>
              
              <Card className="p-6 border-0 shadow-elegant">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Easy Partnership</h3>
                </div>
                <p className="text-muted-foreground">Simple integration with no extra work required from your team.</p>
              </Card>
            </div>
          </div>
          
          {/* For Advertisers */}
          <div>
            <div className="text-center mb-12">
              <h2 className="heading-section text-primary">For Advertisers</h2>
              <p className="text-xl text-muted-foreground">
                Reach customers in a whole new way
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6 border-0 shadow-elegant">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <Megaphone className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">New High-Impact Channel</h3>
                </div>
                <p className="text-muted-foreground">Break through digital noise with a fresh, tangible advertising medium.</p>
              </Card>
              
              <Card className="p-6 border-0 shadow-elegant">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <Eye className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Trackable QR Code Campaigns</h3>
                </div>
                <p className="text-muted-foreground">Include QR codes for measurable lead generation - track conversions from free trials to app downloads with real ROI data.</p>
              </Card>
              
              <Card className="p-6 border-0 shadow-elegant">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <QrCode className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Direct Lead Capture</h3>
                </div>
                <p className="text-muted-foreground">QR codes enable immediate conversions - from free gym trials to app downloads, with full attribution tracking.</p>
              </Card>
            </div>
          </div>
        </div>
        
        {/* QR Code Showcase */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">QR Code Lead Generation in Action</h3>
            <p className="text-lg text-muted-foreground">See how brands like Snap Fitness capture qualified leads with every coffee sold</p>
          </div>
          <div className="cup-showcase max-w-5xl mx-auto">
            <img 
              src={qrCodeCupsImage} 
              alt="Branded coffee cups with QR codes for lead generation campaigns"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection