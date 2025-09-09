import { HeroButton } from "@/components/ui/hero-button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const CTASection = () => {
  return (
    <section id="cta" className="section-padding bg-gradient-subtle">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="heading-section">Ready to Transform Your Business?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join the CupSpace revolution and discover a new way to connect with customers
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* CTA Buttons */}
          <div className="space-y-8">
            <Card className="p-8 border-0 shadow-elegant text-center">
              <h3 className="text-2xl font-bold text-primary mb-4">For Advertisers</h3>
              <p className="text-muted-foreground mb-6">
                Ready to reach customers in a revolutionary new way? Let's discuss how CupSpace can amplify your brand.
              </p>
              <HeroButton size="lg" className="w-full sm:w-auto">
                Advertise with CupSpace
              </HeroButton>
            </Card>
            
            <Card className="p-8 border-0 shadow-elegant text-center">
              <h3 className="text-2xl font-bold text-primary mb-4">For Cafés</h3>
              <p className="text-muted-foreground mb-6">
                Want to cut costs and improve your margins? Partner with us for free branded cups and better unit economics.
              </p>
              <HeroButton size="lg" variant="outline" className="w-full sm:w-auto">
                Partner as a Café
              </HeroButton>
            </Card>
          </div>
          
          {/* Contact Form */}
          <Card className="p-8 border-0 shadow-elegant">
            <h3 className="text-2xl font-bold text-primary mb-6">Get In Touch</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Smith" className="mt-1" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@company.com" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Your Company" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="interest">I'm interested in...</Label>
                <select 
                  id="interest" 
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select an option</option>
                  <option value="advertising">Advertising with CupSpace</option>
                  <option value="partnership">Partnering as a Café</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your needs..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <HeroButton type="submit" className="w-full">
                Send Message
              </HeroButton>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default CTASection