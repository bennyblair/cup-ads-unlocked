import { type FormEvent, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, MapPin } from "lucide-react"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"
import { Card } from "@/components/ui/card"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getNetworkLocation } from "@/data/locations"
import { submitNetlifyForm } from "@/lib/netlify-forms"

type SubmissionState = "idle" | "submitting" | "success" | "error"

const AdvertiserForm = () => {
  const [searchParams] = useSearchParams()
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle")
  const location = getNetworkLocation(searchParams.get("id"))
  const locationId = location?.id ?? searchParams.get("id") ?? ""
  const locationName = location?.name ?? searchParams.get("name") ?? ""
  const locationAddress =
    location?.address ?? searchParams.get("address") ?? ""
  const requestType = location?.kind ?? searchParams.get("type") ?? "general"
  const hasSelectedLocation = Boolean(locationId && locationName)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Advertise with CupSpace"
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmissionState("submitting")

    try {
      await submitNetlifyForm("advertiser-form", form)
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
            <span className="eyebrow mb-7">Campaign brief / for brands</span>
            <h1 className="heading-section max-w-4xl">Put your campaign in hand.</h1>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
              Tell us who you want to reach, where the cups should land and what
              you want people to do next.
            </p>
          </div>

          {hasSelectedLocation && submissionState !== "success" && (
            <Card className="mb-6 border-2 border-foreground bg-accent p-5 shadow-none">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                    Selected{" "}
                    {requestType === "cafe" ? "partner area" : "target area"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-primary">
                    {locationName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {locationAddress}
                  </p>
                </div>
                <Link
                  to="/locations"
                  className="shrink-0 text-sm font-semibold text-primary hover:text-accent"
                >
                  Change
                </Link>
              </div>
            </Card>
          )}

          {submissionState === "success" ? (
            <Card className="border-2 border-foreground p-8 text-center shadow-elegant sm:p-12">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h2 className="mt-5 text-2xl font-bold text-primary">
                Request received
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Thanks for reaching out. The CupSpace team will review your
                campaign needs and contact you shortly.
              </p>
              <Link
                to="/locations"
                className="mt-6 inline-flex font-semibold text-primary hover:text-accent"
              >
                Return to locations
              </Link>
            </Card>
          ) : (
            <Card className="border-2 border-foreground p-6 shadow-elegant sm:p-8">
              <form
                name="advertiser-form"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <input
                  type="hidden"
                  name="form-name"
                  value="advertiser-form"
                />
                <input type="hidden" name="requestType" value={requestType} />
                <input
                  type="hidden"
                  name="locationId"
                  value={locationId}
                />
                <input
                  type="hidden"
                  name="requestedLocation"
                  value={[locationName, locationAddress].filter(Boolean).join(" — ")}
                />
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
                      placeholder="John"
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
                      placeholder="Smith"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Work Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="john@company.com"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+61 400 000 000"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      name="company"
                      autoComplete="organization"
                      placeholder="Your Company"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <select
                      id="industry"
                      name="industry"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    >
                      <option value="">Select industry</option>
                      <option value="real-estate">Real Estate</option>
                      <option value="finance">Finance & Banking</option>
                      <option value="retail">Retail</option>
                      <option value="food-beverage">Food & Beverage</option>
                      <option value="fitness">Health & Fitness</option>
                      <option value="automotive">Automotive</option>
                      <option value="technology">Technology</option>
                      <option value="professional-services">
                        Professional Services
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="budget">Monthly Marketing Budget</Label>
                    <select
                      id="budget"
                      name="budget"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
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
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
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
                  <Label htmlFor="locations">Requested Location or Area *</Label>
                  <Input
                    id="locations"
                    name="locations"
                    defaultValue={locationAddress}
                    placeholder="e.g. Sydney CBD, Fitzroy VIC, or Brisbane north"
                    className="mt-2"
                    required
                  />
                  {!hasSelectedLocation && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Type any Australian suburb, city or area. No paid address
                      service is used.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="goals">Campaign Goals & Objectives</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    placeholder="Tell us about your audience, campaign goal, and what success looks like..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Anything else we should know?"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="pt-2">
                  <HeroButton
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={submissionState === "submitting"}
                  >
                    {submissionState === "submitting"
                      ? "Sending request..."
                      : "Submit Request"}
                  </HeroButton>
                </div>

                {submissionState === "error" && (
                  <p
                    role="alert"
                    className="text-sm font-medium text-destructive"
                  >
                    We could not send your request. Please try again or email
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

export default AdvertiserForm
