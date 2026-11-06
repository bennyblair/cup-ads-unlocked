# CupSpace QR Studio

Private campaign QR codes for CupSpace. A printed code always points at
`https://qr.cupspace.com.au/c/<id>`. Opening that link counts one visit, then
redirects to the client's page. Changing the destination later does not change
the printed code.

This is a separate Netlify site from [cupspace.com.au](https://cupspace.com.au).
Do not change the marketing site's build, and do not change its email DNS
(MX, SPF, DKIM or DMARC). The only DNS change is one record for `qr`.

## What was already there

The marketing repository did not contain QR Studio. Ben's other public
repositories, including the Emet Capital ones, do not contain this app either.
Nothing in the tracker uses an `emet`, `emetcapital`, or third-party shortener
domain. Client destinations can still be any normal http(s) page, including a
client's own site.

The screen layout follows the QR Studio view Ben had already seen: CupSpace
wordmark, campaign totals, and a campaign list. The X / Share bar in that
screenshot is the phone's browser, not part of this app.

## How it is hosted

- **App:** this `qr/` directory, deployed as its **own** Netlify site.
- **Database:** Netlify Blobs store `cupspace-qr`, one document named
  `campaigns`. Production deploys share that store. Deploy previews use a
  separate store so they cannot edit live campaigns.
- **Fields stored:** campaign id, name, destination URL, visit count, created
  date. An optional cafe label and an optional timezone can be saved later.
  They do not change the id or the printed QR link. Repeat visits are counted.
  There are no client logins.
- **Visit counting:** a strongly consistent compare-and-swap on that document.
  HEAD requests are not counted. If the counter cannot be updated, the visitor
  is still redirected.
- **Why not a separate Postgres database:** Netlify Database and Neon stay
  running and draw compute credits. Blobs are enough for this many small
  records and do not need another account.

Each counted visit can also store a short scan record: time, approximate city and
country when Netlify provides them, plus a coarse device and browser. Raw IP
addresses, hashed IP addresses, and the raw browser string are not stored.
Each campaign keeps the latest 30 individual scans. Daily totals are stored
separately for up to 400 days, so a date-range report still works after those
30 scans roll off. Older visits that happened before daily reporting keep their
count and are not rebuilt into days. Country totals stop at 40 named places
and then count as Other. Device and browser totals use a fixed list. City
totals keep about 20 names per day and then count as Other. These records are
removed when the campaign is deleted. There is no separate charge for this; it
uses the same Netlify Blobs store.

Reports use the campaign timezone. Sydney is the default. Darwin and Brisbane
(Townsville) do not use daylight saving, so choose those when the dates and
hours should follow that city. Changing the timezone applies to later scans.

A repeat-browser estimate uses one first-party cookie per campaign,
`cs_<campaign id>`. The value is a random 16-character token, HttpOnly,
SameSite=Lax, kept for 30 days, and only on this site. It is not an IP address,
not shared across campaigns, and not a count of people. A scan is a repeat only
when the browser sends that cookie back. If the cookie is missing, blocked, or
expired, the scan stays "uniqueness unknown" and is not treated as a new person.
The server keeps at most 2,000 unexpired tokens per campaign and drops them
when they expire. Clear automated browser names are labelled and stay inside
the visit total. Enquiry conversions are not known from a redirect and are
shown as not connected. An optional UTM suggestion is display-only until you
paste it into the destination and save.

Sign-in is one shared password (`QR_ADMIN_PASSWORD`) plus a signing secret
(`QR_SESSION_SECRET`). The session cookie is HttpOnly. Changing the password
signs everyone out. The password is never stored in this repository.

## Run it locally

```sh
cd qr
npm install
npm run build
```

Create `qr/.env` (it is gitignored) with a password of at least 8 characters
and a secret of at least 32 characters. Generate the secret with
`openssl rand -base64 32`. Then:

```sh
npm run dev
```

Open the printed local URL and sign in. Local data sits in `qr/.data/` and is
not the live database. QR images still encode `https://qr.cupspace.com.au/...`
so a code saved from a preview is the permanent public link.

Checks:

```sh
npm run typecheck
npm test
```

## Deploy it without touching the existing site

Do this in the **same Netlify team** that already hosts cupspace.com.au, so the
DNS zone can gain one record. Do not edit the existing site's build settings.

1. Netlify → **Add new project** → import `bennyblair/cup-ads-unlocked`.
2. Branch: `main`. **Base directory: `qr`.**
   Build command: `npm run build`. Publish directory: `qr/dist`
   (Netlify shows this as `dist` once the base directory is `qr`).
3. Add environment variables, available to **Functions** and **Runtime**
   (edge). Do not add them to the cupspace.com.au site:
   - `QR_ADMIN_PASSWORD` — at least 8 characters
   - `QR_SESSION_SECRET` — at least 32 characters (`openssl rand -base64 32`)
4. Deploy, then add the custom domain `qr.cupspace.com.au`.
5. When Netlify offers a DNS record, add only the `qr` host. It should be a
   CNAME from `qr` to the new site's `*.netlify.app` hostname.
   If the new site cannot edit the zone, add that same CNAME on the existing
   site's DNS page. Decline any offer to replace nameservers or the whole zone.
6. Wait for the certificate. Confirm:
   - `https://qr.cupspace.com.au/login` shows the sign-in page
   - a new campaign's QR decodes to `https://qr.cupspace.com.au/c/...` and a
     phone scan reaches the client page
   - `dig MX cupspace.com.au` still points at `ax.email`
   - the TXT SPF record still contains `include:spf.ax.email`
   - `_dmarc.cupspace.com.au` still has `p=quarantine`

The public dashboard URL is `https://qr.cupspace.com.au/`. It redirects to
`/login` until you sign in with `QR_ADMIN_PASSWORD`.

## Backups

Use **Backup** in QR Studio. The file is JSON. Older backups have the original
five fields. A cafe label or timezone is included only after you save one.
Keep a copy somewhere outside Netlify. **Restore** replaces every campaign, so
it asks you to type `REPLACE ALL CAMPAIGNS`.

Deleting the Netlify site deletes the blob store. Download a backup before
removing the site.

## Cost

The site uses the Netlify account that already hosts cupspace.com.au. On the
current Free plan that pool is 300 credits per month; Personal is USD $9 for
1,000 credits. Custom domains and Blobs are included.

Roughly: a production deploy is 15 credits, 10,000 web requests are 2 credits,
and 1 GB of bandwidth is 20 credits. A redirect is a few hundred bytes, so
tens of thousands of scans stay well inside a few credits. The larger effect
is a second production deploy whenever this directory changes. If the shared credit pool
is already tight, move the team to Personal rather than adding a database.
Do not set a Netlify `build.ignore` command for this site. An empty cached
commit makes that command look like there is nothing to build, and the deploy
stops before the edge function is bundled.
