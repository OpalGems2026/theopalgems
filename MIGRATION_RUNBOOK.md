# Account Migration Runbook

One-time move of the whole stack onto fresh accounts, 2026-08-06.

| | From (original) | To (new) |
|---|---|---|
| GitHub | `datacendia/theopalgems` | `OpalGems2026/theopalgems` |
| Supabase | org `opalgems` / `theopalgems`<br>ref `yxhnzpcpzotqeskxhsmh` | org `OpalGems2026's Org`<br>ref `avbegqyvtvdmdilgwnif` |
| Resend | (original account) | `theopalgems26` |
| Netlify | (original team) | `OpalGems2026` |

**Order matters.** Supabase must be live before Netlify deploys, or the
functions boot without a database.

Local tooling confirmed present: `supabase` 2.90.0, `pg_dump`/`psql`/`pg_restore`
18.0 at `C:\Program Files\PostgreSQL\18\bin` (not on PATH — use full paths),
`node` 24.11.0, `npm` 11.6.1. Netlify CLI is absent; use `npx netlify-cli`.

> **Credentials:** every command below takes a connection string containing your
> database password. Set them as environment variables in your own shell. Do not
> paste them into chat, commit them, or put them in this file.

---

## Phase 1 — GitHub

The mirror clone already exists with all 47 commits, both branches and the PR
refs. Migrations `01` and `06` are committed on `migration/fresh-account-bootstrap`.

```bash
gh auth login
```

Choose GitHub.com → HTTPS → authenticate as **OpalGems2026**. Then:

```bash
gh auth switch --user OpalGems2026
```

Create the repo and push everything, history intact:

```bash
gh repo create OpalGems2026/theopalgems --private
```

```bash
git --git-dir="C:/Users/Stu/AppData/Local/Temp/claude/C--Users-Stu-Downloads-theopalgems-main/74f16099-4f7e-443c-bb25-62e2073ca55d/scratchpad/theopalgems.git" push --mirror https://github.com/OpalGems2026/theopalgems.git
```

`--mirror` pushes every ref including `refs/pull/*`. If GitHub rejects the pull
refs (it can), push the branches only:

```bash
git --git-dir="C:/Users/Stu/AppData/Local/Temp/claude/C--Users-Stu-Downloads-theopalgems-main/74f16099-4f7e-443c-bb25-62e2073ca55d/scratchpad/theopalgems.git" push https://github.com/OpalGems2026/theopalgems.git "refs/heads/*:refs/heads/*"
```

Then push the migration branch from the working clone:

```bash
git -C "C:/Users/Stu/AppData/Local/Temp/claude/C--Users-Stu-Downloads-theopalgems-main/74f16099-4f7e-443c-bb25-62e2073ca55d/scratchpad/theopalgems" push -u origin migration/fresh-account-bootstrap
```

---

## Phase 2 — Supabase schema + data

Get both connection strings from **Project Settings → Database → Connection
string → URI** on each project. If direct connection fails (it is IPv6-only on
some projects), use the **Session pooler** string instead.

```bash
export OLD_DB_URL='postgresql://postgres:PASSWORD@db.yxhnzpcpzotqeskxhsmh.supabase.co:5432/postgres'
export NEW_DB_URL='postgresql://postgres:PASSWORD@db.avbegqyvtvdmdilgwnif.supabase.co:5432/postgres'
```

### Why dump the live schema instead of running migrations 01–06

The original project was **built by hand**, not by migrations — its Migrations
page reads "Run your first migration." So the live schema is the only accurate
record of what actually exists; the setup docs may have drifted from it. Dump
reality, not documentation.

Migrations `01`–`06` still matter: they are what lets a *future* environment be
built from the repo alone. That was impossible before — see the note at the top
of `supabase-migrations/01-init.sql`.

### Dump

```bash
supabase db dump --db-url "$OLD_DB_URL" -f schema.sql
```

```bash
supabase db dump --db-url "$OLD_DB_URL" -f data.sql --use-copy --data-only
```

Confirm `unsubscribe_token` survived into the dump before you go further — if
this comes back empty, stop and investigate:

```bash
grep -c "unsubscribe_token" schema.sql
```

