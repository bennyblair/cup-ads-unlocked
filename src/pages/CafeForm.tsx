import { type FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"
import { Card } from "@/components/ui/card"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitNetlifyForm } from "@/lib/netlify-forms"

type SubmissionState = "idle" | "submitting" | "success" | "error"

const CafeForm = () => {
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle")

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Partner as a Café | CupSpace"
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    setSubmissionState("submitting")

    try {
      await submitNetlifyForm("cafe-form", form)
      form.reset()
      setSubmissionState("success")
    } catch {
      setSubmissionState("error")
    }
  }

  return (
    <div className="public-site">
      <SiteHeader />

      <main className="poster-grid border-b-2 border-foreground py-16 sm:py-20">
        <div className="container-custom">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 sm:mb-12">
            <span className="eyebrow mb-7">Network application / for cafés</span>
            <h1 className="heading-section max-w-4xl">Put your cup costs down.</h1>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
              Tell us about your café, weekly cup volume and location.
            </p>
          </div>

          {submissionState === "success" ? (
            <Card className="border-2 border-foreground p-8 text-center shadow-elegant sm:p-12">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h2 className="mt-5 text-2xl font-bold text-primary">
                Application received
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                We will review your café details and contact you about the next
                steps.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex font-semibold text-primary hover:text-accent"
              >
                Return to home
              </Link>
            </Card>
          ) : (
            <Card className="border-2 border-foreground p-6 shadow-elegant sm:p-8">
              <form
                name="cafe-form"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <input type="hidden" name="form-name" value="cafe-form" />
                <div className="hidden">
                  <label>
                    Do not fill this out: <input name="bot-field" />
                  </label>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="Sarah"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Wilson"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="sarah@mycafe.com.au"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+61 400 000 000"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cafeName">Café Name *</Label>
                    <Input
                      id="cafeName"
                      name="cafeName"
                      autoComplete="organization"
                      placeholder="The Corner Coffee Co."
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Your Role</Label>
                    <select
                      id="role"
                      name="role"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
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
                    name="address"
                    autoComplete="street-address"
                    placeholder="123 Main Street"
                    className="mt-2"
                    required
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_110px_120px]">
                  <div>
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input
                      id="suburb"
                      name="suburb"
                      autoComplete="address-level2"
                      placeholder="Surry Hills"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <select
                      id="state"
                      name="state"
                      autoComplete="address-level1"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                      required
                    >
                      <option value="">Select</option>
                      {[
                        "ACT",
                        "NSW",
                        "NT",
                        "QLD",
                        "SA",
                        "TAS",
                        "VIC",
                        "WA",
                      ].map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      placeholder="2010"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dailyCups">Daily Cup Volume</Label>
                    <select
                      id="dailyCups"
                      name="dailyCups"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
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
                      name="openHours"
                      placeholder="e.g. 6am–4pm weekdays"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="currentSupplier">
                      Current Cup Supplier
                    </Label>
                    <Input
                      id="currentSupplier"
                      name="currentSupplier"
                      placeholder="Who supplies your takeaway cups?"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyCost">Monthly Cup Costs</Label>
                    <select
                      id="monthlyCost"
                      name="monthlyCost"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    >
                      <option value="">Select cost range</option>
                      <option value="under-200">Under $200</option>
                      <option value="200-500">$200–$500</option>
                      <option value="500-1000">$500–$1,000</option>
                      <option value="1000-2000">$1,000–$2,000</option>
                      <option value="2000-plus">$2,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerBase">
                    Tell us about your customers
                  </Label>
                  <Textarea
                    id="customerBase"
                    name="customerBase"
                    placeholder="Office workers, locals, students, tourists, or another audience?"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="timeline">When would you like to start?</Label>
                  <select
                    id="timeline"
                    name="timeline"
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">As soon as possible</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>

                <div className="pt-2">
                  <HeroButton
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={submissionState === "submitting"}
                  >
                    {submissionState === "submitting"
                      ? "Sending application..."
                      : "Join Our Network"}
                  </HeroButton>
                </div>

                {submissionState === "error" && (
                  <p
                    role="alert"
                    className="text-sm font-medium text-destructive"
                  >
                    We could not send your application. Please try again or email
                    info@cupspace.com.au.
                  </p>
                )}
              </form>
            </Card>
          )}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CafeForm
