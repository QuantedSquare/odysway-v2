-- =========================================================================
-- Collecte des violations CSP
-- =========================================================================
-- Le CSP est servi en Report-Only depuis le 16/07/2026 (server/middleware/
-- csp-report-only.ts) avec l'intention de passer en mode bloquant "une fois la
-- console propre en production". Sans endpoint de collecte, cette vérification
-- reposait sur un développeur qui pense à ouvrir la console, sur les pages
-- qu'il pense à visiter — donc elle n'a jamais eu lieu.
--
-- Cette table agrège les rapports envoyés par les navigateurs. On ne stocke PAS
-- un rapport par violation : le volume serait de l'ordre de 10 lignes par page
-- vue. On agrège sur le couple (directive, origine bloquée), qui est exactement
-- la granularité à laquelle on écrit une règle CSP.

CREATE TABLE IF NOT EXISTS public.csp_violations (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- La directive effectivement violée ('script-src-elem', 'connect-src'…).
    -- Attention : ce n'est pas toujours la directive écrite dans la policy —
    -- 'script-src-elem' n'est pas déclarée chez nous et retombe sur 'script-src'.
    effective_directive text        NOT NULL,

    -- Origine de la ressource bloquée, normalisée ('https://www.gstatic.com').
    -- Les valeurs non-URL renvoyées par les navigateurs ('inline', 'eval',
    -- 'data', 'blob') sont conservées telles quelles.
    blocked_origin      text        NOT NULL,

    -- Un exemple complet, pour pouvoir enquêter. Écrasé à chaque écriture :
    -- c'est un échantillon, pas un historique.
    sample_blocked_uri  text,
    sample_document_uri text,

    -- 'report' tant qu'on est en Report-Only, 'enforce' après bascule. Permet de
    -- distinguer les violations observées des violations réellement bloquées.
    disposition         text,

    -- Nombre d'ÉCRITURES, pas de violations. L'endpoint déduplique en mémoire
    -- par instance serverless (voir server/api/v1/csp-report.post.ts), donc
    -- c'est une borne inférieure très grossière. À lire comme un signal de
    -- fréquence relative, jamais comme une métrique.
    report_count        bigint      NOT NULL DEFAULT 1,

    first_seen_at       timestamptz NOT NULL DEFAULT now(),
    last_seen_at        timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT csp_violations_unique_pair UNIQUE (effective_directive, blocked_origin)
);

COMMENT ON TABLE public.csp_violations IS
    'Violations CSP agrégées par (directive, origine bloquée). Alimentée par POST /api/v1/csp-report.';
COMMENT ON COLUMN public.csp_violations.report_count IS
    'Nombre d''écritures, pas de violations : l''endpoint déduplique en mémoire. Signal relatif uniquement.';

-- Le tri naturel de lecture : "qu'est-ce qui casse encore, le plus récemment ?"
CREATE INDEX IF NOT EXISTS csp_violations_last_seen_idx
    ON public.csp_violations (last_seen_at DESC);

-- =========================================================================
-- Upsert atomique
-- =========================================================================
-- L'incrément d'un compteur ne s'exprime pas avec un upsert PostgREST, et deux
-- rapports concurrents sur la même paire doivent fusionner sans perdre l'un des
-- deux. D'où une fonction plutôt qu'un .upsert() côté client.
CREATE OR REPLACE FUNCTION public.record_csp_violation(
    p_directive    text,
    p_origin       text,
    p_blocked_uri  text,
    p_document_uri text,
    p_disposition  text
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    INSERT INTO public.csp_violations AS v (
        effective_directive, blocked_origin,
        sample_blocked_uri, sample_document_uri, disposition
    )
    VALUES (p_directive, p_origin, p_blocked_uri, p_document_uri, p_disposition)
    ON CONFLICT ON CONSTRAINT csp_violations_unique_pair DO UPDATE
    SET report_count        = v.report_count + 1,
        last_seen_at        = now(),
        sample_blocked_uri  = COALESCE(EXCLUDED.sample_blocked_uri, v.sample_blocked_uri),
        sample_document_uri = COALESCE(EXCLUDED.sample_document_uri, v.sample_document_uri),
        disposition         = COALESCE(EXCLUDED.disposition, v.disposition);
$$;

-- PostgREST expose toute fonction publique en RPC, et PostgreSQL accorde EXECUTE
-- à PUBLIC par défaut. Sans cette révocation, n'importe qui muni de la clé anon
-- (qui est publique, elle est dans le bundle client) pourrait appeler
-- /rest/v1/rpc/record_csp_violation et remplir la table de n'importe quoi.
-- Seul le serveur, qui utilise la service_role key, doit pouvoir écrire.
REVOKE EXECUTE ON FUNCTION public.record_csp_violation(text, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_csp_violation(text, text, text, text, text) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.record_csp_violation(text, text, text, text, text) TO service_role;

-- =========================================================================
-- RLS
-- =========================================================================
-- L'endpoint passe par la service_role key (server/utils/supabase.js), qui
-- contourne RLS. On active RLS sans aucune policy : la table devient donc
-- inaccessible à anon/authenticated, et seul le serveur écrit dedans.
ALTER TABLE public.csp_violations ENABLE ROW LEVEL SECURITY;

-- Volontairement plus strict que les migrations plus anciennes (ac_processed_events
-- et consorts), qui font GRANT ALL à anon et authenticated en comptant sur RLS
-- seule. Ici on retire aussi les privilèges de table : Supabase pose des default
-- privileges sur le schéma public, donc sans ce REVOKE la table serait accordée à
-- anon à sa création. RLS suffirait, mais deux verrous valent mieux qu'un sur une
-- table alimentée par un endpoint public.
REVOKE ALL ON TABLE public.csp_violations FROM anon, authenticated;
GRANT  ALL ON TABLE public.csp_violations TO service_role;

-- =========================================================================
-- Vérification
-- =========================================================================
DO $$
DECLARE has_fn boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'record_csp_violation'
    ) INTO has_fn;
    RAISE NOTICE 'csp_violations : table créée, fonction record_csp_violation présente = %', has_fn;
END $$;
