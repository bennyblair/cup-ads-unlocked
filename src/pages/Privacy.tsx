import { Link } from "react-router-dom"

import DraftPage from "@/components/layout/DraftPage"
import { ABN, CONTACT_EMAIL, LEGAL_NAME } from "@/seo/metadata"

const heading = "mt-10 font-display text-3xl uppercase leading-[0.95] text-primary"

const Privacy = () => (
  <DraftPage
    eyebrow="Draft / privacy"
    title="Privacy"
    lede="How CUPSPACE PTY LTD (CupSpace) handles personal information collected through cupspace.com.au. This wording is a draft and needs review before it is treated as final."
  >
    <h2 className={heading}>Who we are</h2>
    <p>
      CupSpace is the brand of {LEGAL_NAME}, ABN {ABN}. This notice is about the website at https://cupspace.com.au. Email {CONTACT_EMAIL}. A phone number and a street address are not published because they have not been confirmed.
    </p>
    <p>
      CupSpace places advertising on takeaway coffee cups distributed through local cafés. The service area we publish is Sydney, New South Wales, and Australia. This business is not the website cupspace.com, and it is not an unrelated app that uses a similar name.
    </p>

    <h2 className={heading}>Information you give us</h2>
    <p>If you email us or use a form on this website, we collect the details you choose to send. Depending on the form, that can include:</p>
    <ul className="list-disc space-y-2 pl-6">
      <li>your name, email address and phone number</li>
      <li>your business, café or campaign details</li>
      <li>a café address and operating information, if you apply as a café</li>
      <li>the message you write</li>
    </ul>
    <p>Please do not send information you are not comfortable sharing. We use what you send to reply, to consider a café application, and to plan a cup campaign.</p>

    <h2 className={heading}>Information collected while you browse</h2>
    <p>
      This marketing site does not install its own advertising or analytics cookies in the code published here. The site is hosted on Netlify, which may keep ordinary server logs, such as an IP address, browser type and the page requested, so the site can run and be kept secure. Ben needs to confirm whether any extra analytics tools are added later.
    </p>

    <h2 className={heading}>Campaign QR codes</h2>
    <p>
      Some campaigns print a QR code that links to the advertiser. Opening that code can be counted so the advertiser can see that the cup was used. The QR address is separate, at qr.cupspace.com.au. That count is not, by itself, a named profile of a person. Ben needs to confirm this description against the QR product before this page is relied on.
    </p>

    <h2 className={heading}>How we use information</h2>
    <ul className="list-disc space-y-2 pl-6">
      <li>to answer enquiries</li>
      <li>to review café applications and run cup campaigns</li>
      <li>to keep records we need for the work, or that the law requires</li>
    </ul>
    <p>We do not sell personal information.</p>

    <h2 className={heading}>Who else handles it</h2>
    <p>
      Netlify hosts this website and stores the form submissions, so it handles that information in order to provide those services. Ben needs to confirm whether anyone else handles personal information. We do not name any other provider here, because none has been confirmed.
    </p>
    <p>
      Some website hosts store data outside Australia. This draft does not state where CupSpace form submissions or logs are stored. That has to be confirmed before the page is final.
    </p>

    <h2 className={heading}>How long we keep it</h2>
    <p>
      We keep enquiry and application details for as long as we need them to respond, to run a campaign, or to meet a legal duty. A fixed retention period has not been set in this draft. Ben needs to confirm one.
    </p>

    <h2 className={heading}>Access, correction and complaints</h2>
    <p>
      To ask for a copy of the personal information we hold about you, or to ask for a correction, email {CONTACT_EMAIL}. If you are not satisfied with the reply, you can contact the Office of the Australian Information Commissioner at https://www.oaic.gov.au.
    </p>
    <p>
      This draft should be checked against the Privacy Act 1988 (Cth), including the Australian Privacy Principles. Whether {LEGAL_NAME} is legally required to comply depends on facts that are not stated here, including annual turnover. Ben needs to confirm that.
    </p>

    <h2 className={heading}>Changes</h2>
    <p>
      If this notice changes, the updated version will be posted on this page. Related pages: <Link className="font-semibold text-primary underline underline-offset-4" to="/contact">contact</Link> and <Link className="font-semibold text-primary underline underline-offset-4" to="/terms">terms of use</Link>.
    </p>
  </DraftPage>
)

export default Privacy
