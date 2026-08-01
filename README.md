# CupSpace

CupSpace connects advertisers with Australian cafés for branded takeaway-cup
campaigns.

## Local development

Requirements: Node.js 22 or newer and npm.

```sh
npm install
npm run dev
```

Before deploying:

```sh
npm run typecheck
npm run lint
npm run build
```

## Café network map

The interactive map uses MapLibre GL with OpenFreeMap tiles. It does not require
MapTiler, a map API key, or a map environment variable.

Target areas live in `src/data/locations.ts`. Use `kind: "target"` for an area
CupSpace wants to recruit in. Target areas are labelled as recruitment areas and
are never presented as signed-up cafés.

Approved cafés are loaded dynamically from the public `/api/cafes` Netlify
Function. The public API returns only:

- an internal café ID;
- the label `Verified CupSpace café`;
- suburb and state;
- coordinates automatically offset 220–400 metres from the private pin; and
- a short privacy-safe description.

The café name, street address, contact details and exact coordinates are never
returned by the public endpoint. Advertiser requests carry the internal café ID so
CupSpace can identify the requested venue privately.

## Automated café approval workflow

1. A café submits `cafe-form`, including its exact private pin and consent to an
   anonymous approximate marker.
2. After Netlify verifies the submission, `cafe-submission.mts` saves a separate
   pending record in the `cupspace-cafes` Netlify Blobs store.
3. Netlify's existing form notification emails alert the CupSpace team.
4. An administrator opens `/admin/cafes`, enters the private PIN and reviews the
   application.
5. Approving moves the record from pending to approved. The anonymous green map
   marker becomes available through `/api/cafes` without a rebuild.
6. Unpublishing returns a record to pending. Rejecting removes it from the approval
   queue and stores it as rejected for an audit trail.

In local Vite development, café records are simulated in browser local storage so
the complete form → approval → green marker flow can be tested. The local preview
PIN is `cupspace-preview`; this value is not accepted in production.

### Required Netlify environment variable

Before deploying the approval workflow, create this environment variable in the
CupSpace Netlify project and include the Functions runtime scope:

```text
CUPSPACE_ADMIN_PIN=<a unique random value of at least 16 characters>
```

The function refuses admin access if the configured PIN is shorter than 12
characters. Do not commit the real PIN to this repository or send it through a
website form.

The admin page is intentionally unlinked and marked `noindex`, but the PIN is still
the security boundary. Use a unique password rather than a memorable four-digit
code.

## Netlify Forms

The following forms are defined in `public/forms.html` so Netlify can detect them
during deployment:

- `cafe-form`
- `advertiser-form`
- `contact-form`

The React pages post directly to Netlify Forms. No Resend account or email API is
required. Submissions remain available in the Netlify project's Forms tab.

### Email notifications

Email recipients are configured in Netlify rather than committed to this repository:

1. Open the CupSpace site in Netlify.
2. Go to **Project configuration → Notifications → Emails and webhooks**.
3. Add a **Form submission notification** for `info@cupspace.com.au`.
4. Add a second notification for `danshelz@gmail.com`.
5. Apply both recipients to `cafe-form`, `advertiser-form`, and `contact-form`, or
   select all form submissions.

## Deployment checks

Deploy through the existing Netlify connection. After the first deployment:

1. Confirm the `CUPSPACE_ADMIN_PIN` environment variable is available to Functions.
2. Submit one realistic café application with the private pin set.
3. Confirm the entry appears in Netlify Forms and notification emails reach both
   recipients.
4. Open `/admin/cafes`, approve the café and confirm an anonymous green marker
   appears on `/locations`.
5. Submit an advertiser request from that marker and confirm the internal café ID
   is present in the Netlify submission.