### Restore

`session_replication_role = replica` disables FK checks during the load, so
table ordering in the dump cannot cause failures.

```bash
"C:/Program Files/PostgreSQL/18/bin/psql.exe" --single-transaction --variable ON_ERROR_STOP=1 --file schema.sql --command "SET session_replication_role = replica" --file data.sql --dbname "$NEW_DB_URL"
```

### Verify row counts match

Run on **both** projects and compare:

```sql
select 'subscribers' t, count(*) from public.subscribers
union all select 'warranty_registrations', count(*) from public.warranty_registrations
union all select 'products',  count(*) from public.products
union all select 'watches',   count(*) from public.watches
union all select 'locations', count(*) from public.locations
union all select 'photos',    count(*) from public.photos
union all select 'sections',  count(*) from public.sections
order by 1;
```

Then confirm the unsubscribe tokens are genuinely identical, not regenerated:

```sql
select count(*) total, count(distinct unsubscribe_token) distinct_tokens
from public.subscribers;
```

Spot-check one token against the same row on the old project. If they differ,
the links already in customers' inboxes are dead.

---

## Phase 3 — Storage buckets

**No `pg_dump` includes storage objects.** The bytes live outside Postgres and
must be copied separately. Both buckets need moving: `GALLERY` and
`warranty-photos`.

Pull from the old project:

```bash
supabase link --project-ref yxhnzpcpzotqeskxhsmh
```

```bash
supabase storage cp -r ss:///GALLERY ./storage-backup/GALLERY -j 4
```

```bash
supabase storage cp -r ss:///warranty-photos ./storage-backup/warranty-photos -j 4
```

Push to the new project. The buckets must exist first — migration `01` creates
`GALLERY`, migration `05` creates `warranty-photos`, and the Phase 2 restore
carries both over if they existed on the source.

```bash
supabase link --project-ref avbegqyvtvdmdilgwnif
```

```bash
supabase storage cp -r ./storage-backup/GALLERY ss:///GALLERY -j 4
```

```bash
supabase storage cp -r ./storage-backup/warranty-photos ss:///warranty-photos -j 4
```

---

## Phase 4 — Rewrite stored image URLs

`getPublicUrl()` returns a **fully-qualified URL containing the project ref**
(`src/admin/api.js:456`), and those strings were saved into the database. After
migration every one of them still points at the old project. They will keep
working until you delete it — which is exactly why this is easy to miss.

Run on the **new** project:

```sql
begin;

update public.photos
   set src = replace(src, 'yxhnzpcpzotqeskxhsmh', 'avbegqyvtvdmdilgwnif')
 where src like '%yxhnzpcpzotqeskxhsmh%';

update public.products
   set image = replace(image, 'yxhnzpcpzotqeskxhsmh', 'avbegqyvtvdmdilgwnif')
 where image like '%yxhnzpcpzotqeskxhsmh%';

update public.watches
   set image = replace(image, 'yxhnzpcpzotqeskxhsmh', 'avbegqyvtvdmdilgwnif')
 where image like '%yxhnzpcpzotqeskxhsmh%';

update public.locations
   set hotel_image = replace(hotel_image, 'yxhnzpcpzotqeskxhsmh', 'avbegqyvtvdmdilgwnif')
 where hotel_image like '%yxhnzpcpzotqeskxhsmh%';

update public.warranty_registrations
   set photo_url = replace(photo_url, 'yxhnzpcpzotqeskxhsmh', 'avbegqyvtvdmdilgwnif')
 where photo_url like '%yxhnzpcpzotqeskxhsmh%';

-- sections.value is jsonb and can embed URLs anywhere in the document.
update public.sections
   set value = replace(value::text, 'yxhnzpcpzotqeskxhsmh', 'avbegqyvtvdmdilgwnif')::jsonb
 where value::text like '%yxhnzpcpzotqeskxhsmh%';

commit;
```

Confirm nothing was missed:

