-- ============================================================================
-- 08 — Historique des deals et origine des options
-- Run on: DASHBOARD project, AVANT les migrations prod
--         supabase/migrations/20261019120000_booked_dates_option_origine.sql
--         supabase/migrations/20261019130000_deal_historique.sql
-- ============================================================================
--
-- Même tables qu'en prod, sans trigger ni contrainte (la prod les porte). Puis :
--   1. redéployer mirror-sync (clé primaire id ajoutée pour deal_historique) ;
--   2. jouer les deux migrations sur PROD ;
--   3. sur PROD (Database > Webhooks), créer le webhook « mirror-deal_historique »
--      sur public.deal_historique, même configuration que les autres
--      (05_webhooks_setup.sql). La table n'est qu'ajoutée : Insert suffit.
--
-- Pas de données personnelles dans deal_historique (identifiants et étapes).
-- Idempotent.

alter table public.booked_dates
  add column if not exists option_origine text;

create table if not exists public.deal_historique (
  id              bigint primary key,
  deal_id         bigint not null,
  contact         bigint,
  survenu_le      timestamptz not null,
  ac_mdate        timestamptz,
  evenement       text not null,
  changements     text[] not null default '{}',
  pipeline_id     smallint,
  pipeline_title  text,
  stage_id        text,
  stage           text,
  status          text,
  current_step    text,
  owner_id        text,
  seller          text,
  total_paid      numeric,
  deleted         boolean,
  avant           jsonb
);

create index if not exists deal_historique_deal_idx on public.deal_historique (deal_id, survenu_le);
create index if not exists deal_historique_current_step_idx on public.deal_historique (current_step, survenu_le);
