-- Paiements Alma qu'on ne rattachera jamais à un deal, marqués comme tels.
--
-- Premier passage de POST /api/v1/ulysse/alma/rattacher (25/09/2026) sur les
-- 64 paiements : aucun rattaché parmi les 40 plus anciens. 21 sont introuvables
-- chez Alma en production (paiements de test du bac à sable, enregistrés dans
-- la même base), 19 n'ont pas de deal dans `custom_data` (ancien format). Sans
-- marque, ils revenaient en tête de chaque appel, qui n'atteignait jamais les
-- paiements récents, et Ulysse suspendait pour toujours le rapprochement Alma.
--
-- `rattachement` : null = rattaché, ou pas encore tenté.
--   'introuvable' : 404 chez Alma en production ;
--   'sans_deal'   : paiement lu, aucun deal dans `custom_data` ni dans `booked_dates`.
--
-- `alma_ids` n'est pas répliquée vers le projet dashboard. Additive, idempotente.

alter table public.alma_ids
  add column if not exists rattachement text
  constraint alma_ids_rattachement_check check (rattachement in ('introuvable', 'sans_deal'));
