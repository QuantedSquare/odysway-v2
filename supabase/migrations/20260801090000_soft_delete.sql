-- Soft delete standard sur les tables Supabase.
-- Voir le plan /Users/alex/.claude/plans/j-aimerais-que-tu-planifies-enumerated-lake.md
--
-- Jusqu'ici toutes les suppressions du projet étaient des DELETE physiques. Les colonnes
-- `deleted` existaient déjà sur travel_dates et booked_dates mais rien ne les écrivait
-- jamais — seules 4 lectures les filtraient, de façon incohérente.
--
-- Cette migration est PUREMENT ADDITIVE : aucune ligne existante ne change de sens
-- (tout le monde reste `deleted = false`), et aucun code ne lit encore les nouvelles
-- colonnes. Elle doit précéder la passe de filtrage des lectures, car avant le
-- backfill NOT NULL, `.eq('deleted', false)` écarte les NULL alors que
-- `.not('deleted','is',true)` les garde.
--
-- ⚠️ AVANT DE JOUER CECI EN PROD : appliquer les mêmes ajouts de colonnes au projet
-- dashboard (supabase/dashboard/01_target_tables.sql). mirror-sync upsert la ligne prod
-- BRUTE ; une colonne inconnue côté miroir fait échouer l'upsert en PGRST204 et toute la
-- synchro analytique s'arrête silencieusement.

-- =========================================================================
-- 0. Mesure de l'existant — à lire dans la sortie avant/après
-- =========================================================================
-- Les pièges NULL préexistants sur booked_dates : travelers-count.get.js filtre
-- `.eq('is_test', false).eq('is_option', false)`, donc toute ligne à NULL est
-- aujourd'hui silencieusement absente du compteur public de voyageurs.
DO $$
DECLARE n_test bigint; n_option bigint;
BEGIN
  SELECT count(*) FILTER (WHERE is_test IS NULL),
         count(*) FILTER (WHERE is_option IS NULL)
    INTO n_test, n_option FROM public.booked_dates;
  RAISE NOTICE 'booked_dates avant backfill : is_test NULL = %, is_option NULL = %', n_test, n_option;
END $$;

-- =========================================================================
-- 1. Drapeau `deleted` sur les 6 tables qui ne l'ont pas
-- =========================================================================
-- travel_dates et booked_dates l'ont déjà (NOT NULL DEFAULT false).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'date_notes', 'date_attachments', 'date_invoices', 'voyage_margins',
    'activecampaign_deals', 'activecampaign_clients'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'table % absente, ignorée', t;
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted boolean', t);
  END LOOP;
END $$;

-- =========================================================================
-- 2. Quatuor d'audit sur les 8 tables
-- =========================================================================
-- deleted_batch est informatif : la restauration s'appuie sur
-- (travel_date_id, deleted_reason) et non sur le batch, pour qu'une cascade
-- partielle ayant produit deux batchs se restaure quand même complètement.
-- Le batch sert à afficher « 12 réservations seront restaurées » et à auditer.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'travel_dates', 'booked_dates', 'date_notes', 'date_attachments',
    'date_invoices', 'voyage_margins', 'activecampaign_deals', 'activecampaign_clients'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I
        ADD COLUMN IF NOT EXISTS deleted_at     timestamptz,
        ADD COLUMN IF NOT EXISTS deleted_by     text,
        ADD COLUMN IF NOT EXISTS deleted_reason text,
        ADD COLUMN IF NOT EXISTS deleted_batch  uuid', t);
  END LOOP;
END $$;

-- =========================================================================
-- 3. Backfill + NOT NULL DEFAULT false sur le drapeau canonique
-- =========================================================================
-- Sans le NOT NULL, `.eq('deleted', false)` laisserait silencieusement tomber
-- les lignes à NULL — exactement la logique ternaire qui casse déjà
-- is_test / is_option (voir section 4).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'travel_dates', 'booked_dates', 'date_notes', 'date_attachments',
    'date_invoices', 'voyage_margins', 'activecampaign_deals', 'activecampaign_clients'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('UPDATE public.%I SET deleted = false WHERE deleted IS NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN deleted SET DEFAULT false', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN deleted SET NOT NULL', t);
  END LOOP;
END $$;

-- =========================================================================
-- 4. Les deux pièges NULL préexistants sur booked_dates
-- =========================================================================
-- is_test est nullable, et assign-deal.post.js écrivait `is_option || null`
-- (NULL littéral). Corrigé côté code en même temps que cette migration.
UPDATE public.booked_dates SET is_test   = false WHERE is_test   IS NULL;
UPDATE public.booked_dates SET is_option = false WHERE is_option IS NULL;
ALTER TABLE public.booked_dates
    ALTER COLUMN is_test   SET DEFAULT false,
    ALTER COLUMN is_test   SET NOT NULL,
    ALTER COLUMN is_option SET DEFAULT false,
    ALTER COLUMN is_option SET NOT NULL;

-- =========================================================================
-- 5. Cohérence des tombstones
-- =========================================================================
-- Asymétrique volontairement : permissif côté `false` pour que le backfill
-- ci-dessus et toute restauration (qui remet le quatuor à NULL) passent,
-- contraignant côté `true` pour forcer chaque suppression à passer par
-- server/utils/softDelete.js plutôt que par un `.update({ deleted: true })` nu.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'travel_dates', 'booked_dates', 'date_notes', 'date_attachments',
    'date_invoices', 'voyage_margins', 'activecampaign_deals', 'activecampaign_clients'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format(
      'ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', t, t || '_tombstone_chk');
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I
         CHECK (deleted = false OR (deleted_at IS NOT NULL AND deleted_reason IS NOT NULL))',
      t, t || '_tombstone_chk');
  END LOOP;
