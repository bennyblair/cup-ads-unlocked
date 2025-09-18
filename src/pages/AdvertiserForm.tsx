import { HeroButton } from "@/components/ui/hero-button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Coffee } from "lucide-react"

const AdvertiserForm = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
          <div className="text-center mb-12">
            <h1 className="heading-section">Advertise with CupSpace</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to reach customers in a revolutionary new way? Let's discuss how CupSpace can amplify your brand through coffee cup advertising.
            </p>
          </div>

          <Card className="p-8 border-0 shadow-elegant">
            <form 
              name="advertiser-form" 
              method="POST" 
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              className="space-y-6"
            >
              {/* Hidden honeypot field for spam protection */}
              <input type="hidden" name="form-name" value="advertiser-form" />
              <div style={{ display: 'none' }}>
                <label>
                  Don't fill this out if you're human: <input name="bot-field" />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" placeholder="John" className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" placeholder="Smith" className="mt-2" required />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" placeholder="john@company.com" className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+61 400 000 000" className="mt-2" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input id="company" name="company" placeholder="Your Company" className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <select 
                    id="industry" 
                    name="industry"
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Select industry</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="retail">Retail</option>
                    <option value="food-beverage">Food & Beverage</option>
                    <option value="fitness">Health & Fitness</option>
                    <option value="automotive">Automotive</option>
                    <option value="technology">Technology</option>
                    <option value="professional-services">Professional Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="budget">Monthly Marketing Budget</Label>
                  <select 
                    id="budget" 
                    name="budget"
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-5k">Under $5,000</option>
                    <option value="5k-15k">$5,000 - $15,000</option>
                    <option value="15k-50k">$15,000 - $50,000</option>
                    <option value="50k-plus">$50,000+</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timeline">When would you like to start?</Label>
                  <select 
                    id="timeline" 
                    name="timeline"
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">As soon as possible</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="6-months">Within 6 months</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="locations">Target Locations/Areas</Label>
                <Input 
                  id="locations" 
                  name="locations"
                  placeholder="e.g., Sydney CBD, Melbourne inner suburbs, Brisbane north..." 
                  className="mt-2" 
                />
              </div>

              <div>
                <Label htmlFor="goals">Campaign Goals & Objectives</Label>
                <Textarea 
                  id="goals" 
                  name="goals"
                  placeholder="Tell us about your marketing goals, target audience, and what success looks like for your campaign..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="message">Additional Information</Label>
                <Textarea 
                  id="message" 
                  name="message"
                  placeholder="Any additional details about your requirements, questions, or specific needs..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <HeroButton type="submit" size="lg" className="w-full md:w-auto">
                  Submit Application
                </HeroButton>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AdvertiserForm