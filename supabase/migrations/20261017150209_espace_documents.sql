-- Espace Voyageur : documents de voyage déposés par l'équipe (Ulysse) et
-- lus par les clients — fiche voyage, carnet de séjour, billets, contrat
-- d'assurance, facture, autre.
--
-- PUREMENT ADDITIVE. Même fermeture que les autres tables de l'espace : RLS
-- sans policy, droits retirés à anon/authenticated, tout passe par Nitro.
--
-- Portée : un document vaut pour TOUT un départ (travel_date_id : fiche
-- voyage, carnet) ou pour UN dossier (deal_id : billets, facture). Jamais les
-- deux. `reserve_titulaire` le cache aux voyageurs invités (une facture porte
-- des montants, qu'un invité ne voit jamais).
--
-- Cycle : la ligne naît non publiée, le navigateur d'Ulysse dépose le fichier
-- par URL signée, puis Ulysse publie (odysway vérifie alors que le fichier
-- existe). `disponible_le` : publié mais affiché « Bientôt » jusqu'à cette date.

CREATE TABLE IF NOT EXISTS public.trip_documents (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_date_id    uuid        REFERENCES public.travel_dates (id) ON DELETE CASCADE,
  deal_id           bigint,
  type              text        NOT NULL CHECK (type IN ('fiche_voyage', 'carnet', 'billet', 'assurance', 'facture', 'autre')),
  titre             text        NOT NULL CHECK (char_length(titre) BETWEEN 1 AND 120),
  description       text        CHECK (description IS NULL OR char_length(description) <= 300),
  nom_fichier       text        NOT NULL CHECK (char_length(nom_fichier) <= 255),
  mime_type         text        NOT NULL,
  taille            integer     NOT NULL CHECK (taille > 0),
  storage_path      text        NOT NULL UNIQUE,
  reserve_titulaire boolean     NOT NULL DEFAULT false,
  publie            boolean     NOT NULL DEFAULT false,
  publie_le         timestamptz,
  disponible_le     date,
  depose_par        text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,
  deleted_by        text,
  CHECK ((travel_date_id IS NULL) <> (deal_id IS NULL))
);
CREATE INDEX IF NOT EXISTS trip_documents_date_idx ON public.trip_documents (travel_date_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS trip_documents_deal_idx ON public.trip_documents (deal_id) WHERE deleted_at IS NULL;

-- « Nouveau » : un document publié que ce compte n'a pas encore ouvert.
CREATE TABLE IF NOT EXISTS public.trip_document_views (
  document_id uuid        NOT NULL REFERENCES public.trip_documents (id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  vu_le       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (document_id, user_id)
);

ALTER TABLE public.trip_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_document_views ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trip_documents      FROM anon, authenticated;
REVOKE ALL ON public.trip_document_views FROM anon, authenticated;

-- Bucket privé, servi par URL signée de 60 s après contrôle d'accès.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('trip-documents', 'trip-documents', false, 20971520,
        ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;
