-- Demandes reçues par le formulaire de la page /partenariat.
--
-- Le contact est créé chez AC (tag `partenaire-inbound`) puis recopié dans
-- `activecampaign_clients` ; `activecampaign_clients` n'a aucune colonne pour
-- le projet décrit, d'où cette table. Une ligne par envoi : un même contact
-- peut soumettre plusieurs projets.
--
-- Écrite uniquement côté serveur (service_role) par
-- POST /api/v1/partenariat/demande. RLS activée sans policy : aucun accès anonyme.
-- Additive, idempotente.

create table if not exists public.partnership_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  ac_contact bigint,
  concept text not null,
  destination text,
  communaute text,
  participants text,
  besoin text,
  source_url text,
  utm text,
  status text not null default 'nouveau'
);

create index if not exists partnership_requests_ac_contact_idx on public.partnership_requests (ac_contact);
create index if not exists partnership_requests_created_at_idx on public.partnership_requests (created_at desc);

alter table public.partnership_requests enable row level security;
