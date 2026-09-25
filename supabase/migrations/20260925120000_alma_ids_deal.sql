-- Paiements Alma rattachés à leur deal, pour le Docteur d'Ulysse (chantier 09).
--
-- `alma_ids` ne gardait que l'identifiant du paiement : impossible de dire,
-- pour un deal, ce qu'Alma a encaissé. La note AC du paiement ne porte pas
-- l'identifiant Alma, et `booked_dates.transaction_id` est écrasé par chaque
-- paiement suivant. Le webhook Alma renseigne désormais `deal_id` ; les
-- paiements antérieurs se rattachent par POST /api/v1/ulysse/alma/rattacher,
-- qui relit chacun chez Alma (64 au 25/09/2026).
--
-- `alma_ids` n'est pas répliquée vers le projet dashboard (mirror-sync) : aucune
-- étape de déploiement préalable. Additive, idempotente.

alter table public.alma_ids add column if not exists deal_id bigint;

create index if not exists alma_ids_deal_id_idx on public.alma_ids (deal_id);
