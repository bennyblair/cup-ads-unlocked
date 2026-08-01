import {
  lazy,
  Suspense,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Coffee } from "lucide-react"

import { Card } from "@/components/ui/card"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitNetlifyForm } from "@/lib/netlify-forms"

type SubmissionState = "idle" | "submitting" | "success" | "error"

const CafeLocationPicker = lazy(
  () => import("@/components/locations/CafeLocationPicker"),
)

const CafeForm = () => {
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle")
  const [coordinates, setCoordinates] = useState<
    [longitude: number, latitude: number] | null
  >(null)
  const [locationValidationError, setLocationValidationError] = useState("")

  const handleCoordinatesChange = useCallback(
    (nextCoordinates: [longitude: number, latitude: number]) => {
      setCoordinates(nextCoordinates)
      setLocationValidationError("")
    },
    [],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Partner as a Café | CupSpace"
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    if (!coordinates) {
      setLocationValidationError(
        "Please place the café pin before submitting your application.",
      )
      return
    }

    setSubmissionState("submitting")

    try {
      await submitNetlifyForm("cafe-form", form)
      form.reset()
      setCoordinates(null)
      setSubmissionState("success")
    } catch {
      setSubmissionState("error")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container-custom py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center text-sm font-semibold text-primary transition hover:text-accent sm:text-base"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <div className="flex items-center">
            <Coffee className="mr-2 h-7 w-7 text-accent sm:h-8 sm:w-8" />
            <span className="text-xl font-bold text-primary sm:text-2xl">
              CupSpace
            </span>
          </div>
        </div>
      </header>

      <main className="container-custom pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center sm:mb-12">
            <h1 className="heading-section">Partner as a Café</h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
              Join our network of forward-thinking cafés, cut cup costs, and
              create a new local advertising channel.
            </p>
          </div>

          {submissionState === "success" ? (
            <Card className="border-0 p-8 text-center shadow-elegant sm:p-12">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h2 className="mt-5 text-2xl font-bold text-primary">
                Application received
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                We will review your café details and contact you before anything
                is published on the CupSpace map.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex font-semibold text-primary hover:text-accent"
              >
                Return to home
              </Link>
            </Card>
          ) : (
            <Card className="border-0 p-6 shadow-elegant sm:p-8">
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

                <Suspense
                  fallback={
                    <div className="flex h-[360px] items-center justify-center rounded-2xl border border-border bg-secondary text-sm font-medium text-primary">
                      Loading the private pin map…
                    </div>
                  }
                >
                  <CafeLocationPicker
                    coordinates={coordinates}
                    onChange={handleCoordinatesChange}
                  />
                </Suspense>

                {locationValidationError && (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {locationValidationError}
                  </p>
                )}

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
                  <Label htmlFor="goals">
                    What interests you about CupSpace?
                  </Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    placeholder="Reducing costs, trying new partnerships, or something else?"
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

                <label className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    name="publicListingConsent"
                    value="anonymous-map"
                    required
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    If approved as a partner, I agree that CupSpace may display
                    an anonymous, approximate marker near this café. The public
                    map will not show the café name, street address, contact
                    details, or exact pin.
                  </span>
                </label>

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
      </main>
    </div>
  )
}

export default CafeForm
