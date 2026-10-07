-- ============================================================================
-- 07 — Attribution des leads (deal_attribution)
-- Run on: DASHBOARD project, AVANT la migration prod
--         supabase/migrations/20261006120000_deal_attribution.sql
-- ============================================================================
--
-- Même table qu'en prod : une ligne par deal, jointure sur
-- activecampaign_deals.id. Puis, sur le projet PROD (Database > Webhooks), créer
-- le webhook « mirror-deal_attribution » sur public.deal_attribution, même
-- configuration que les 4 autres (05_webhooks_setup.sql), et redéployer
-- mirror-sync (clé primaire deal_id ajoutée).

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
