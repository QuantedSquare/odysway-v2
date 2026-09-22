-- Verrou et journal de la revalidation ISR.
--
-- Le webhook Sanity revalidait jusqu'ici une liste de chemins écrite à la main :
-- siteBanner n'y figurait pas (0 chemin revalidé), et header/footer/ctas n'en
-- couvraient que 2 à 5 sur les ~480 pages cachées. Le nouveau mécanisme balaye
-- l'intégralité des chemins pour le contenu présent dans les layouts, en
-- plusieurs invocations chaînées — ce qui demande deux choses à la base :
--
--   1. un VERROU : deux balayages simultanés doubleraient ~480 rendus SSR pour
--      rien. Il est posé par un index unique partiel sur status = 'running',
--      donc atomique : un second INSERT échoue en 23505 au lieu de courser.
--   2. un CURSEUR persistant : une invocation Vercel ne peut pas tenir les ~480
--      rendus, donc chaque tranche de 40 reprend là où la précédente s'est
--      arrêtée (server/api/v1/webhooks/sanity/sweep.post.ts).
--
-- `revalidation_events` est le journal des webhooks unitaires : c'est la seule
-- façon de constater après coup qu'un type de document n'a résolu aucun chemin,
-- ou que Sanity n'avait pas encore servi la nouvelle révision au moment du rendu.
--
-- Purement additive : aucune table existante n'est touchée.

-- =========================================================================
-- 1. Jobs de balayage
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.revalidation_jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'global' (doc présent dans les layouts, ~470 chemins), 'scoped' (liste de
  -- chemins connue mais trop longue pour le webhook, ex. page_voyage -> 97 pages),
  -- 'nightly' (filet de sécurité cron), 'manual' (déclenché à la main).
  kind             text NOT NULL DEFAULT 'global',
  status           text NOT NULL DEFAULT 'running',  -- running | done | failed | stale
  -- Document déclencheur, pour remonter du symptôme au webhook.
  trigger_type     text,
  trigger_id       text,
  trigger_rev      text,
  trigger_reason   text,
  -- Liste figée des chemins : le curseur doit rester stable d'une tranche à
  -- l'autre, même si du contenu est publié pendant le balayage.
  paths            jsonb NOT NULL DEFAULT '[]'::jsonb,
  total            integer NOT NULL DEFAULT 0,
  cursor           integer NOT NULL DEFAULT 0,
  -- Une rafale de publications ne relance pas N balayages : elle demande une
  -- passe supplémentaire au balayage en cours (plafonnée côté code).
  pass             integer NOT NULL DEFAULT 1,
  rerun_requested  boolean NOT NULL DEFAULT false,
  ok               integer NOT NULL DEFAULT 0,
  stale            integer NOT NULL DEFAULT 0,   -- x-vercel-cache: HIT = jeton de bypass ignoré
  failed           integer NOT NULL DEFAULT 0,
  problems         jsonb,
  started_at       timestamptz NOT NULL DEFAULT now(),
  -- Battement de cœur : un job sans nouvelle depuis 3 min est considéré mort et
  -- libère le verrou (invocation tuée en plein chaînage).
  heartbeat_at     timestamptz NOT NULL DEFAULT now(),
  finished_at      timestamptz
);

-- Le verrou lui-même : au plus un job 'running' à la fois.
CREATE UNIQUE INDEX IF NOT EXISTS revalidation_jobs_single_running
  ON public.revalidation_jobs (status)
  WHERE status = 'running';

CREATE INDEX IF NOT EXISTS revalidation_jobs_started_at_idx
  ON public.revalidation_jobs (started_at DESC);

-- =========================================================================
-- 2. Journal des webhooks unitaires
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.revalidation_events (
  id                 bigserial PRIMARY KEY,
  doc_type           text,
  doc_id             text,
  doc_rev            text,
  -- Portée décidée par server/utils/revalidationRegistry.ts
  scope              text,              -- page | collection | refs | global | none
  mode               text,              -- paths | sweep | none
  -- false => type absent du registre : c'est exactement le trou dans lequel
  -- siteBanner est tombé. À surveiller.
  known_type         boolean,
  paths              jsonb,
  ok                 integer,
  stale              integer,
  failed             integer,
  -- false alors que le document existe => le rendu a pu lire une version périmée
  -- et la re-cacher pour 1 jour.
  revision_confirmed boolean,
  revision_wait_ms   integer,
  job_id             uuid REFERENCES public.revalidation_jobs (id) ON DELETE SET NULL,
  reason             text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revalidation_events_created_at_idx
  ON public.revalidation_events (created_at DESC);

CREATE INDEX IF NOT EXISTS revalidation_events_doc_type_idx
  ON public.revalidation_events (doc_type, created_at DESC);
