-- Espace Voyageur (/mon-espace) : rattachement des comptes clients à leurs dossiers.
--
-- Aucune migration de comptes. Un client se connecte avec Supabase Auth (code à
-- 6 chiffres ou Google) ; à la connexion, son email retrouve ses contacts AC et
-- les liens sont créés. Rien n'existe tant que personne ne se connecte.
--
-- Trois tables, PUREMENT ADDITIVES : aucune table existante n'est modifiée.
--
-- Sécurité : RLS activée SANS AUCUNE policy, et droits retirés à anon et
-- authenticated. Un client possède un JWT `authenticated` valable sur ce projet
-- (le même qu'Ulysse) : il ne doit rien pouvoir lire par PostgREST. Tout passe
-- par Nitro (service_role), qui filtre sur les liens du compte.
--
-- mirror-sync : ces tables n'ont pas de webhook de base, le miroir analytique
-- ne les voit pas. Ne pas leur en ajouter sans créer d'abord les tables côté
-- dashboard (voir supabase/dashboard/01_target_tables.sql).

-- =========================================================================
-- 1. Compte ↔ contact AC (N-N)
-- =========================================================================
-- L'email n'amorce que le premier lien. Ensuite `ac_contact` fait foi : si un
-- commercial corrige l'email dans AC, le client garde ses dossiers. N-N parce
-- que 28 emails sont partagés par plusieurs contacts, et parce que le
-- rattachement ajoute des dossiers réservés sous une autre adresse.
-- Pas de FK vers activecampaign_clients : le miroir peut supprimer et recréer
-- ses lignes, un lien ne doit pas disparaître avec elles.
CREATE TABLE IF NOT EXISTS public.client_account_links (
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  ac_contact   bigint      NOT NULL,
  linked_via   text        NOT NULL CHECK (linked_via IN ('email', 'rattachement')),
  linked_email text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, ac_contact)
);
CREATE INDEX IF NOT EXISTS client_account_links_contact_idx ON public.client_account_links (ac_contact);

-- =========================================================================
-- 2. Voyageurs d'un deal (champs AC « Voyageur 1 » à « Voyageur 15 »)
-- =========================================================================
-- AC reste la source de vérité du nom et de la date de naissance (Chapka les y
-- lit). Cette table en est la copie lisible, plus ce qu'AC ne porte pas :
-- l'email d'invitation, le compte qui a rejoint, le consentement à apparaître
-- dans la liste du groupe.
--
-- Un voyageur retiré dans AC n'est pas supprimé : `removed_at`. Sa ligne peut
-- porter un compte et un consentement qu'on ne veut pas perdre si le
-- commercial le remet.
CREATE TABLE IF NOT EXISTS public.deal_travelers (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id        bigint      NOT NULL,
  slot           smallint    NOT NULL CHECK (slot BETWEEN 1 AND 15),
  raw            text,
  firstname      text,
  lastname       text,
  birthdate      date,
  iso            text,
  is_holder      boolean     NOT NULL DEFAULT false,
  email          text,
  user_id        uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  invited_at     timestamptz,
  invited_by     uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  joined_at      timestamptz,
  visible_groupe boolean     NOT NULL DEFAULT false,
  removed_at     timestamptz,
  synced_at      timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deal_id, slot),
  CHECK (email IS NULL OR email = lower(btrim(email)))
);
CREATE INDEX IF NOT EXISTS deal_travelers_user_idx  ON public.deal_travelers (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS deal_travelers_email_idx ON public.deal_travelers (email)   WHERE email IS NOT NULL;

-- =========================================================================
-- 3. Codes de rattachement d'une autre adresse
-- =========================================================================
-- Prouver qu'on possède une seconde adresse sans s'y connecter : Supabase Auth
-- ouvrirait une AUTRE session. Code à 6 chiffres envoyé par Brevo, stocké
-- haché (HMAC), 15 minutes, 5 essais.
CREATE TABLE IF NOT EXISTS public.client_link_codes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email       text        NOT NULL CHECK (email = lower(btrim(email))),
  code_hash   text        NOT NULL,
  attempts    smallint    NOT NULL DEFAULT 0,
  expires_at  timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS client_link_codes_user_idx ON public.client_link_codes (user_id, created_at DESC);

-- =========================================================================
-- 4. Fermeture à PostgREST
-- =========================================================================
ALTER TABLE public.client_account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_travelers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_link_codes    ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.client_account_links FROM anon, authenticated;
REVOKE ALL ON public.deal_travelers       FROM anon, authenticated;
REVOKE ALL ON public.client_link_codes    FROM anon, authenticated;
