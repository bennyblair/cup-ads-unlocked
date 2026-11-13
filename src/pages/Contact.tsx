import { type FormEvent, useState } from "react"
import { Link } from "react-router-dom"

import SiteHeader from "@/components/layout/SiteHeader"
import Footer from "@/components/sections/Footer"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitNetlifyForm } from "@/lib/netlify-forms"
import { ABN, CONTACT_EMAIL, LEGAL_NAME, PHONE_DISPLAY, PHONE_TEL } from "@/seo/metadata"

const details = [
  ["Legal name", LEGAL_NAME],
  ["Brand", "CupSpace"],
  ["ABN", ABN],
  ["Email", CONTACT_EMAIL],
  ["Phone", PHONE_DISPLAY],
  ["Website", "https://cupspace.com.au"],
  ["Service area", "Sydney, New South Wales, and Australia"],
]

const Contact = () => {
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
    <div className="public-site">
      <SiteHeader />
      <main>
        <section className="border-b-2 border-foreground bg-primary py-20 text-primary-foreground sm:py-28">
          <div className="container-custom">
            <span className="eyebrow mb-8">Contact / CUPSPACE PTY LTD</span>
            <h1 className="max-w-6xl font-display text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em]">
              Contact CupSpace
            </h1>
            <p className="mt-9 max-w-2xl border-l-4 border-accent pl-5 text-xl leading-relaxed text-primary-foreground/75">
              CupSpace is the brand of {LEGAL_NAME}. We place advertising on takeaway coffee cups distributed through local cafés.
            </p>
          </div>
        </section>

        <section className="paper-noise section-padding border-b-2 border-foreground">
          <div className="container-custom grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="font-display text-3xl uppercase leading-[0.95] text-primary sm:text-5xl">Who to write to</h2>
              <dl className="mt-8 border-2 border-foreground">
                {details.map(([label, value]) => (
                  <div key={label} className="grid gap-1 border-b-2 border-foreground p-4 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{label}</dt>
                    <dd className="font-medium">
                      {label === "Email" ? (
                        <a className="border-b-2 border-foreground" href={`mailto:${value}`}>{value}</a>
                      ) : label === "Phone" ? (
                        <a className="border-b-2 border-foreground" href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
                      ) : label === "Website" ? (
                        <a className="border-b-2 border-foreground" href={value}>{value}</a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                A street address is not listed here. It has not been confirmed for publication.
              </p>

              <h2 className="mt-12 font-display text-3xl uppercase leading-[0.95] text-primary">What to enquire about</h2>
              <ul className="mt-6 list-disc space-y-3 pl-6 text-lg leading-relaxed text-muted-foreground">
                <li>Advertising your business on takeaway coffee cups.</li>
                <li>Which suburbs you want to reach, including Sydney.</li>
                <li>Supplying cups to your café.</li>
                <li>A question about a campaign or a QR code.</li>
              </ul>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link className="inline-flex items-center justify-center border-2 border-foreground bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground" to="/advertiser-form">
                  For brands
                </Link>
                <Link className="inline-flex items-center justify-center border-2 border-foreground bg-accent px-5 py-3 text-sm font-bold uppercase tracking-[0.08em]" to="/cafe-form">
                  For cafés
                </Link>
                <Link className="inline-flex items-center justify-center border-2 border-foreground px-5 py-3 text-sm font-bold uppercase tracking-[0.08em]" to="/coffee-cup-advertising-sydney">
                  Sydney
                </Link>
              </div>
            </div>

            <div className="border-2 border-foreground bg-card p-6 sm:p-8">
              {submissionState === "success" ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <h2 className="font-display text-4xl uppercase">Message received</h2>
                  <p className="mt-4 max-w-sm text-muted-foreground">The CupSpace team will reply by email.</p>
                </div>
              ) : (
                <form name="contact-form" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-5">
                  <input type="hidden" name="form-name" value="contact-form" />
                  <div className="hidden"><label>Do not fill this out: <input name="bot-field" /></label></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="contact-first-name">First name</Label>
                      <Input id="contact-first-name" name="firstName" autoComplete="given-name" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="contact-last-name">Last name</Label>
                      <Input id="contact-last-name" name="lastName" autoComplete="family-name" className="mt-2" required />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input id="contact-email" name="email" type="email" autoComplete="email" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="contact-company">Company</Label>
                      <Input id="contact-company" name="company" autoComplete="organization" className="mt-2" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea id="contact-message" name="message" className="mt-2" rows={5} required />
                  </div>
                  <HeroButton type="submit" disabled={submissionState === "submitting"}>
                    {submissionState === "submitting" ? "Sending..." : "Send it"}
                  </HeroButton>
                  {submissionState === "error" && (
                    <p role="alert" className="text-sm font-bold text-destructive">
                      We could not send this. Try again or email {CONTACT_EMAIL}.
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
