# Opal Gems — Operations Manual

Complete reference for the Opal Gems website, admin panel, database, and email
systems. Written for the business owner and anyone who takes over technical
operations.

**Last updated:** 26 August 2026
**Live site:** https://theopalgems.com

> **Security note — read first.** This manual deliberately contains **no passwords,
> API keys, or secret values**. It records *which* accounts exist, *what* each
> credential controls, and *where* the real value is stored. Actual secrets belong in
> a password manager and in the Netlify environment-variable panel — never in this
> repository, which is **public**. See [§3 Accounts & Credentials](#3-accounts--credentials).

---

## Table of contents

1. [The business at a glance](#1-the-business-at-a-glance)
2. [System overview](#2-system-overview)
3. [Accounts & credentials](#3-accounts--credentials)
4. [Environment variables](#4-environment-variables)
5. [The website](#5-the-website)
6. [Product catalogue & inventory data](#6-product-catalogue--inventory-data)
7. [The admin panel](#7-the-admin-panel)
8. [Database](#8-database)
9. [Email system](#9-email-system)
10. [Newsletter](#10-newsletter)
11. [Warranty registration & inventory sync](#11-warranty-registration--inventory-sync)
12. [Automated scheduled jobs](#12-automated-scheduled-jobs)
13. [Deployment & release process](#13-deployment--release-process)
14. [Local development](#14-local-development)
15. [Security posture](#15-security-posture)
16. [Runbooks & troubleshooting](#16-runbooks--troubleshooting)
17. [Open items & known issues](#17-open-items--known-issues)
18. [Maintenance calendar](#18-maintenance-calendar)

---

## 1. The business at a glance

Opal Gems sells fine diamond jewellery from boutiques inside Florida resort hotels.
The positioning is **"Elevated Diamonds, In Person"** — the website is a catalogue and
appointment-booking tool, **not** an e-commerce store. There is no online checkout;
every sale completes in a boutique.

### Boutiques

| Boutique | Location | Address | Hours | Phone |
|---|---|---|---|---|
| **Opal Grand** | Delray Beach, FL | 10 North Ocean Boulevard, Delray Beach, FL 33483 | Daily 10am–7pm | (561) 274-3200 |
| **Opal Sol** | Clearwater Beach, FL | 400 Coronado Dr, Clearwater Beach, FL 33767 | Daily 10am–8pm | (727) 229-8171 |
| **Jupiter Beach Resort & Spa** | Jupiter, FL | 5 North A1A, Jupiter, FL 33477 | Daily 9am–6pm | (561) 786-2751 |
| **Olde Naples Hotel** | Naples, FL | 200 Broad Avenue South, Naples, FL 34102 | — | — |

- **Main brand phone (all boutiques):** (920) 920-1145
- **WhatsApp concierge:** +1 561-251-9560
- **Registered business address (email footers):** 10 N Ocean Blvd, Delray Beach, FL 33483

Olde Naples appears in the footer boutique list only — it has no location page, no
navigation dropdown, and no inventory in the site.

### Product categories

Necklaces · Rings · Earrings · Bracelets · Watches

---

## 2. System overview

```
Visitor → theopalgems.com (Netlify CDN)
              │
              ├── React single-page app (static build, pre-rendered for SEO)
              │
              └── /api/* → Netlify Functions (server-side)
                              │
                              ├── Supabase (PostgreSQL) — subscribers, CMS content,
                              │                            warranty registrations
                              ├── Resend — all outbound email
                              └── Inventory app Supabase — customer sync
```

### Technology

| Layer | Technology |
|---|---|
| Front end | React 18, React Router, Vite |
| Styling | Plain CSS (`src/styles.css`), CSS custom properties |
| SEO | `react-helmet-async` + Playwright pre-rendering at build time |
| Hosting / CDN | Netlify |
| Serverless API | Netlify Functions (Node 20, esbuild bundler) |
| Database | Supabase (PostgreSQL) |
| Transactional email | Resend |
| Bot protection | Cloudflare Turnstile + custom spam layers |
| Source control | GitHub |

### Repositories

| Repo | Role |
|---|---|
| **`OpalGems2026/theopalgems`** | ✅ **Current source of truth.** All work goes here. |
| `datacendia/theopalgems` | Legacy repo. Retained for history; no longer the deploy source. |

Both repos are **public**. Never commit inventory spreadsheets, `.env`, or customer data.

The production branch is **`main`**. Merging to `main` triggers a Netlify build.

---

## 3. Accounts & credentials

> **How to use this section.** This is a *registry*, not a vault. Store every actual
> password, key, and recovery code in a password manager (1Password, Bitwarden, etc.)
> under a shared "Opal Gems" vault. Fill the **Where the secret lives** column with the
> password-manager entry name. **Do not type secret values into this file** — it is in
> a public Git repository.

### 3.1 Service accounts

| # | Service | What it controls | Dashboard | Login email | Where the secret lives |
|---|---|---|---|---|---|
| 1 | **GitHub** (`OpalGems2026`) | Source code; merging to `main` deploys the site | https://github.com/OpalGems2026 | _fill in_ | _password manager entry_ |
| 2 | **Netlify** (team `opalgems2026`) | Hosting, DNS, serverless functions, **all production env vars** | https://app.netlify.com/teams/opalgems2026/projects | _fill in_ | _password manager entry_ |
| 3 | **Supabase** (project `avbegqyvtvdmdilgwnif`) | Production database — subscribers, CMS content, warranty registrations | https://supabase.com/dashboard/project/avbegqyvtvdmdilgwnif | _fill in_ | _password manager entry_ |
| 4 | **Resend** | All outbound email + sending-domain DNS | https://resend.com/domains/c7e4f730-054f-45dc-b5b1-54666ec28e7c | _fill in_ | _password manager entry_ |
| 5 | **Cloudflare Turnstile** | CAPTCHA keys for the subscribe form | https://dash.cloudflare.com | _fill in_ | _password manager entry_ |
| 6 | **Domain registrar** (`theopalgems.com`) | Domain ownership & renewal | _fill in_ | _fill in_ | _password manager entry_ |
| 7 | **Google (Drive/Sheets)** | Inventory spreadsheets + product photos | https://drive.google.com | _fill in_ | _password manager entry_ |
| 8 | **Inventory app Supabase** (`foypszldhyslqknpjilc`) | Third-party customer database that warranty registrations sync into | — (owner: Andrew) | third-party | _password manager entry_ |

### 3.2 Application logins (not service accounts)

| Login | Purpose | How it works | Where the secret lives |
|---|---|---|---|
| **Website admin panel** | Manage products, photos, subscribers, newsletter, warranties | Single shared password at https://theopalgems.com/admin — set by the `ADMIN_PASSWORD` env var in Netlify. Grants a 24-hour session token. | _password manager entry_ |

⚠️ **Important:** the admin panel uses **one shared password for everyone** — there are
no individual staff accounts, so there is no audit trail of who changed what, and
removing one person's access means changing the password for everybody. See
[§17 Open items](#17-open-items--known-issues).

### 3.3 Credential rotation

If a secret is ever exposed (committed to Git, emailed, pasted in chat):

| Secret | How to rotate |
|---|---|
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → roll the `service_role` key → update in Netlify env → redeploy |
| `RESEND_API_KEY` | Resend → API Keys → revoke and create new → update in Netlify env → redeploy |
| `ADMIN_PASSWORD` | Change the value in Netlify env → redeploy → tell staff the new password |
| `ADMIN_JWT_SECRET` | Change to a new random string in Netlify env → redeploy (logs everyone out) |
| `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile → rotate → update in Netlify env |
| `INVENTORY_SUPABASE_SERVICE_KEY` | Owned by the inventory app (Andrew) — request a new key from them |

**Rotation is not optional after exposure.** A leaked `service_role` key gives full
read/write access to the entire customer database, bypassing all security rules.

### 3.4 Email addresses in use

| Address | Role |
|---|---|
| `hello@theopalgems.com` | The "from" address on all customer email (`RESEND_FROM_EMAIL`) |
| `sales@theopalgems.com` | Warranty-registration notifications (`SALES_NOTIFICATION_EMAIL`) |
| _admin address_ | New-subscriber and newsletter-draft alerts (`ADMIN_NOTIFICATION_EMAIL`) |

---

## 4. Environment variables

All production values live in **Netlify → Site configuration → Environment variables**.
The local `.env` file (git-ignored) holds development values only.

### 4.1 Client-side (bundled into public JavaScript — never secret)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public "anon" key. Safe to expose; row-level security restricts it to public-readable CMS content. |
| `VITE_TURNSTILE_SITE_KEY` | Public CAPTCHA site key |

> Anything prefixed `VITE_` is **compiled into the public JavaScript bundle**. Never put
> a secret behind a `VITE_` prefix.
>
> ⚠️ Use the **legacy** `eyJ…` JWT keys, not the newer `sb_publishable_…` / `sb_secret_…`
> format — see [§8.4 Supabase API key formats](#84-supabase-api-key-formats--important).

### 4.2 Server-side (Netlify Functions only — all secret)

| Variable | Required | Purpose | If unset |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | Production database URL | Signup/warranty writes fail |
| `SUPABASE_SERVICE_KEY` | ✅ | Master database key, bypasses row-level security | **Warranty goes to demo mode and silently skips all writes** |
| `RESEND_API_KEY` | ✅ | Sends all email | Email silently skipped (logged as a warning) |
| `RESEND_FROM_EMAIL` | ✅ | Sender identity — `Opal Gems <hello@theopalgems.com>` | Falls back to `onboarding@resend.dev` |
| `ADMIN_PASSWORD` | ✅ | Admin panel password | Admin login returns "Server not configured" |
| `ADMIN_JWT_SECRET` | ✅ | Signs admin session tokens (random string) | Admin login returns "Server not configured" |
| `ADMIN_NOTIFICATION_EMAIL` | ➖ | Where new-subscriber alerts go | Alerts skipped |
| `SALES_NOTIFICATION_EMAIL` | ➖ | Warranty alerts | Defaults to `sales@theopalgems.com` |
| `SITE_URL` | ➖ | Base URL in email links | Defaults to `https://theopalgems.com` |
| `ALLOWED_ORIGIN` | ➖ | CORS allow-list | Defaults to `https://theopalgems.com` |
| `TURNSTILE_SECRET_KEY` | ➖ | Server-side CAPTCHA verification | **CAPTCHA check is skipped entirely** |
| `PROMO_CODE` | ➖ | Welcome discount code | Defaults to `SPARKLE10` |
| `PROMO_DISCOUNT` | ➖ | Discount wording in emails/popup | Defaults to `10% off` |
| `INVENTORY_SUPABASE_URL` | ➖ | Inventory app database | Customer sync disabled |
| `INVENTORY_SUPABASE_SERVICE_KEY` | ➖ | Inventory app key — must be the **JWT** (`eyJ…`) service-role key, **not** the `sb_secret_…` key | Customer sync disabled |
| `INVENTORY_CUSTOMERS_TABLE` | ➖ | Target table name | Defaults to `customers` |
| `WARRANTY_DEMO_MODE` | ➖ | Forces warranty into no-write demo mode | Off |

---

## 5. The website

### 5.1 Public pages

| Route | Page |
|---|---|
| `/` | Home — intro animation, hero, category grid, testimonials, boutique list |
| `/category/:category` | Category catalogue (necklaces, rings, earrings, bracelets, watches) |
| `/location/:locationId` | Boutique page with that store's real stock |
| `/location/:locationId/:category` | Boutique page filtered to one category |
| `/craft` | Craft Your Diamond |
| `/about` | About Us |
| `/lab-vs-natural` | Lab vs. Natural education page |
| `/faq` | Frequently asked questions |
| `/book` | Book an appointment |
| `/search` | Search results |
| `/preferences` | Subscriber preference survey (reached from the confirmation email) |
| `/warranty`, `/warranty/register` | Warranty registration form |
| `/privacy`, `/terms` | Legal pages |

### 5.2 Site-wide furniture

- **Header:** category navigation with per-boutique dropdowns, search, Book Appointment.
- **Footer:** boutique addresses, hours, quick links, newsletter signup, WhatsApp contact.
- **Promo popup:** 10%-off welcome offer — see [§9.4](#94-the-10-off-welcome-popup).

### 5.3 SEO

`npm run build` runs two extra steps beyond the standard Vite build:

1. **`scripts/generate-sitemap.mjs`** — regenerates `public/sitemap.xml`.
2. **`scripts/prerender.mjs`** — launches headless Chromium (Playwright) and writes a
   static HTML snapshot of each route so search engines see real content.

Structured data (schema.org) lives in `index.html` and per-page via the `SEO` component.
`public/llms.txt` describes the business for AI crawlers.

---

## 6. Product catalogue & inventory data

**This is the least obvious part of the system. Read before editing products.**

Product grids are **not** driven by the database. They render from **static JavaScript
files** committed to the repo:

| File | Used by | Contents |
|---|---|---|
| `src/data/kiraProducts.js` | `/category/*` pages | Shared catalogue (~119–128 items) |
| `src/data/opalGrandProducts.js` | Opal Grand boutique page | 54 pieces |
| `src/data/opalSolProducts.js` | Opal Sol boutique page | 31 pieces |
| `src/data/jupiterProducts.js` | Jupiter boutique page | 23 pieces |
| `src/data/watches.js` | `/category/watches` | Watch catalogue |

`LocationPage.jsx` picks the per-store list when one exists, otherwise falls back to the
shared catalogue.

### 6.1 Product record shape

```js
{ name, link, description, category, ctw?, gold?, diamond?, price?, cert?, spin? }
```

`name` is the SKU. `link` is the image path. `spin` is an optional 360° video.

### 6.2 Image conventions

| Path | Meaning |
|---|---|
| `/assets/kira-black/<SKU>.jpg` | Studio renders on black (the uniform "floating" look) |
| `/assets/inventory/<SKU>.jpg` | Real in-store photos on display busts |
| `/assets/{opal-sol,jupiter,opal-grand}/<SKU>.jpg` | Per-boutique stock photos |
| `/assets/spin/<category>/<base>.mp4` | 360° spin videos |

Missing images fall back to a placeholder pendant — if many products look like the same
pendant, their image paths are broken.

### 6.3 Source spreadsheets

Stock originates in three Google Sheets (one per boutique). Export as CSV with:

```
https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=0
```

Known quirks: prices appear in both European (`$1.750,00`) and US (`$1,400`) formats;
image cells are Google Drive links that frequently say `done` or `SOLD` instead of a URL;
SKUs overlap between stores; Drive links are unreliable to hotlink, so images are
downloaded and committed rather than linked live.

### 6.4 Adding or changing products

1. Edit the relevant `src/data/*.js` file.
2. Add images to `public/assets/…`.
3. Commit and merge to `main`.

There is **no admin screen that edits these grids** — product changes are a code change
and a deploy.

---

## 7. The admin panel

**URL:** https://theopalgems.com/admin — single shared password (`ADMIN_PASSWORD`).
Sessions last 24 hours.

| Screen | Route | Purpose |
|---|---|---|
| Dashboard | `/admin/dashboard` | Counts and recent activity |
| Watches | `/admin/watches` | Watch catalogue |
| Products | `/admin/products/:category` | Product records |
| Locations | `/admin/locations` | Boutique details (address, phone, hours) |
| Sections | `/admin/sections` | Home-page copy and imagery |
| Photos | `/admin/photos` | Photo library |
| Testimonials | `/admin/testimonials` | Customer quotes |
| **Subscribers** | `/admin/subscribers` | **Name, email, phone, status, survey answers; search + CSV export** |
| Newsletter | `/admin/newsletter` | Build, preview, test and send newsletters |
| Warranties | `/admin/warranties` | Warranty registrations |
| Settings | `/admin/settings` | Configuration |

### 7.1 How admin security works

Every admin database operation goes through **`/api/admin-data`**, which:

1. Verifies the admin session token (HMAC-SHA256).
2. Checks the table against an allow-list (`watches`, `products`, `locations`, `sections`,
   `photos`, `subscribers`, `testimonials`, `warranty_registrations`, `newsletter_editions`).
3. Uses the secret service key server-side, so the database itself stays locked down.

This exists because the admin UI previously talked to the database directly using the
public key — meaning the login gated only the interface, not the data. Details in
`ADMIN_RLS_LOCKDOWN.md`.

### 7.2 "Register Customer" link

The footer's *Register Customer* link points to an **external application**
(`opal-gems.vercel.app/customers`) used by sales staff to record purchases. It is a
separate system from this website. Customers cannot use it — the customer-facing signup
is the footer newsletter form.

---

## 8. Database

Supabase PostgreSQL, project **`avbegqyvtvdmdilgwnif`**.

### 8.1 Tables

| Table | Purpose |
|---|---|
| `subscribers` | Newsletter list — the main customer-data table |
| `warranty_registrations` | Warranty/purchase registrations |
| `newsletter_editions` | Newsletter drafts and sent editions |
| `locations` | Boutique records (CMS) |
| `sections` | Home-page content blocks (CMS) |
| `photos` | Photo library (CMS) |
| `products`, `watches` | Product records (CMS) |
| `testimonials` | Customer quotes (CMS) |

### 8.2 `subscribers` columns

| Column | Meaning |
|---|---|
| `email` | Unique identifier |
| `name`, `phone` | Collected at signup (**both required**) |
| `confirmed` | `false` until the confirmation link is clicked |
| `source` | Entry point + IP, e.g. `promo-popup-1.2.3.4` (also used for rate limiting) |
| `unsubscribe_token` | Random UUID used for both confirm and unsubscribe links |
| `unsubscribed_at` | Null while subscribed |
| `referral_source`, `location_interest`, `purchase_intent` | Preference-survey answers |
| `survey_scheduled_at`, `survey_completed_at` | Survey scheduling state |
| `created_at` | Signup timestamp |

### 8.3 Migrations

SQL files in `supabase-migrations/`, applied by hand in the Supabase SQL Editor, in order:

| File | Adds |
|---|---|
| `02-subscribers-unsubscribe.sql` | `unsubscribe_token`, `unsubscribed_at` |
| `03-add-survey-scheduled-at.sql` | `survey_scheduled_at` |
| `04-warranty-registrations.sql` | `warranty_registrations` table |
| `05-warranty-rich-fields.sql` | Extra warranty fields |
| `06-subscriber-name-phone.sql` | `name`, `phone` — **applied 26 Aug 2026** |

**Migrations are not automatic.** After merging a change that includes a new migration,
run it in the Supabase SQL Editor or the related feature will fail.

### 8.4 Supabase API key formats — important

Supabase now issues **two generations of API keys**, and this project uses the **legacy**
generation. Picking the wrong one produces confusing authentication failures.

**Dashboard → Project Settings → API** has two tabs:

| Tab | Keys | Format |
|---|---|---|
| *Publishable and secret API keys* (new) | `sb_publishable_…`, `sb_secret_…` | Opaque strings |
| **Legacy anon, service_role API keys** ← **use this one** | `anon`, `service_role` | JSON Web Tokens, starting `eyJ…` |

**Rules for this project:**

- `VITE_SUPABASE_ANON_KEY` → the legacy **`anon`** JWT (`eyJ…`). This is what production
  currently serves; it is public by design and is compiled into the browser bundle.
- `SUPABASE_SERVICE_KEY` → the legacy **`service_role`** JWT (`eyJ…`). Secret. Netlify only.
- `INVENTORY_SUPABASE_SERVICE_KEY` → the inventory project's **`service_role` JWT**
  (`eyJ…`). The `sb_secret_…` format has been observed to be **rejected** here.

**How to tell which key you are holding:** a legacy key starts with `eyJ` and is ~200+
characters; a new-generation key starts with `sb_publishable_` or `sb_secret_`. You can
decode a legacy key's middle segment (base64) to read its `role` and project `ref` and
confirm it belongs to the right project.

Do not migrate to the new key format piecemeal. If you ever switch, change the anon and
service keys together, in Netlify and locally, and redeploy — mixing generations across
client and server is the usual cause of "invalid API key" errors.

⚠️ **Never paste a `service_role` / `sb_secret_` value into chat, email, a ticket, or this
repository.** It bypasses all row-level security and grants full read/write over customer
data. If one is ever exposed, rotate it immediately (see [§3.3](#33-credential-rotation)).

### 8.5 Plan and capacity

The Supabase organisation is currently on the **Free** plan. Two operational consequences
worth tracking as the subscriber list grows:

- Free projects **pause after an extended period of inactivity**. Unlikely while the site
  receives regular traffic, but a real risk during a quiet stretch — a paused database
  takes the signup, warranty and admin features offline until it is resumed.
- Free-tier **database size and egress limits** apply. Watch these under Billing → Usage;
  upgrading is the fix well before a limit is reached.

---

## 9. Email system

All email sends through **Resend** from `hello@theopalgems.com`. Templates are inline
HTML inside each function — serif typography, `OPAL GEMS` wordmark, gold accent `#b4965a`.

### 9.1 Signup flow (double opt-in)

```
Visitor submits name + email + phone
   → row saved with confirmed = false
   → "Confirm your subscription" email (contains the 10% code)
   → admin alert: "New subscriber (pending)"

Visitor clicks Confirm
   → confirmed = true
   → "Welcome to Opal Gems" email
   → survey scheduled for +24h
   → redirected to /preferences
```

A subscriber who never clicks the confirmation link stays **Pending** and receives no
newsletters. This is the usual explanation for "I signed up but nothing arrived."

### 9.2 Endpoints

| Endpoint | Purpose |
|---|---|
| `/api/subscribe` | Newsletter signup (footer form and promo popup) |
| `/api/confirm` | Confirms the double opt-in |
| `/api/unsubscribe` | One-click unsubscribe |
| `/api/profile-update` | Saves preference-survey answers |
| `/api/warranty-register` | Warranty registration |
| `/api/admin-login`, `/api/admin-data` | Admin authentication and data access |
| `/api/newsletter-send` | Sends a newsletter (admin-authenticated) |

### 9.3 Spam protection on signup

Layered, in order: honeypot field → email format → disposable-domain block-list (~150
domains) → known-spam-domain list → excessive-dots check → suspicious-pattern check →
database-backed rate limit (**3 signups per IP per hour**) → Cloudflare Turnstile.

Blocked bots receive a fake success message rather than an error, so they cannot probe
the filter. Duplicate signups never trigger a second email (prevents mail-bombing).

### 9.4 The 10%-off welcome popup

`src/components/PromoPopup.jsx`, mounted site-wide on public pages.

- **Triggers:** 12 seconds on the page, **or** 35% scroll depth — whichever comes first.
- **Collects:** name, email, phone (all required).
- **On success:** reveals the promo code with tap-to-copy; the code is also emailed.
- **Memory:** stored in the visitor's browser (`localStorage` key `og_promo_popup`).
  Dismissal suppresses it for **30 days**; a successful signup suppresses it permanently.
- **Code:** set by `PROMO_CODE` (default `SPARKLE10`). Changing it in Netlify needs no
  code change.

⚠️ **Consent note:** phone numbers collected here are marketing data. Sending **SMS**
marketing to them carries consent obligations (TCPA in the US) that email does not.
Confirm compliance before texting offers.

---

## 10. Newsletter

Seasonal newsletter on a **biweekly, draft-for-approval** model — nothing sends
automatically to customers.

1. A scheduled job builds a themed **draft** every other Monday and emails the owner.
2. Pieces are auto-suggested from the catalogue by season, one per category.
3. The owner reviews, edits and swaps pieces at `/admin/newsletter`.
4. "Send test to yourself" verifies rendering.
5. The owner clicks **Send** — it goes to **confirmed** subscribers only.

**Themes:** new-year · valentines · late-winter · spring · mothers-day · early-summer ·
summer · late-summer · autumn · holiday · new-arrivals

Each theme carries its own accent colour and motif (evergreen for holiday, rose for
Valentine's) while prices and buttons stay brand gold. Photos use only the uniform
black-background renders, and are embedded as absolute `https://theopalgems.com/…` URLs
so they load inside email clients.

Key files: `src/lib/newsletterThemes.js` (calendar + piece selection),
`src/lib/newsletterEmail.js` (shared renderer used by both preview and sender),
`netlify/functions/newsletter-build-draft.mjs`, `netlify/functions/newsletter-send.mjs`.

---

## 11. Warranty registration & inventory sync

Staff register a customer's purchase at `/warranty/register`. On submission:

1. A row is written to `warranty_registrations` in the Opal Gems database.
2. A confirmation email goes to the customer.
3. A notification goes to `SALES_NOTIFICATION_EMAIL`.
4. **`syncCustomerToInventory`** upserts the customer (find-or-create by email) into the
   **inventory app's** Supabase `customers` table — mapping name, phone, email, address,
   marketing consent, consent timestamp and notes.

**Failure mode to know:** if `SUPABASE_SERVICE_KEY` is missing, the function enters demo
mode and **silently skips both writes** while still appearing to succeed. If
registrations stop appearing, check that variable first.

The inventory key must be the **JWT** (`eyJ…`) service-role key; the `sb_secret_…` format
is rejected.

---

## 12. Automated scheduled jobs

| Job | Schedule | What it does |
|---|---|---|
| `newsletter-build-draft` | `0 14 * * 1` — Mondays 14:00 UTC, gated to every 13+ days (effectively biweekly) | Builds a themed newsletter **draft** and emails the owner. Never sends to customers. |
| `send-scheduled-survey` | `0 */6 * * *` — every 6 hours | Sends the one-time preference survey to subscribers whose 24-hour window has elapsed. |

Both run as Netlify scheduled functions. The survey job clears `survey_scheduled_at`
after sending so each subscriber receives it exactly once.

---

## 13. Deployment & release process

### Normal release

1. Create a branch off `main`.
2. Commit changes.
3. Push to `OpalGems2026/theopalgems` and open a pull request into `main`.
4. Netlify builds a **deploy preview** and comments the link on the pull request.
5. Review the preview, then merge.
6. Merging to `main` triggers the production build and deploy.

### Build

```
npx playwright install chromium && npm run build
```

Publish directory `dist`; functions from `netlify/functions`; Node 20; esbuild bundler.
Playwright browsers are cached between builds. Configuration lives in `netlify.toml`.

### After deploying a change that includes a migration

Run the SQL file in the Supabase SQL Editor. Deploys do not run migrations.

### Rollback

Netlify → Deploys → select the last known-good deploy → **Publish deploy**. This is
instant and does not require a Git revert.

---

## 14. Local development

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

A `.env` file in the project root is **required** — the app reads `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` at import time and renders nothing without them
("supabaseUrl is required"). `.env` is git-ignored, so it does not exist in fresh clones
or Git worktrees; copy it from a known-good checkout. A dev server started before the
file exists must be restarted.

### What cannot be tested locally

`npm run dev` serves the front end only. **Netlify Functions do not run**, so newsletter
signup, confirmation email, warranty registration and admin login cannot complete
locally. Verify those on a deploy preview or production.

### Useful scripts

| Script | Purpose |
|---|---|
| `npm run build` | Full production build (sitemap + Vite + pre-render) |
| `npm run sitemap` | Regenerate `public/sitemap.xml` |
| `npm run preview` | Serve the built site locally |
| `scripts/send-campaign.mjs` | Send a campaign |
| `scripts/send-newsletter.mjs` | Send a newsletter |
| `scripts/send-profile-survey.mjs` | Send the preference survey |
| `scripts/test-warranty-sync.mjs` | Test the inventory sync |
| `scripts/compress-images.mjs` | Compress images |

---

## 15. Security posture

### What is protected

- Admin data operations run server-side behind a signed token and a table allow-list.
- The database service key is never exposed to the browser.
- Signup is defended by eight layers of spam protection.
- CORS restricts API calls to the production domain (plus localhost for development).
- Unsubscribe and confirm links use unguessable random tokens.
- Passwords are compared in constant time, with a delay on failure to slow brute force.

### What to keep watching

| Risk | Why it matters |
|---|---|
| **Public repository** | Anything committed is world-readable, permanently. Never commit `.env`, spreadsheets, or customer exports. |
| **Shared admin password** | No per-person accounts, no audit trail; removing one person's access changes it for all. |
| **`VITE_` prefix** | Any variable with this prefix is compiled into public JavaScript. |
| **Service key = full access** | It bypasses all row-level security. Netlify environment variables only. |
| **Turnstile optional** | If `TURNSTILE_SECRET_KEY` is unset, CAPTCHA verification is skipped silently. |
| **Customer data** | `subscribers` and `warranty_registrations` hold names, emails, phone numbers and addresses. CSV exports are personal data — handle accordingly. |

### Files that must never be committed

`.env` · `EMAIL_HANDOVER_CHECKLIST.md` · inventory `.xlsx` files · `Whatsapp1/` ·
`require AI update/` — all currently git-ignored. Verify with `git check-ignore -v <file>`
before adding anything sensitive.

---

## 16. Runbooks & troubleshooting

### "I subscribed but never got an email"

1. Admin → Subscribers: are they **Pending** or **Confirmed**?
2. Pending is normal — they must click the confirmation link. Ask them to check spam.
3. If the row is missing entirely, they were likely caught by a spam layer (disposable
   domain, or more than 3 signups from one IP in an hour). Check the function logs in
   Netlify.
4. If rows are missing across the board, check `RESEND_API_KEY` and `SUPABASE_SERVICE_KEY`.

### "Warranty registrations aren't arriving"

1. Check `SUPABASE_SERVICE_KEY` is set in Netlify — if not, the function is in demo mode
   and silently skips writes.
2. Confirm `WARRANTY_DEMO_MODE` is not enabled.
3. For sync failures specifically, verify `INVENTORY_SUPABASE_SERVICE_KEY` is the `eyJ…`
   JWT key, not `sb_secret_…`.
4. Read the function log in Netlify → Functions → `warranty-register`.

### "The site shows old content after a deploy"

1. Netlify → Deploys: did the build succeed?
2. Confirm the production branch is `main` and it is linked to `OpalGems2026/theopalgems`.
   ⚠️ Make sure you are looking at the site in the **`opalgems2026`** team — a stale
   same-named site exists under the personal `sturainey` team wired to the legacy repo.
   To check quickly which code is actually live, fetch the home page and look for a known
   recent string (e.g. `Your phone` in the footer signup form).
3. Content served from `sections`/`photos` comes from the database, not the build — check
   the admin panel.
4. Hard-refresh; HTML is set to `must-revalidate`, but assets are cached for a year.

### "A product image is wrong or missing"

Missing images fall back to a placeholder pendant. Check the `link` path in the relevant
`src/data/*.js` file and confirm the file exists under `public/assets/…`.

### "Admin login says 'Server not configured'"

`ADMIN_PASSWORD` or `ADMIN_JWT_SECRET` is missing in Netlify. Set it and redeploy.

### "The promo popup won't appear for testing"

It is suppressed by `localStorage`. Clear the key `og_promo_popup` in browser dev tools,
or use a private window.

### Where to find logs

Netlify → your site → **Functions** → select a function → real-time logs. Every function
logs its failures with context.

---

## 17. Open items & known issues

| # | Item | Notes |
|---|---|---|
| 1 | ✅ **Resolved — production deploys correctly** | Verified 27 Aug 2026: `theopalgems.com` is served by Netlify and carries the latest code (new phone number, name/phone signup fields, promo popup all present in the live build). The production pipeline from `OpalGems2026/theopalgems` is working. |
| 1b | ⚠️ **A stale duplicate Netlify site exists** | A second, older site also named `theopalgems` sits under the personal team **`sturainey`**, still wired to the legacy `datacendia/theopalgems` repo, last deployed 6 Aug 2026, serving `theopalgems.netlify.app` with **no custom domain**. It does not affect the live site. The local Netlify CLI is linked to **this stale site**, so `netlify deploy` / `netlify env:*` run from this folder would target the wrong project. Delete the stale site, or re-link the CLI to the `opalgems2026` team. |
| 2 | ✅ **Resolved — local `.env` corrected** | Updated 27 Aug 2026 to `avbegqyvtvdmdilgwnif`; verified the dev server now reads the production database. A timestamped backup of the previous file was kept locally (git-ignored). |
| 2b | ⚠️ **`SUPABASE_SERVICE_KEY` in local `.env` is still the old project's key** | Not needed for `npm run dev` (functions do not run locally), but `scripts/*.mjs` use it and would hit the **old** database. Replace it with the `service_role` key from the `avbegqyvtvdmdilgwnif` project. Netlify holds its own production copy, which is unaffected. |
| 3 | **Live signup not yet verified end-to-end** | Name/phone capture and the promo popup are confirmed present in the live build, but the real send path (function → database → email) still needs one live submission to verify. |
| 4 | **Shared admin password** | Consider per-user accounts for an audit trail and individual revocation. |
| 5 | **Phone/SMS consent** | Confirm TCPA compliance before any SMS marketing to collected numbers. |
| 6 | **Uncommitted `public/sitemap.xml` changes** | Regenerated timestamps repeatedly appear as local modifications; consider ignoring or committing deliberately. |
| 7 | **Legacy branch** | `migration/fresh-account-bootstrap` still exists on the current repo with unmerged commits. |
| 8 | **Product data is code, not CMS** | Stock changes require a developer and a deploy. A future admin screen for catalogue data would remove that dependency. |

---

## 18. Maintenance calendar

| Frequency | Task |
|---|---|
| Every other Monday | Review the newsletter draft; edit and send |
| Weekly | Check Admin → Subscribers for growth and pending/confirmed ratio |
| Monthly | Export subscribers to CSV as a backup; review warranty registrations |
| Quarterly | Refresh boutique stock data; review and rotate credentials; confirm Resend domain records still verify |
| Annually | Renew the domain; review billing on Netlify, Supabase and Resend |
| After any exposure | Rotate the affected secret immediately (see [§3.3](#33-credential-rotation)) |

---

## Appendix — quick reference

| Thing | Value |
|---|---|
| Live site | https://theopalgems.com |
| Admin panel | https://theopalgems.com/admin |
| Source repo | https://github.com/OpalGems2026/theopalgems |
| Netlify | https://app.netlify.com/teams/opalgems2026/projects |
| Supabase | https://supabase.com/dashboard/project/avbegqyvtvdmdilgwnif |
| Resend | https://resend.com/domains/c7e4f730-054f-45dc-b5b1-54666ec28e7c |
| Production branch | `main` |
| Build command | `npx playwright install chromium && npm run build` |
| Publish directory | `dist` |
| Node version | 20 |
| Main phone | (920) 920-1145 |
| WhatsApp | +1 561-251-9560 |
| Sending address | `hello@theopalgems.com` |
| Promo code | `SPARKLE10` (via `PROMO_CODE`) |
</content>