```sql
select 'photos' t, count(*) from public.photos where src like '%yxhnzpcpzotqeskxhsmh%'
union all select 'products', count(*) from public.products where image like '%yxhnzpcpzotqeskxhsmh%'
union all select 'watches', count(*) from public.watches where image like '%yxhnzpcpzotqeskxhsmh%'
union all select 'locations', count(*) from public.locations where hotel_image like '%yxhnzpcpzotqeskxhsmh%'
union all select 'warranty', count(*) from public.warranty_registrations where photo_url like '%yxhnzpcpzotqeskxhsmh%'
union all select 'sections', count(*) from public.sections where value::text like '%yxhnzpcpzotqeskxhsmh%';
```

Every count must be `0`.

---

## Phase 5 — Resend

On the new `theopalgems26` account:

1. **API keys → Create API Key** → this becomes `RESEND_API_KEY`.
2. **Domains → Add Domain** → `theopalgems.com`, then add the DKIM/SPF records
   at your registrar. **Domain verification does not transfer between Resend
   accounts** — it must be redone even though the domain is unchanged.
3. Until verification completes, sends fall back to `onboarding@resend.dev`.
   Keep `RESEND_FROM_EMAIL` unset until the domain is green, or mail will bounce.

---

## Phase 6 — Netlify

The new team currently shows *"No repositories found"* because the Netlify
GitHub App is not installed on `OpalGems2026`.

1. **Configure Netlify on GitHub** → install the app on `OpalGems2026` → grant
   access to `theopalgems`.
2. Create the site from that repo. Build settings come from `netlify.toml`
   (publish `dist`, `npx playwright install chromium && npm run build`,
   functions in `netlify/functions`) — no manual entry needed.
3. Set all **18** environment variables. None are in the repo, so all are typed
   by hand.

| Variable | Notes |
|---|---|
| `VITE_SUPABASE_URL` | `https://avbegqyvtvdmdilgwnif.supabase.co` — public, baked into the JS bundle |
| `VITE_SUPABASE_ANON_KEY` | public |
| `VITE_TURNSTILE_SITE_KEY` | public |
| `SUPABASE_URL` | same URL, server-side |
| `SUPABASE_SERVICE_KEY` | **secret** — bypasses RLS, never expose to the browser |
| `RESEND_API_KEY` | **secret** — from Phase 5 |
| `RESEND_FROM_EMAIL` | leave unset until the domain verifies |
| `SITE_URL` | used to build confirm/unsubscribe links |
| `ALLOWED_ORIGIN` | defaults to `https://theopalgems.com` |
| `ADMIN_JWT_SECRET` | **secret** |
| `ADMIN_PASSWORD` | **secret** |
| `ADMIN_NOTIFICATION_EMAIL` | |
| `SALES_NOTIFICATION_EMAIL` | |
| `TURNSTILE_SECRET_KEY` | **secret** |
| `WARRANTY_DEMO_MODE` | |
| `INVENTORY_SUPABASE_URL` | separate inventory project — unchanged by this move |
| `INVENTORY_SUPABASE_SERVICE_KEY` | **secret** — master key to Andrew's database |
| `INVENTORY_CUSTOMERS_TABLE` | `customers` |

`INVENTORY_*` points at a **different** Supabase project that is not part of
this migration. Carry the existing values across unchanged.

---

## Phase 7 — Verify

- [ ] Public site renders products, watches, locations and photos
- [ ] No broken images (confirms Phases 3 and 4)
- [ ] Subscribe form writes a row and sends a welcome email
- [ ] **An unsubscribe link from an OLD email still works** — the single best
      proof the migration preserved `unsubscribe_token`
- [ ] Warranty registration writes a row and uploads a photo
- [ ] Admin login works; photo upload and delete both succeed
- [ ] Netlify function logs clean on a fresh deploy

---

## Known issue carried over deliberately

The `GALLERY` bucket has fully permissive storage policies: any anonymous
visitor can upload, overwrite or delete objects. This was the behaviour on the
original project and was reproduced to avoid breaking admin photo upload, which
runs browser-side with the anon key (`src/admin/api.js:449` and `:518`).

`ADMIN_RLS_LOCKDOWN.md` flagged this and it was never closed. To fix: move
`uploadPhoto`/`deletePhoto` into a Netlify Function using the service key, then
drop the three write policies at the bottom of `supabase-migrations/01-init.sql`,
keeping only public read.
