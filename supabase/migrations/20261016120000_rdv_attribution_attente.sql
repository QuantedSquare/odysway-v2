-- Attribution des rendez-vous Cal.com : d'où vient un prospect qui prend RDV.
--
-- Un RDV pris sur odysway.com ne passe pas par notre serveur : l'intégration
-- Cal.com → ActiveCampaign crée le deal directement dans AC (stage « RDV
-- Calendly Pris »). Le deal naît donc sans ligne `deal_attribution` : 42 deals
-- RDV sur 191 créés entre le 23/09 et le 16/10/2026, aucun canal connu.
--
-- Le navigateur, lui, voit la réservation (`bookingSuccessful` de l'embed) et
-- porte les cookies d'attribution. POST /api/v1/tracking/rdv calcule la ligne
-- d'attribution à ce moment-là et la range ici, en attente du deal. Elle est
-- rattachée (server/utils/attributionRdv.js) :
--   - tout de suite, si le deal est déjà dans le miroir AC ;
--   - sinon au webhook dealUpdate qui recopie le deal.
-- Rattacher = insérer la ligne dans `deal_attribution` avec le formulaire
-- « RDV », sans écraser une attribution existante (première écriture gagnante).
--
-- Données personnelles (email, IP et navigateur dans `ligne`) : écrite par le
-- serveur seulement, jamais répliquée vers le projet dashboard. Les captures
-- jamais rattachées sont effacées au bout de 30 jours.
--
-- Additive, idempotente.

create table if not exists public.rdv_attribution_attente (
  id           bigserial primary key,
  -- Email du participant, en minuscules : la clé de rapprochement avec le contact AC.
  email        text not null,
  -- uid de la réservation Cal.com : une capture par réservation.
  booking_uid  text unique,
  -- Ligne `deal_attribution` calculée à la capture, sans `deal_id`.
  ligne        jsonb not null,
  capture_le   timestamptz not null default now(),
  deal_id      bigint,
  rattache_le  timestamptz,
  -- 'attribue' : ligne écrite ; 'deja_attribue' : le deal avait déjà la sienne.
  resultat     text
);

create index if not exists rdv_attribution_attente_email_idx
  on public.rdv_attribution_attente (email, capture_le)
  where rattache_le is null;

-- Écrite par le serveur (service_role) uniquement.
alter table public.rdv_attribution_attente enable row level security;
