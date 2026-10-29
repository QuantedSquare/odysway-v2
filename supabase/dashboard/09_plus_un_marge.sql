-- ============================================================================
-- 09 — « +1 qui fait baisser la marge »
-- Run on: DASHBOARD project, AVANT la migration prod
--         supabase/migrations/20261029120000_plus_un_marge.sql
-- ============================================================================
--
-- travel_dates et booked_dates sont répliquées (dashboard_pub) : une colonne
-- ajoutée en prod sans exister ici arrête la réplication. Mêmes colonnes, sans
-- contrainte (la prod les porte).
-- Idempotent.

alter table public.travel_dates
  add column if not exists plus_un_regle      text default 'libre',
  add column if not exists plus_un_supplement numeric;

alter table public.booked_dates
  add column if not exists supplement_plus_un         integer,
  add column if not exists supplement_plus_un_seuil   integer,
  add column if not exists supplement_plus_un_leve_at timestamptz;
