-- Espace Voyageur : profil de chaque voyageur d'un dossier (pièce d'identité,
-- régime, allergies, contact d'urgence, champ libre) et copie de la pièce.
--
-- PUREMENT ADDITIVE. Même fermeture que les autres tables de l'espace : RLS
-- sans policy, droits retirés à anon/authenticated, tout passe par Nitro.
--
-- Données sensibles (RGPD) :
--   - le numéro de pièce est CHIFFRÉ par l'application (AES-256-GCM, clé
--     ESPACE_CHIFFREMENT_KEY hors base) : une fuite de la table ne le livre pas ;
--     seuls les 4 derniers caractères restent en clair, pour l'affichage ;
--   - la copie de la pièce vit dans le bucket privé `traveler-files`, lue par
--     URL signée de 60 s, chaque dépôt / lecture / suppression est journalisé ;
--   - les copies sont supprimées 30 jours après le retour (purge planifiée).

-- =========================================================================
-- 1. Profil d'un voyageur (une ligne par place de dossier)
-- =========================================================================
-- Rattaché à la PLACE (deal_travelers) et non à la personne : un enfant ou un
-- voyageur sans compte a aussi un profil, rempli par le titulaire. `user_id`
-- note la personne quand elle est connue, pour pré-remplir son voyage suivant.
CREATE TABLE IF NOT EXISTS public.traveler_profiles (
  deal_traveler_id      uuid        PRIMARY KEY REFERENCES public.deal_travelers (id) ON DELETE CASCADE,
  user_id               uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  piece_type            text        CHECK (piece_type IN ('passeport', 'carte_identite')),
  piece_numero_chiffre  text,
  piece_numero_fin      text        CHECK (piece_numero_fin IS NULL OR char_length(piece_numero_fin) <= 4),
  piece_expiration      date,
  piece_pays            text        CHECK (piece_pays IS NULL OR piece_pays ~ '^[A-Z]{2}$'),
  scan_path             text,
  scan_type             text,
  scan_taille           integer,
  scan_depose_le        timestamptz,
  regimes               text[]      NOT NULL DEFAULT '{}',
  allergies             text        CHECK (allergies IS NULL OR char_length(allergies) <= 500),
  urgence_nom           text        CHECK (urgence_nom IS NULL OR char_length(urgence_nom) <= 120),
  urgence_lien          text        CHECK (urgence_lien IS NULL OR char_length(urgence_lien) <= 60),
  urgence_telephone     text        CHECK (urgence_telephone IS NULL OR char_length(urgence_telephone) <= 40),
  notes                 text        CHECK (notes IS NULL OR char_length(notes) <= 2000),
  updated_by            uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS traveler_profiles_user_idx ON public.traveler_profiles (user_id, updated_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS traveler_profiles_scan_idx ON public.traveler_profiles (scan_depose_le) WHERE scan_path IS NOT NULL;

-- =========================================================================
-- 2. Journal des accès aux copies de pièces
-- =========================================================================
-- Qui a déposé, lu ou supprimé quelle copie, et quand. Gardé après la purge
-- de la copie : il prouve qu'elle a bien été supprimée.
CREATE TABLE IF NOT EXISTS public.traveler_file_access (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_traveler_id  uuid        NOT NULL REFERENCES public.deal_travelers (id) ON DELETE CASCADE,
  action            text        NOT NULL CHECK (action IN ('depot', 'lecture', 'suppression', 'purge')),
  acteur_user_id    uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  acteur            text        NOT NULL,
  scan_path         text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS traveler_file_access_traveler_idx ON public.traveler_file_access (deal_traveler_id, created_at DESC);

ALTER TABLE public.traveler_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traveler_file_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.traveler_profiles    FROM anon, authenticated;
REVOKE ALL ON public.traveler_file_access FROM anon, authenticated;

-- =========================================================================
-- 3. Bucket privé des copies de pièces
-- =========================================================================
-- Aucune policy sur storage.objects (aucune n'existe dans ce projet) : seule
-- la clé service_role lit et écrit. Taille et types refusés dès Storage, en
-- plus du contrôle des octets fait par Nitro.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('traveler-files', 'traveler-files', false, 10485760,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'])
ON CONFLICT (id) DO NOTHING;
