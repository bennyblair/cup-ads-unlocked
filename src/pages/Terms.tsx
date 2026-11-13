import { Link } from "react-router-dom"

import DraftPage from "@/components/layout/DraftPage"
import { ABN, CONTACT_EMAIL, LEGAL_NAME } from "@/seo/metadata"

const heading = "mt-10 font-display text-3xl uppercase leading-[0.95] text-primary"

const Terms = () => (
  <DraftPage
    eyebrow="Draft / terms"
    title="Terms of use"
    lede="Rules for using the CupSpace website at cupspace.com.au. This is a plain-English starting draft for an Australian advertising business. It needs approval before anyone relies on it."
  >
    <h2 className={heading}>Who we are</h2>
    <p>
      The website is run by {LEGAL_NAME} (CupSpace), ABN {ABN}. Email {CONTACT_EMAIL}. A phone number and a street address are not published because they have not been confirmed. CupSpace at https://cupspace.com.au is not the website cupspace.com, and it is not an unrelated app that uses a similar name.
    </p>

    <h2 className={heading}>Using this website</h2>
    <p>
      The site explains coffee cup advertising: a brand printed on takeaway cups, cups distributed through local cafés, and a QR code that can link to the advertiser so an enquiry can be tracked. Reading the site, or sending an enquiry, does not by itself create a campaign contract.
    </p>
    <p>
      Campaigns, café supply and any price are agreed separately, in writing, before work starts. Nothing on this website is a quote.
    </p>

    <h2 className={heading}>No promise of results</h2>
    <p>
      Case studies describe past campaigns. They are not a promise that a new campaign will produce the same attention, enquiries or sales. The site is general information. It is not financial, marketing or legal advice.
    </p>

    <h2 className={heading}>Your messages and what goes on a cup</h2>
    <p>
      You are responsible for the information you send us and for claims you ask us to print. Do not ask CupSpace to print anything unlawful, misleading, or that you do not have the right to use. CupSpace does not adopt an advertiser&apos;s product claims as its own.
    </p>

    <h2 className={heading}>Acceptable use</h2>
    <p>Do not misuse the site. That includes trying to break it, interfere with it, scrape it in a way that harms it, or send unlawful material through the forms.</p>

    <h2 className={heading}>Our content</h2>
    <p>
      The words, design and CupSpace name and logo on this site belong to {LEGAL_NAME} or its licensors. You may read them for your own enquiry. You may not copy them for your own advertising or product without permission. This draft does not claim that any trade mark is registered. Ben needs to confirm the trade mark position.
    </p>

    <h2 className={heading}>QR codes and other websites</h2>
    <p>
      A QR code or link may take you to qr.cupspace.com.au or to another website. Those places have their own terms. We are not responsible for third-party websites.
    </p>

    <h2 className={heading}>Liability</h2>
    <p>
      To the extent the Australian Consumer Law allows, {LEGAL_NAME} limits liability for use of this website. Nothing in these terms excludes a consumer guarantee or other right that cannot legally be excluded. This paragraph is a draft and needs a lawyer to review it. No dollar cap is stated, because one has not been decided.
    </p>

    <h2 className={heading}>Governing law</h2>
    <p>
      This draft proposes the laws of New South Wales, Australia, because the published service area includes Sydney. Ben needs to confirm the state of registration and the governing law he wants. If a dispute about the website cannot be resolved by email, the courts of that confirmed state would be the intended venue.
    </p>

    <h2 className={heading}>Changes</h2>
    <p>
      We may update these terms by posting a new version on this page. Related pages: <Link className="font-semibold text-primary underline underline-offset-4" to="/privacy">privacy</Link> and <Link className="font-semibold text-primary underline underline-offset-4" to="/contact">contact</Link>.
    </p>
  </DraftPage>
)

export default Terms