END $$;

-- =========================================================================
-- 6. Énumération des raisons
-- =========================================================================
--   manual              action opérateur BMS
--   cascade_travel_date enfant supprimé PARCE QUE sa date parente l'a été.
--                       C'est cette valeur qui rend la restauration correcte :
--                       restaurer une date ne restaure QUE ses enfants en cascade,
--                       jamais ceux que l'opérateur avait supprimés un par un avant.
--   ac_deal_deleted     webhook ac/dealDelete
--   ac_deal_trashed     webhook ac/dealUpdate, branche group === '3' (Corbeille)
--   ac_deal_lost        webhook ac/dealUpdate, statut Perdu / Supprimé
--   ac_contact_deleted  webhook ac/contactDelete
--   purge               réservé au futur job de purge
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'travel_dates', 'booked_dates', 'date_notes', 'date_attachments',
    'date_invoices', 'voyage_margins', 'activecampaign_deals', 'activecampaign_clients'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format(
      'ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', t, t || '_deleted_reason_chk');
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I
         CHECK (deleted_reason IS NULL OR deleted_reason IN (
           ''manual'', ''cascade_travel_date'', ''ac_deal_deleted'', ''ac_deal_trashed'',
           ''ac_deal_lost'', ''ac_contact_deleted'', ''purge''))',
      t, t || '_deleted_reason_chk');
  END LOOP;
END $$;

-- =========================================================================
-- 7. Index partiels sur les chemins chauds
-- =========================================================================
-- Le code applique systématiquement `.eq('deleted', false)` : ces prédicats
-- correspondent exactement à cette forme (c'est pourquoi on standardise sur
-- .eq() plutôt que sur .not('deleted','is',true) côté application).
CREATE INDEX IF NOT EXISTS booked_dates_travel_date_active_idx
    ON public.booked_dates (travel_date_id) WHERE deleted = false;

-- Le chemin « réservations payantes » : departures.js, margins.js, les dashboards.
CREATE INDEX IF NOT EXISTS booked_dates_travel_date_paid_active_idx
    ON public.booked_dates (travel_date_id) WHERE deleted = false AND booked_places > 0;

CREATE INDEX IF NOT EXISTS travel_dates_slug_departure_active_idx
    ON public.travel_dates (travel_slug, departure_date) WHERE deleted = false;

CREATE INDEX IF NOT EXISTS travel_dates_departure_id_active_idx
    ON public.travel_dates (departure_id) WHERE deleted = false AND departure_id IS NOT NULL;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['date_notes', 'date_attachments', 'date_invoices'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (travel_date_id) WHERE deleted = false',
      t || '_date_active_idx', t);
  END LOOP;
END $$;

-- =========================================================================
-- 8. Vérification
-- =========================================================================
-- Attendu : 5 colonnes sur chacune des 8 tables (deleted + le quatuor).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name, count(*) AS n FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('deleted', 'deleted_at', 'deleted_by', 'deleted_reason', 'deleted_batch')
      AND table_name IN ('travel_dates', 'booked_dates', 'date_notes', 'date_attachments',
                         'date_invoices', 'voyage_margins', 'activecampaign_deals',
                         'activecampaign_clients')
    GROUP BY 1 ORDER BY 1
  LOOP
    RAISE NOTICE 'soft delete : % -> % colonnes%', r.table_name, r.n,
      CASE WHEN r.n = 5 THEN '' ELSE '  <-- ATTENDU 5' END;
  END LOOP;
END $$;

-- La FK date_invoices -> travel_dates ON DELETE CASCADE est conservée
-- (20260530120000_margins_and_invoices.sql). Elle devient dormante puisque plus
-- aucune travel_dates n'est supprimée physiquement, et reste la bonne sémantique
-- pour le futur job de purge — qui devra vider les objets Storage AVANT de
-- supprimer les lignes, sinon les buckets date-invoices / date-attachments
-- accumulent des fichiers orphelins.
