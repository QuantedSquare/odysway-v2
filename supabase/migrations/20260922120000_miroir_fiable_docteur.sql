-- Miroir fiable pour le Docteur d'Ulysse (chantier 09) : un miroir des deals AC
-- sur lequel on peut raisonner, et la mémoire des incidents du checkout.
--
-- Contexte : Ulysse ajoute une page « Docteur » qui établit la santé de chaque
-- deal (argent, marge, réservation, checkout…) et propose des corrections. Elle
-- lit `activecampaign_deals`, qui doit donc dire la vérité :
--   1. l'assurance est rangée dans des colonnes inversées par rapport à leur nom ;
--   2. plusieurs champs utiles à la préparation du voyage n'étaient pas recopiés ;
--   3. les erreurs du checkout ne partaient que sur Slack.
-- Le code (server/utils/dealMirror.js) écrit aussi `null` au lieu de 0 ou d'une
-- valeur inventée quand un champ est absent d'AC ; cela ne demande aucun DDL.
--
-- ASSURANCE — décision d'Alex (22/09/2026) : deux colonnes au nom sans ambiguïté,
-- et la marge compte la commission × voyageurs. Constat au moment d'écrire :
--   `insurance_commission`         contient le PRIX par voyageur (champ AC 13) ;
--   `insurance_price_per_traveler` contient la COMMISSION par voyageur (champ 47).
-- margins.js ajoutait `insurance_commission` à la marge : le prix d'un seul
-- voyageur au lieu de la commission du dossier. Sur les deals voyageurs partant
-- pendant l'exercice 2026-2027 : 17 582 € comptés au lieu de 6 590 € (22/09/2026). Les deux anciennes colonnes
-- restent, inchangées, pour les tableaux de bord analytiques qui les lisent ;
-- elles seront retirées ensuite.
--
-- PUREMENT ADDITIVE hors la reprise des deux colonnes d'assurance. Idempotente.
--
-- ORDRE DE DÉPLOIEMENT (la réplication vers le projet dashboard upserte la ligne
-- entière : une colonne inconnue là-bas fait échouer chaque mise à jour) :
--   1. projet DASHBOARD : jouer supabase/dashboard/06_colonnes_docteur.sql ;
--   2. projet DASHBOARD : déployer la fonction mirror-sync de cette branche ;
--   3. projet PROD : jouer cette migration ;
--   4. déployer odysway-v2 ;
--   5. resynchroniser les deals vivants : POST /api/v1/ac/mirror/resync (par pages).

-- =========================================================================
-- 1. activecampaign_deals : colonnes ajoutées
-- =========================================================================
alter table public.activecampaign_deals
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

comment on column public.activecampaign_deals.insurance_price_per_pax is
  'Prix de l''assurance par voyageur, en euros (champ AC 13 « Prix Assurance par pax »). Null : non renseigné.';
comment on column public.activecampaign_deals.insurance_commission_per_pax is
  'Commission d''assurance par voyageur, en euros (champ AC 47, 30 % du prix). La marge compte cette valeur × nb_traveler.';
comment on column public.activecampaign_deals.insurance_commission is
  'OBSOLÈTE — malgré son nom, contient le PRIX de l''assurance par voyageur (champ AC 13), 0 si absent. Lire insurance_price_per_pax.';
comment on column public.activecampaign_deals.insurance_price_per_traveler is
  'OBSOLÈTE — malgré son nom, contient la COMMISSION d''assurance par voyageur (champ AC 47), 0 si absent. Lire insurance_commission_per_pax.';
comment on column public.activecampaign_deals.forced_indiv_room is
  'Chambre individuelle imposée (champ AC 81).';
comment on column public.activecampaign_deals.named_travelers is
  'Nombre de champs « Voyageur 1 » à « Voyageur 15 » renseignés dans AC.';
comment on column public.activecampaign_deals.travelers_with_birthdate is
  'Parmi eux, ceux qui portent une date de naissance JJ/MM/AAAA.';
comment on column public.activecampaign_deals.passport_received is 'Passeport reçu (champ AC 110).';
comment on column public.activecampaign_deals.flight_plan_received is 'Plan de vol reçu (champ AC 109).';
comment on column public.activecampaign_deals.diet_received is 'Régime alimentaire reçu (champ AC 111).';
comment on column public.activecampaign_deals.travel_book is 'Carnet de voyage (champ AC 25, texte libre).';
comment on column public.activecampaign_deals.cancellation_fee is
  'Frais d''annulation retenus, en euros (champ AC 114). AC n''a pas de champ « montant remboursé ».';

-- =========================================================================
-- 2. Reprise de l'assurance, dans le bon sens
-- =========================================================================
-- Les anciennes colonnes valent 0 quand le champ AC est absent : on ne reprend
-- que les valeurs réellement saisies, les autres restent `null` (non renseigné).
-- La resynchronisation (étape 5) réécrit ensuite les deals vivants depuis AC.
-- Chaque ligne modifiée part vers le projet dashboard : d'où l'ordre ci-dessus.
update public.activecampaign_deals
   set insurance_price_per_pax      = nullif(insurance_commission, 0),
       insurance_commission_per_pax = nullif(insurance_price_per_traveler, 0)
 where insurance_price_per_pax is null
   and insurance_commission_per_pax is null
   and (coalesce(insurance_commission, 0) <> 0 or coalesce(insurance_price_per_traveler, 0) <> 0);

-- =========================================================================
-- 3. funnel_errors : la mémoire des incidents du checkout
-- =========================================================================
-- Écrite par server/utils/funnelReporter.js (transport Supabase), à côté de
-- Slack. Lue par Ulysse pour la règle CHK-05 « incidents récents du checkout ».
-- Aucun email : seulement de quoi relier l'incident à un deal et le comprendre.
create table if not exists public.funnel_errors (
  id           bigint generated always as identity primary key,
  occurred_at  timestamptz not null default now(),
  received_at  timestamptz not null default now(),
  code         text not null,
  step         text,
  severity     text,
  source       text,
  message      text,
  deal_id      bigint,
  booked_id    text,
  voyage_slug  text,
  url          text,
  origin       jsonb,
  raw          jsonb
);

comment on table public.funnel_errors is
  'Incidents du checkout (erreurs rapportées par le tunnel et par les endpoints). Écrite par funnelReporter.js, lue par le Docteur d''Ulysse.';

create index if not exists funnel_errors_deal_idx on public.funnel_errors (deal_id, occurred_at desc);
create index if not exists funnel_errors_occurred_idx on public.funnel_errors (occurred_at desc);

-- Accès serveur uniquement (clé service_role d'odysway-v2 et d'Ulysse) : RLS
-- activée sans aucune policy, donc fermée aux rôles anon et authenticated.
alter table public.funnel_errors enable row level security;
