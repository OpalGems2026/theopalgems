-- Migration 06: capture subscriber name + phone
-- Run this in the Supabase SQL Editor after migration 05.
--
-- The newsletter signup (footer form + the new 10%-off promo popup) now
-- collects the subscriber's name and phone number in addition to their email.
-- Existing rows predate these columns and will simply have NULL name/phone.

alter table public.subscribers
  add column if not exists name text;

alter table public.subscribers
  add column if not exists phone text;
