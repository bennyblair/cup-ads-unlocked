# CupSpace Pipeline

Private pipeline dashboard for CupSpace. It reads the Notion pipeline, shows what is waiting, and files instructions for Grok Bot. It does not send email, and it does not change a lead's stage or fields. Anything that would email someone comes back to Ben as a draft first. Grok Bot picks up a filed request on its next run.

This is a separate Netlify site from [cupspace.com.au](https://cupspace.com.au) and from [qr.cupspace.com.au](https://qr.cupspace.com.au). Do not change the marketing site's build, and do not change email DNS (MX, SPF, DKIM or DMARC). The only DNS change is one record for `pipeline`.

## How it is hosted

- **App:** this `pipeline/` directory, deployed as its **own** Netlify site.
- **Source of truth:** Notion. The server calls the Notion REST API, version `2025-09-03`, with `POST /v1/data_sources/{id}/query`. The browser never sees the token or a raw Notion payload.
- **Reads:** cached in the function instance for 60 seconds. If Notion then fails, the last successful read from the past 15 minutes is shown with a warning. Pages are followed with `start_cursor` until Notion says there are no more.
- **Writes:** `POST /v1/pages` into the Dashboard Requests data source only. Status is always `New`. Submitted at is the current Australia/Sydney time. A lead relation is set only when the request was filed from that lead.
- **Example data:** if `NOTION_TOKEN` is absent, a signed-in session shows invented leads and send totals, labelled as example data. Filing a request in that mode stays in memory for that function instance and is not written to Notion.

Sign-in is one shared password (`PIPELINE_ADMIN_PASSWORD`) plus a signing secret (`PIPELINE_SESSION_SECRET`). The session cookie is HttpOnly. Changing the password signs everyone out. The password is never stored in this repository. Login failures are rate limited.

Times on the board, the due lists, and the send chart use Australia/Sydney, including daylight saving. A Notion date with no time stays on that calendar day. A timestamp is bucketed into the Sydney day.

## Notion

Create an internal integration and share the hub page with it. The dashboard token needs to read the three data sources and insert rows into Dashboard Requests.

1. Open [Notion integrations](https://www.notion.so/profile/integrations) and choose **New integration**.
2. Type: **Internal**. Name it `CupSpace Pipeline`. The associated workspace must be the one that holds the pipeline.
3. Capabilities: **Read content** and **Insert content**. The dashboard does not update lead fields. If the same integration will also be used by Grok Bot to change stages later, add **Update content** for that bot. Do not add the token to the marketing site.
4. Copy the internal integration secret. That value is `NOTION_TOKEN`.
5. In Notion, open the hub page **CupSpace Pipeline Dashboard (data)**. Choose **••• → Connections** (or **Add connections**) and add `CupSpace Pipeline`. The Pipeline, Send Stats, and Dashboard Requests databases on that page need to be shared. Access to the hub page is what grants them.

The server already uses these data source ids:

| Data source | Id |
| --- | --- |
| Pipeline | `423f6a93-3cf6-8125-b13c-000b01672973` |
| Send Stats | `423f6a93-3cf6-8145-a846-000bee657fed` |
| Dashboard Requests | `423f6a93-3cf6-8112-a86e-000b857c39ec` |

## Run it locally

```sh
cd pipeline
npm install
npm run build
```

Create `pipeline/.env` (it is gitignored) with a password of at least 8 characters and a secret of at least 32 characters. Generate the secret with `openssl rand -base64 32`. Leave `NOTION_TOKEN` empty to use example data, or paste the integration secret to read Notion.

```sh
npm run dev
```

Open the printed local URL and sign in. Checks:

```sh
npm run typecheck
npm test
```

## Deploy it without touching the existing site

Do this in the **same Netlify team** that already hosts cupspace.com.au, so the DNS zone can gain one record. Do not edit the existing site's build settings. Do not deploy this from the cupspace.com.au site. Ben approves the production site and the DNS record. Do not create the site or change DNS until that approval.

1. Netlify → **Add new project** → import `bennyblair/cup-ads-unlocked`.
2. Branch: `main`. **Base directory: `pipeline`.**
   Build command: `npm run build`. Publish directory: `pipeline/dist`
   (Netlify shows this as `dist` once the base directory is `pipeline`).
3. Add environment variables. Do not add them to the cupspace.com.au site.
   - `PIPELINE_ADMIN_PASSWORD` — at least 8 characters. **Functions** and **Runtime** (the edge gate checks the session).
   - `PIPELINE_SESSION_SECRET` — at least 32 characters (`openssl rand -base64 32`). **Functions** and **Runtime**.
   - `NOTION_TOKEN` — the internal integration secret. **Functions** only. Leave it unset on deploy previews if those previews should keep showing labelled example data. A preview still needs the password and secret or the sign-in page returns 503.
4. Deploy, then add the custom domain `pipeline.cupspace.com.au`.
5. When Netlify offers a DNS record, add only the `pipeline` host. It should be a CNAME from `pipeline` to the new site's `*.netlify.app` hostname.
   If the new site cannot edit the zone, add that same CNAME on the existing site's DNS page. Decline any offer to replace nameservers or the whole zone.
6. Wait for the certificate. Confirm:
   - `https://pipeline.cupspace.com.au/login` shows the sign-in page
   - after sign-in, the board loads from Notion, or shows the example-data banner when `NOTION_TOKEN` is absent
   - `dig MX cupspace.com.au` still points at `ax.email`
   - the TXT SPF record still contains `include:spf.ax.email`
   - `_dmarc.cupspace.com.au` still has `p=quarantine`

Do not set a Netlify `build.ignore` command for this site. An empty cached commit makes that command look like there is nothing to build, and the deploy stops before the edge function is bundled.

The public URL is `https://pipeline.cupspace.com.au/`. It redirects to `/login` until you sign in with `PIPELINE_ADMIN_PASSWORD`. `robots.txt` disallows the whole site, and pages send `noindex, nofollow`.

## What the screen does

- **Overview:** waiting on us, calls due, pricing to send, replies needed, follow-ups due, active campaigns, and won. Sends per inbox for the last 7 and 30 Sydney days, with bounces, replies, reply rate, and a daily trend. Due means today or earlier in Sydney. Held, lost, and do-not-contact leads stay out of those action counts.
- **Board:** one column per stage. Unknown stage names get their own column instead of being dropped. Filters: inbox, persona, state, next action, waiting on, and search.
- **Actions:** Send pricing, Reply, Call, and Follow up. Call rows use a `tel:` link when the mobile is a normal number. Rows are sorted by the oldest due date, then the oldest contact.
- **Requests:** a box files a Dashboard Requests row. The same box is on each lead. The list shows status and the bot response.
- **Last synced:** the time of the Notion read, in Sydney. Use Sync to skip the 60 second cache.

The copy on the request box says that Grok Bot picks the request up on its next run, and that anything which emails someone comes to Ben as a draft first.
