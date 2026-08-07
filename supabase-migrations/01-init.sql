-- Migration 01: base schema — MUST run before 02-05.
--
-- Reconstructed 2026-08-06. This file did not previously exist: migrations
-- 02 and 03 both `alter table public.subscribers`, but nothing in the repo
-- ever created it. The DDL lived only in prose inside the setup docs, so a
-- blank Supabase project could not be bootstrapped from the repo alone.
--
-- Sources consolidated here:
--   * SUBSCRIBE_SETUP.md           — subscribers base table
--   * SUBSCRIBER_PROFILE_SETUP.md  — subscriber profile fields, newsletter tables
--   * ADMIN_SETUP.md               — content tables, GALLERY storage bucket
--
-- RLS is enabled on the public tables here but NO table policies are created:
-- with RLS on and no policy, anon is denied everything while the service key
-- still bypasses. That is a safe intermediate state. Migration 06 installs the
-- real table policies. Storage bucket policies ARE set here (see bottom).
-- Run 01 -> 02 -> 03 -> 04 -> 05 -> 06 in order. Idempotent; safe to re-run.

-- gen_random_uuid() lives in pgcrypto. Supabase enables it by default; this
-- is belt-and-braces for a fresh project.
create extension if not exists pgcrypto;

-- ───────────────────────────────────────────────────────────────────────────
-- CONTENT TABLES (public site + admin panel)
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.watches (
  id          text primary key,
  brand       text not null,
  name        text not null,
  price       decimal,
  description text,
  image       text,
  url         text
);

create table if not exists public.products (
  id        text primary key,
  name      text not null,
  image     text not null,
  sku       text,
  location  text,
  price     text,
  price_num decimal,
  ctw       text,
  gold      text,
  diamond   text,
  cert      text,
  qty       integer,
  category  text
);

create table if not exists public.locations (
  key              text primary key,
  name             text not null,
  city             text not null,
  address          text,
  description      text,
  long_description text,
  hours            text,
  phone            text,
  hotel_image      text,
  map_url          text,
  map_embed        text,
  status           text default 'active'
);

create table if not exists public.sections (
  key   text primary key,
  value jsonb not null
);

create table if not exists public.photos (
  id      text primary key,
  src     text not null,
  alt     text not null,
  section text not null
);

-- ───────────────────────────────────────────────────────────────────────────
-- SUBSCRIBERS
-- Base columns from SUBSCRIBE_SETUP.md; profile columns from
-- SUBSCRIBER_PROFILE_SETUP.md folded in so migration 03's partial index
-- (which filters on survey_completed_at) has its column available.
-- Migration 02 adds unsubscribe_token + unsubscribed_at.
-- Migration 03 adds survey_scheduled_at.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  confirmed  boolean default true,
  created_at timestamptz default now(),

  -- profile survey answers
  referral_source     text,
  location_interest   text,
  purchase_intent     text,
  survey_completed_at timestamptz
);

-- Guard for the case where an older subscribers table already exists without
-- the profile columns (e.g. a project bootstrapped from SUBSCRIBE_SETUP.md only).
alter table public.subscribers
  add column if not exists referral_source     text,
  add column if not exists location_interest   text,
  add column if not exists purchase_intent     text,
  add column if not exists survey_completed_at timestamptz;

create index if not exists subscribers_survey_idx
  on public.subscribers (survey_completed_at);

-- ───────────────────────────────────────────────────────────────────────────
-- NEWSLETTER
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.newsletter_campaigns (
  id               uuid primary key default gen_random_uuid(),
  subject          text not null,
  preheader        text,
  html_body        text not null,
  status           text not null default 'draft', -- draft | scheduled | sending | sent | failed
  scheduled_for    timestamptz,
  sent_at          timestamptz,
  recipients_count int default 0,
  created_at       timestamptz default now(),
  created_by       text
);

create table if not exists public.newsletter_sends (
  id                bigserial primary key,
  campaign_id       uuid not null references public.newsletter_campaigns(id) on delete cascade,
  subscriber_email  text not null,
  sent_at           timestamptz default now(),
  resend_id         text,
  error             text
);

create index if not exists newsletter_sends_campaign_idx
  on public.newsletter_sends (campaign_id);

-- ───────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — enable only. Policies are installed by migration 06.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.watches              enable row level security;
alter table public.products             enable row level security;
alter table public.locations            enable row level security;
alter table public.sections             enable row level security;
alter table public.photos               enable row level security;
alter table public.subscribers          enable row level security;
alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_sends     enable row level security;

-- ───────────────────────────────────────────────────────────────────────────
-- STORAGE — GALLERY bucket (admin photo uploads, publicly readable)
-- The warranty-photos bucket is created by migration 05.
-- ───────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'GALLERY', 'GALLERY', true, 10485760,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Replace any existing GALLERY policies so this stays idempotent.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname in (
        'Anyone can view photos',   'Anyone can upload photos',
        'Anyone can update photos', 'Anyone can delete photos',
        'GALLERY public read',      'GALLERY service write'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- ⚠️ KNOWN EXPOSURE — deliberately carried over from the original project.
--
-- The four policies below are permissive: ANY anonymous visitor can upload,
-- overwrite and delete objects in the GALLERY bucket, not just an admin.
-- ADMIN_RLS_LOCKDOWN.md flagged this and recommended restricting INSERT/
-- UPDATE/DELETE to service-role; that was never done on the original project.
--
-- They are reproduced here because the admin UI uploads directly from the
-- browser with the anon key -- src/admin/api.js:449 (upload) and :518 (remove),
-- used by AdminPhotos, AdminProducts, AdminWatches and AdminLocations.
-- Removing these policies breaks admin photo upload/delete until those calls
-- are routed through a Netlify Function using the service key.
--
-- To close the hole later: write that function, repoint uploadPhoto/deletePhoto
-- at it, then drop the three write policies below, keeping only public read.

create policy "Anyone can view photos"
  on storage.objects for select using (bucket_id = 'GALLERY');

create policy "Anyone can upload photos"
  on storage.objects for insert with check (bucket_id = 'GALLERY');

create policy "Anyone can update photos"
  on storage.objects for update using (bucket_id = 'GALLERY');

create policy "Anyone can delete photos"
  on storage.objects for delete using (bucket_id = 'GALLERY');
