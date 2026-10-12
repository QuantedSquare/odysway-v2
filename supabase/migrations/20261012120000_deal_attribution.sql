-- Attribution des leads : d'où vient chaque prospect, figé à la création du deal.
--
-- Le site range chaque visite marquée (UTM, gclid / fbclid, référent, page
-- d'arrivée) dans deux cookies first-party posés par le serveur (ody_ft : première
-- visite, ody_lt : dernière visite non directe). Quand le prospect laisse son
-- email, POST /ac/deals et kickstart relisent ces cookies et insèrent une ligne
-- ici (server/utils/attribution.js). Une ligne par deal, jamais réécrite.
--
-- Colonnes de visite à null = aucun cookie (navigateur sans passage par
-- /tracking/touch, cookies bloqués) : « inconnu », pas « Direct ».
--
-- Jointure : deal_attribution.deal_id = activecampaign_deals.id.
-- Réplication vers le dashboard : supabase/dashboard/07_deal_attribution.sql
-- (à jouer AVANT celle-ci, puis créer le webhook mirror-deal_attribution).
-- Additive, idempotente.

create table if not exists public.deal_attribution (
  deal_id          bigint primary key,
  formulaire       text,

  first_channel    text,
  first_source     text,
  first_medium     text,
  first_campaign   text,
  first_content    text,
  first_term       text,
  first_landing    text,
  first_referrer   text,
  first_at         timestamptz,

  last_channel     text,
  last_source      text,
  last_medium      text,
  last_campaign    text,
  last_content     text,
  last_term        text,
  last_landing     text,
  last_referrer    text,
  last_at          timestamptz,

  gclid            text,
  gbraid           text,
  wbraid           text,
  fbclid           text,
  fbc              text,
  fbp              text,
  ga_client_id     text,
  variante         text,
  consent_ads      text,

  touches          jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists deal_attribution_first_channel_idx on public.deal_attribution (first_channel);
create index if not exists deal_attribution_created_at_idx on public.deal_attribution (created_at);

-- Écrite par le serveur (service_role) uniquement.
alter table public.deal_attribution enable row level security;
