import { HeroButton } from "@/components/ui/hero-button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { ArrowLeft, Coffee } from "lucide-react"

const CafeForm = () => {
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
            <h1 className="heading-section">Partner as a Café</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join our network of forward-thinking cafés. Get free branded cups, improve your margins, and help create something revolutionary in coffee culture.
            </p>
          </div>

          <Card className="p-8 border-0 shadow-elegant">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="Sarah" className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Wilson" className="mt-2" required />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="sarah@mycafe.com.au" className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+61 400 000 000" className="mt-2" required />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cafeName">Café Name *</Label>
                  <Input id="cafeName" placeholder="The Corner Coffee Co." className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <select 
                    id="role" 
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Select your role</option>
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="operations">Operations Manager</option>
                    <option value="franchisee">Franchisee</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Café Address *</Label>
                <Input 
                  id="address" 
                  placeholder="123 Main Street, Sydney NSW 2000" 
                  className="mt-2" 
                  required 
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dailyCups">Daily Cup Volume</Label>
                  <select 
                    id="dailyCups" 
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Select daily volume</option>
                    <option value="under-50">Under 50 cups</option>
                    <option value="50-150">50-150 cups</option>
                    <option value="150-300">150-300 cups</option>
                    <option value="300-500">300-500 cups</option>
                    <option value="500-plus">500+ cups</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="openHours">Operating Hours</Label>
                  <Input 
                    id="openHours" 
                    placeholder="e.g., 6AM - 4PM Mon-Fri, 7AM - 3PM Weekends" 
                    className="mt-2" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currentSupplier">Current Cup Supplier</Label>
                  <Input 
                    id="currentSupplier" 
                    placeholder="Who supplies your takeaway cups?" 
                    className="mt-2" 
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyCost">Monthly Cup Costs</Label>
                  <select 
                    id="monthlyCost" 
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Select cost range</option>
                    <option value="under-200">Under $200</option>
                    <option value="200-500">$200-$500</option>
                    <option value="500-1000">$500-$1,000</option>
                    <option value="1000-2000">$1,000-$2,000</option>
                    <option value="2000-plus">$2,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="customerBase">Tell us about your customers</Label>
                <Textarea 
                  id="customerBase" 
                  placeholder="Who are your typical customers? Office workers, locals, students, tourists? What are their demographics and preferences?"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="goals">What interests you about CupSpace?</Label>
                <Textarea 
                  id="goals" 
                  placeholder="Are you looking to reduce costs, try innovative partnerships, or something else? Any specific concerns or questions?"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="timeline">When would you like to start?</Label>
                <select 
                  id="timeline" 
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">As soon as possible</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="3-months">Within 3 months</option>
                  <option value="exploring">Just exploring options</option>
                </select>
              </div>

              <div className="pt-4">
                <HeroButton type="submit" size="lg" className="w-full md:w-auto">
                  Join Our Network
                </HeroButton>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default CafeForm