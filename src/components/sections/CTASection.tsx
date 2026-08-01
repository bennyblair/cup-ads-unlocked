import { HeroButton } from "@/components/ui/hero-button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { type FormEvent, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { submitNetlifyForm } from "@/lib/netlify-forms"

const CTASection = () => {
  const [submissionState, setSubmissionState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmissionState("submitting")

    try {
      await submitNetlifyForm("contact-form", form)
      form.reset()
      setSubmissionState("success")
    } catch {
      setSubmissionState("error")
    }
  }

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
              <Link to="/advertiser-form">
                <HeroButton size="lg" className="w-full sm:w-auto">
                  Advertise with CupSpace
                </HeroButton>
              </Link>
            </Card>
            
            <Card className="p-8 border-0 shadow-elegant text-center">
              <h3 className="text-2xl font-bold text-primary mb-4">For Cafés</h3>
              <p className="text-muted-foreground mb-6">
                Want to cut costs and improve your margins? Partner with us for free branded cups and better unit economics.
              </p>
              <Link to="/cafe-form">
                <HeroButton size="lg" variant="outline" className="w-full sm:w-auto">
                  Partner as a Café
                </HeroButton>
              </Link>
            </Card>

            {/* Savings Calculator Card */}
            <Card className="p-8 border-0 shadow-elegant text-center bg-gradient-subtle">
              <h3 className="text-2xl font-bold text-primary mb-4">See Your Savings</h3>
              <p className="text-accent mb-6">
                Curious how much your café could save? Use our calculator to see your potential annual savings.
              </p>
              <Link to="/savings-calculator">
                <HeroButton size="lg" className="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  Calculate Your Savings
                </HeroButton>
              </Link>
            </Card>
          </div>
          
          {/* Contact Form */}
          <Card className="p-8 border-0 shadow-elegant">
            <h3 className="text-2xl font-bold text-primary mb-6">Get In Touch</h3>
            
            {submissionState === "success" ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-14 w-14 text-primary" />
                <h4 className="mt-5 text-2xl font-bold text-primary">
                  Message received
                </h4>
                <p className="mt-3 max-w-sm text-muted-foreground">
                  Thanks for getting in touch. The CupSpace team will reply shortly.
                </p>
              </div>
            ) : (
            <form
              name="contact-form"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input type="hidden" name="form-name" value="contact-form" />
              <div className="hidden">
                <label>
                  Do not fill this out: <input name="bot-field" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" autoComplete="given-name" placeholder="John" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" autoComplete="family-name" placeholder="Smith" className="mt-1" required />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="john@company.com" className="mt-1" required />
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" autoComplete="organization" placeholder="Your Company" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="interest">I'm interested in...</Label>
                <select 
                  id="interest" 
                  name="interest"
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
                  name="message"
                  placeholder="Tell us about your needs..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <HeroButton
                type="submit"
                className="w-full"
                disabled={submissionState === "submitting"}
              >
                {submissionState === "submitting" ? "Sending..." : "Send Message"}
              </HeroButton>

              {submissionState === "error" && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  We could not send your message. Please try again or email
                  info@cupspace.com.au.
                </p>
              )}
            </form>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}

export default CTASection
