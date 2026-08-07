-- Migration 06: RLS policies — run LAST (after 01-05).
--
-- Lifted from ADMIN_RLS_LOCKDOWN.md, with one fix (see NOTE below).
--
-- Two patterns:
--   1. Public-readable, service-writable — content shown on the marketing site.
--      watches, products, locations, sections, photos, testimonials
--   2. Fully locked — sensitive data, reachable only via Netlify Functions.
--      subscribers, newsletter_campaigns, newsletter_sends
--
-- The service key bypasses RLS by design, so server-side code keeps working
-- under both patterns. Idempotent; safe to re-run.

-- ── PUBLIC-READABLE TABLES ──
--
-- NOTE (fix): the version in ADMIN_RLS_LOCKDOWN.md loops over a hardcoded
-- array that includes 'testimonials', and the doc itself warns the loop will
-- fail if that table is absent. It IS absent — testimonials live inside
-- sections.testimonials — so the documented SQL errors out on a fresh project
-- and leaves the remaining statements unapplied. The to_regclass guard below
-- skips any table that does not exist instead of aborting the whole block.

do $$
declare
  t text;
begin
  for t in select unnest(array['watches','products','locations','sections','photos','testimonials']) loop
    if to_regclass(format('public.%I', t)) is null then
      raise notice 'skipping %: table does not exist', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Public read"        on public.%I', t);
    execute format('drop policy if exists "Block writes"       on public.%I', t);
    -- Legacy policies from earlier setup docs, dropped if present.
    execute format('drop policy if exists "Service role only"  on public.%I', t);
    execute format('drop policy if exists "Enable all operations" on public.%I', t);

    execute format('create policy "Public read"  on public.%I for select using (true)', t);
    execute format('create policy "Block writes" on public.%I for all    using (false) with check (false)', t);
  end loop;
end$$;

-- ── LOCKED-DOWN TABLES ──
-- Nothing anon can do. Service key only.

alter table public.subscribers enable row level security;
drop policy if exists "Service role only" on public.subscribers;
drop policy if exists "Public read"       on public.subscribers;
drop policy if exists "Block writes"      on public.subscribers;
create policy "Service role only" on public.subscribers for all using (false) with check (false);

do $$
begin
  if to_regclass('public.newsletter_campaigns') is not null then
    alter table public.newsletter_campaigns enable row level security;
    drop policy if exists "Service role only" on public.newsletter_campaigns;
    create policy "Service role only" on public.newsletter_campaigns for all using (false) with check (false);
  end if;

  if to_regclass('public.newsletter_sends') is not null then
    alter table public.newsletter_sends enable row level security;
    drop policy if exists "Service role only" on public.newsletter_sends;
    create policy "Service role only" on public.newsletter_sends for all using (false) with check (false);
  end if;
end$$;

-- ── warranty_registrations ──
-- Migration 04 already installs "deny all on warranty_registrations".
-- Re-asserted here so the final state is visible in one place.

do $$
begin
  if to_regclass('public.warranty_registrations') is not null then
    alter table public.warranty_registrations enable row level security;
  end if;
end$$;

-- ───────────────────────────────────────────────────────────────────────────
-- VERIFY — every row should show rowsecurity = true
-- ───────────────────────────────────────────────────────────────────────────
--
-- select schemaname, tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename in (
--     'subscribers','watches','products','locations','sections','photos',
--     'testimonials','newsletter_campaigns','newsletter_sends',
--     'warranty_registrations'
--   );
--
-- select tablename, policyname, qual
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename;
