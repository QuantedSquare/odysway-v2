-- Espace Voyageur : email aux clients quand un document de voyage est publié.
--
-- PUREMENT ADDITIVE.
--   - trip_documents.notifier_clients : l'équipe peut publier sans prévenir
--     (correction d'un document déjà annoncé, par exemple) ;
--   - trip_documents.notifie_le : la notification du document est faite ;
--     un document « disponible le » futur est annoncé ce jour-là par la tâche
--     planifiée, pas à sa publication ;
--   - trip_document_notifications : un email par document et par adresse,
--     jamais deux (UNIQUE) — la trace de qui a été prévenu, et quand.

ALTER TABLE public.trip_documents
  ADD COLUMN IF NOT EXISTS notifier_clients boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifie_le timestamptz;

CREATE TABLE IF NOT EXISTS public.trip_document_notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid        NOT NULL REFERENCES public.trip_documents (id) ON DELETE CASCADE,
  email       text        NOT NULL CHECK (email = lower(btrim(email))),
  deal_id     bigint,
  -- envoye : parti chez Brevo ; redirige : envoyé à l'adresse de test ;
  -- ignore : notifications coupées sur cet environnement ; echec : Brevo a refusé.
  statut      text        NOT NULL CHECK (statut IN ('envoye', 'redirige', 'ignore', 'echec')),
  detail      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, email)
);

ALTER TABLE public.trip_document_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trip_document_notifications FROM anon, authenticated;
