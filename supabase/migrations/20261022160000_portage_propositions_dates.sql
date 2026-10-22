-- Espace porteur : dates proposées par un porteur pour son séjour en portage.
--
-- Le porteur propose (départ, retour, participants, prix souhaité) depuis
-- /espace-porteur ; Odysway accepte ou refuse dans Ulysse (page Portage), qui
-- crée alors la date (`travel_dates`) par le pont et la rattache ici. La date
-- elle-même reste à Odysway : prix, capacité, publication.
--
-- `statut` : `proposee` (en attente), `acceptee` (date créée, `travel_date_id`),
-- `refusee` (`reponse` dit pourquoi), `retiree` (par le porteur, avant décision).
-- Prix en centimes d'euro.
--
-- RLS sans policy : seul le serveur (service_role) y accède ; Ulysse la lit
-- avec sa clé de service. Additive, rejouable.

create table if not exists public.portage_propositions_dates (
  id                  uuid primary key default gen_random_uuid(),
  page_id             uuid not null references public.portage_pages (id) on delete cascade,
  porteur_id          uuid not null references public.portage_porteurs (porteur_id) on delete restrict,
  depart              date not null,
  retour              date not null,
  participants_min    integer,
  participants_max    integer,
  prix_souhaite       integer,
  note                text,
  statut              text not null default 'proposee',
  reponse             text,
  travel_date_id      uuid,
  traite_par          text,
  traite_le           timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint portage_propositions_dates_statut_valide check (statut in ('proposee', 'acceptee', 'refusee', 'retiree')),
  constraint portage_propositions_dates_ordre check (retour >= depart),
  constraint portage_propositions_dates_participants check (
    participants_min is null or participants_max is null or participants_min <= participants_max
  )
);

create index if not exists portage_propositions_dates_page_idx on public.portage_propositions_dates (page_id);
create index if not exists portage_propositions_dates_statut_idx on public.portage_propositions_dates (statut);

alter table public.portage_propositions_dates enable row level security;
