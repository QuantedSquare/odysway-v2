-- Espace porteur (/espace-porteur) : un porteur (ulysse.porteurs) rédige la
-- page de son séjour en portage sans accès au Studio Sanity.
--
-- `portage_porteurs` : les porteurs invités depuis Ulysse (pont de service). Le
-- nom et l'email arrivent avec l'invitation : odysway-v2 ne lit pas le schéma
-- `ulysse`. `revoque_le` coupe l'accès même avec un lien encore valide.
--
-- `portage_pages` : un brouillon par page. Rien n'est écrit dans Sanity avant
-- la soumission (`sanity_id` = id du document publié, sans `drafts.`).
--
-- RLS sans policy : seul le serveur (service_role) y accède. Additive, rejouable.

create table if not exists public.portage_porteurs (
  porteur_id  uuid primary key,
  nom         text not null,
  email       text not null,
  invite_le   timestamptz,
  invite_par  text,
  revoque_le  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.portage_pages (
  id          uuid primary key default gen_random_uuid(),
  porteur_id  uuid not null references public.portage_porteurs (porteur_id) on delete restrict,
  statut      text not null default 'brouillon',
  payload     jsonb not null default '{}'::jsonb,
  revision    integer not null default 0,
  sanity_id   text unique,
  slug        text,
  soumis_le   timestamptz,
  publie_le   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint portage_pages_statut_valide check (statut in ('brouillon', 'soumis', 'publie'))
);

create index if not exists portage_pages_porteur_idx on public.portage_pages (porteur_id);

alter table public.portage_porteurs enable row level security;
alter table public.portage_pages enable row level security;
