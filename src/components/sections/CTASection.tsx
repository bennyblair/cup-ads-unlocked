import { type FormEvent, useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"

import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitNetlifyForm } from "@/lib/netlify-forms"

const CTASection = () => {
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle")

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
    <section id="cta" className="paper-noise section-padding border-b-2 border-foreground">
      <div className="container-custom">
        <span className="eyebrow mb-7">Choose your side</span>
        <h2 className="heading-section max-w-5xl">Ready for the next coffee run?</h2>

        <div className="mt-12 grid border-2 border-foreground lg:grid-cols-2">
          <article className="bg-primary p-7 text-primary-foreground sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">I&apos;m a brand</p>
            <h3 className="mt-8 font-display text-4xl uppercase leading-[0.9] sm:text-6xl">Put your campaign in hand.</h3>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-primary-foreground/75">Tell us who you want to reach and where you want the cups to land.</p>
            <Link to="/advertiser-form" className="mt-9 inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-sm font-bold uppercase tracking-[0.1em]">
              Build a campaign brief <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="border-t-2 border-foreground bg-accent p-7 text-accent-foreground sm:p-10 lg:border-l-2 lg:border-t-0 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">I run a café</p>
            <h3 className="mt-8 font-display text-4xl uppercase leading-[0.9] sm:text-6xl">Get your cup costs covered.</h3>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-accent-foreground/75">Join the network and tell us what your café needs each week.</p>
            <Link to="/cafe-form" className="mt-9 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.1em]">
              Apply as a café <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>

        <div className="mt-16 grid gap-10 border-t-2 border-foreground pt-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-display text-4xl uppercase leading-[0.95] sm:text-5xl">Not sure where you fit?</p>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">Send a straight question. It goes to the CupSpace team.</p>
            <a className="mt-6 inline-block border-b-2 border-foreground text-sm font-bold" href="mailto:info@cupspace.com.au">info@cupspace.com.au</a>
          </div>

          <div className="poster-panel p-6 sm:p-8">
            {submissionState === "success" ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-14 w-14 text-primary" />
                <h3 className="mt-5 font-display text-3xl uppercase">Message received</h3>
                <p className="mt-3 max-w-sm text-muted-foreground">The CupSpace team will reply shortly.</p>
              </div>
            ) : (
              <form name="contact-form" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-5">
                <input type="hidden" name="form-name" value="contact-form" />
                <div className="hidden"><label>Do not fill this out: <input name="bot-field" /></label></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><Label htmlFor="firstName">First name</Label><Input id="firstName" name="firstName" autoComplete="given-name" className="mt-2" required /></div>
                  <div><Label htmlFor="lastName">Last name</Label><Input id="lastName" name="lastName" autoComplete="family-name" className="mt-2" required /></div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" className="mt-2" required /></div>
                  <div><Label htmlFor="company">Company</Label><Input id="company" name="company" autoComplete="organization" className="mt-2" /></div>
                </div>
                <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" className="mt-2" rows={4} required /></div>
                <HeroButton type="submit" disabled={submissionState === "submitting"}>{submissionState === "submitting" ? "Sending..." : "Send it"}</HeroButton>
                {submissionState === "error" && <p role="alert" className="text-sm font-bold text-destructive">We could not send this. Try again or email info@cupspace.com.au.</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
