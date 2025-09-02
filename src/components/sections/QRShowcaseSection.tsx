import { Card } from "@/components/ui/card"
import { QrCode, Target, BarChart } from "lucide-react"
import qrCoffeeImage from "@/assets/qr-code-coffee-cup.jpg"

const QRShowcaseSection = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="heading-section">QR Code Lead Generation</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform every coffee cup into a lead generation machine with trackable QR code campaigns.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <QrCode className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Instant Lead Capture</h3>
                  <p className="text-muted-foreground">Customers scan QR codes for free trials, discounts, or app downloads - turning coffee moments into business opportunities.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Targeted Campaigns</h3>
                  <p className="text-muted-foreground">Perfect for gyms offering free trials, apps promoting downloads, or retailers driving foot traffic with exclusive offers.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <BarChart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Measurable ROI</h3>
                  <p className="text-muted-foreground">Track every scan, conversion, and customer acquisition with detailed analytics - finally quantify your offline marketing impact.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="cup-showcase">
            <img 
              src={qrCoffeeImage} 
              alt="Coffee cup with QR code for free gym trial offer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default QRShowcaseSection