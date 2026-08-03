import { type FormEvent, useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitNetlifyForm } from "@/lib/netlify-forms"

const Contact = () => {
  const [submissionState, setSubmissionState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle")

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "Contact | CupSpace"
  }, [])

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
    <div className="public-site">
      <SiteHeader />
      <main>
        <section className="paper-noise border-b-2 border-foreground py-20 sm:py-24">
          <div className="container-custom grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <span className="eyebrow mb-7">Straight to the team</span>
              <h1 className="font-display text-[clamp(3.8rem,8vw,7.5rem)] uppercase leading-[0.84] tracking-[-0.055em]">
                Talk to CupSpace.
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Brands, cafés or something else—send us a straight question and
                the CupSpace team will get back to you.
              </p>
              <a
                className="mt-7 inline-block border-b-2 border-foreground text-sm font-bold"
                href="mailto:info@cupspace.com.au"
              >
                info@cupspace.com.au
              </a>
            </div>

            <div className="poster-panel p-6 sm:p-8">
              {submissionState === "success" ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-14 w-14 text-primary" />
                  <h2 className="mt-5 font-display text-3xl uppercase">
                    Message received
                  </h2>
                  <p className="mt-3 max-w-sm text-muted-foreground">
                    The CupSpace team will reply shortly.
                  </p>
                </div>
              ) : (
                <form
                  name="contact-form"
                  method="POST"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <input type="hidden" name="form-name" value="contact-form" />
                  <div className="hidden">
                    <label>
                      Do not fill this out: <input name="bot-field" />
                    </label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" name="firstName" autoComplete="given-name" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" name="lastName" autoComplete="family-name" className="mt-2" required />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" autoComplete="email" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" name="company" autoComplete="organization" className="mt-2" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="interest">I&apos;m interested in</Label>
                    <select id="interest" name="interest" className="mt-2">
                      <option value="">Select an option</option>
                      <option value="advertising">Advertising with CupSpace</option>
                      <option value="partnership">Partnering as a café</option>
                      <option value="general">General enquiry</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" className="mt-2" rows={5} required />
                  </div>
                  <HeroButton type="submit" disabled={submissionState === "submitting"}>
                    {submissionState === "submitting" ? "Sending..." : "Send it"}
                  </HeroButton>
                  {submissionState === "error" && (
                    <p role="alert" className="text-sm font-bold text-destructive">
                      We could not send this. Try again or email info@cupspace.com.au.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Contact
