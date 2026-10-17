-- ============================================================================
-- 06 — Colonnes manquantes du miroir analytique
-- Run on: DASHBOARD project, AVANT la migration prod
--         supabase/migrations/20260922120000_miroir_fiable_docteur.sql
-- ============================================================================
--
-- mirror-sync upserte la ligne prod ENTIÈRE : une colonne prod inconnue ici fait
-- échouer la mise à jour. C'est ce qui bloque la réplication depuis le 05/06/2026 :
--   - activecampaign_deals.extra_margin_per_traveler (prod, migration margins_v2) ;
--   - travel_dates.margin_override_per_traveler et real_traveler_count_override.
-- Constat du 22/09/2026 : dernière ligne de deals répliquée le 04/06/2026 ; en
-- 24 h, 288 échecs sur les deals et 28 sur les dates dans les logs de mirror-sync.
--
-- Ce fichier rattrape ces oublis et ajoute les colonnes du Docteur. Idempotent.
-- Après la migration prod, rejouer l'historique manqué (voir le bas du fichier).

alter table public.activecampaign_deals
  add column if not exists extra_margin_per_traveler    numeric,
  add column if not exists insurance_price_per_pax      numeric,
  add column if not exists insurance_commission_per_pax numeric,
  add column if not exists forced_indiv_room            boolean,
  add column if not exists named_travelers              smallint,
  add column if not exists travelers_with_birthdate     smallint,
  add column if not exists passport_received            boolean,
  add column if not exists flight_plan_received         boolean,
  add column if not exists diet_received                boolean,
  add column if not exists travel_book                  text,
  add column if not exists cancellation_fee             numeric;

alter table public.travel_dates
  add column if not exists margin_override_per_traveler numeric,
  add column if not exists real_traveler_count_override integer;

-- ----------------------------------------------------------------------------
-- Rattrapage de l'historique (à jouer sur le projet PROD, une fois 06 et la
-- nouvelle mirror-sync en place) : une mise à jour sans effet redéclenche le
-- webhook de chaque ligne, qui repart vers ce projet.
--
--   update public.activecampaign_deals set updated_at = updated_at
--    where updated_at >= '2026-06-04';
--   update public.travel_dates set updated_at = updated_at
--    where updated_at >= '2026-06-04';
--
-- Vérifier ensuite ici : select max(updated_at) from public.activecampaign_deals;
-- ----------------------------------------------------------------------------
