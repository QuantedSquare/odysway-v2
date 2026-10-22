-- Où une option a été posée.
--
-- Question de Linda (19/10/2026) : faut-il garder la pose d'option en fin de
-- tunnel ? Le funnel la propose à deux endroits :
--   - étape « Coordonnées » (Details.vue) : le deal naît directement dans
--     « A posé une option », avant les voyageurs ;
--   - étape « Paiement » (PaymentRedirect.vue) : voyageurs, options et
--     assurance déjà remplis.
-- Rien ne les distinguait en base. Estimation du 19/10/2026 par le champ
-- « couple » (écrit seulement à l'étape voyageurs) : depuis mai, ~40 options
-- par mois en début de tunnel, 2 à 4 en fin de tunnel.
--
-- Écrite par POST /api/v1/booking/booked_date/option :
--   'debut_funnel' | 'fin_funnel' (envoyé par le funnel), 'back_office' (option
--   posée par l'équipe, Ulysse ou /booking-management). Null : option posée avant
--   cette migration, ou pas d'option.
-- La valeur reste après le paiement ou l'expiration : on peut suivre ce que
-- deviennent les options de chaque origine (jointure deal_id → activecampaign_deals).
--
-- ORDRE : jouer d'abord supabase/dashboard/08_deal_historique.sql sur le projet
-- DASHBOARD (booked_dates y est répliquée). Le code tolère l'absence de la
-- colonne (écriture séparée, erreur seulement loguée).
--
-- Additive, idempotente.

alter table public.booked_dates
  add column if not exists option_origine text;

alter table public.booked_dates
  drop constraint if exists booked_dates_option_origine_chk;
alter table public.booked_dates
  add constraint booked_dates_option_origine_chk
  check (option_origine is null or option_origine in ('debut_funnel', 'fin_funnel', 'back_office'));

comment on column public.booked_dates.option_origine is
  'Où l''option a été posée : debut_funnel (étape Coordonnées), fin_funnel (étape Paiement), back_office. Null avant le 19/10/2026.';
