-- Soft delete sur voyage_margin_seasons — la dernière fuite du modèle.
--
-- 20260801090000_soft_delete.sql a mis voyage_margins en soft delete, mais a laissé
-- voyage_margin_seasons en dehors : c'était la seule table à ne jamais être supprimée
-- depuis le BMS… en apparence. En réalité replaceSeasonsForVoyage (server/utils/margins.js)
-- faisait un DELETE physique, et
--
--   voyage_margins.season_id -> voyage_margin_seasons(id) ON DELETE CASCADE
--   (20260731120000_margins_v3.sql)
--
-- propageait ce DELETE aux montants de la saison. Retirer une saison de la liste
-- dans l'éditeur détruisait donc PHYSIQUEMENT des lignes voyage_margins — la table
-- même que 090000 venait de rendre restaurable. Le drapeau `deleted` était court-circuité
-- par la base, sans trace ni retour possible.
--
-- Cette migration ferme la brèche côté schéma ; le DELETE côté code est remplacé par
-- softDelete.remove() dans le même commit. Elle est PUREMENT ADDITIVE : toutes les lignes
-- existantes restent `deleted = false`.
--
-- La table n'est PAS répliquée vers le projet dashboard (supabase/dashboard/01_target_tables.sql
-- ne la connaît pas), donc contrairement à 090000, aucun ajout miroir n'est requis avant
-- de jouer ceci en prod.

-- =========================================================================
-- 1. Drapeau `deleted` + quatuor d'audit
-- =========================================================================
-- Même forme que 090000 (boucle FOREACH sur une liste d'une table) pour que les deux
-- migrations restent lisibles côte à côte et que la liste s'étende sans réécriture.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['voyage_margin_seasons'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'table % absente, ignorée', t;
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted boolean', t);
    EXECUTE format('ALTER TABLE public.%I
        ADD COLUMN IF NOT EXISTS deleted_at     timestamptz,
        ADD COLUMN IF NOT EXISTS deleted_by     text,
        ADD COLUMN IF NOT EXISTS deleted_reason text,
        ADD COLUMN IF NOT EXISTS deleted_batch  uuid', t);
  END LOOP;
END $$;

-- =========================================================================
-- 2. Backfill + NOT NULL DEFAULT false
-- =========================================================================
-- Sans le NOT NULL, le `.eq('deleted', false)` ajouté à getSeasonsForVoyage ferait
-- disparaître toutes les saisons existantes (une colonne NULL n'est jamais égale à false).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['voyage_margin_seasons'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('UPDATE public.%I SET deleted = false WHERE deleted IS NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN deleted SET DEFAULT false', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN deleted SET NOT NULL', t);
  END LOOP;
END $$;

-- =========================================================================
-- 3. Cohérence des tombstones
-- =========================================================================
-- Asymétrique comme dans 090000 : permissif côté `false` (backfill, restauration),
-- contraignant côté `true` pour forcer le passage par server/utils/softDelete.js.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['voyage_margin_seasons'] LOOP
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
-- 4. Nouvelle raison : cascade_margin_season
-- =========================================================================
-- Un palier de marge supprimé PARCE QUE la saison qui le porte a été retirée de la
-- liste de l'éditeur. Volontairement distinct de cascade_travel_date : ce n'est pas une
-- date de départ qui tombe, et la restauration ne passe pas par le même chemin
-- (re-création de la saison plutôt que restore.post.js). Les mélanger ferait remonter
-- des montants de saison en restaurant une date, et inversement.
--
-- Le CHECK est recréé sur les 8 tables de 090000 + voyage_margin_seasons, pour que
-- l'énumération reste identique partout — c'est ce qui permet de lire une raison sans
-- se demander de quelle table elle vient.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'travel_dates', 'booked_dates', 'date_notes', 'date_attachments',
    'date_invoices', 'voyage_margins', 'activecampaign_deals', 'activecampaign_clients',
    'voyage_margin_seasons'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format(
      'ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', t, t || '_deleted_reason_chk');
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I
         CHECK (deleted_reason IS NULL OR deleted_reason IN (
           ''manual'', ''cascade_travel_date'', ''cascade_margin_season'',
           ''ac_deal_deleted'', ''ac_deal_trashed'', ''ac_deal_lost'',
           ''ac_contact_deleted'', ''purge''))',
      t, t || '_deleted_reason_chk');
  END LOOP;
END $$;

-- =========================================================================
-- 5. Index partiels
-- =========================================================================
-- getSeasonsForVoyage lit toujours (voyage_slug) WHERE deleted = false.
CREATE INDEX IF NOT EXISTS voyage_margin_seasons_slug_active_idx
    ON public.voyage_margin_seasons (voyage_slug) WHERE deleted = false;

-- La cascade tire sur (season_id) : voyage_margins_season_id_idx (margins_v3) la sert
-- déjà, mais la restauration filtre en plus sur la raison.
CREATE INDEX IF NOT EXISTS voyage_margins_season_cascade_idx
    ON public.voyage_margins (season_id)
    WHERE deleted = true AND deleted_reason = 'cascade_margin_season';

-- =========================================================================
-- 6. Vérification
-- =========================================================================
-- Attendu : 5 colonnes (deleted + le quatuor) sur voyage_margin_seasons.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'voyage_margin_seasons'
    AND column_name IN ('deleted', 'deleted_at', 'deleted_by', 'deleted_reason', 'deleted_batch');
  RAISE NOTICE 'soft delete : voyage_margin_seasons -> % colonnes%', n,
    CASE WHEN n = 5 THEN '' ELSE '  <-- ATTENDU 5' END;
END $$;

-- La FK voyage_margins.season_id -> voyage_margin_seasons(id) ON DELETE CASCADE est
-- CONSERVÉE, comme celle de date_invoices -> travel_dates. Elle devient dormante :
-- plus aucune saison n'est supprimée physiquement, donc elle ne se déclenche jamais en
-- fonctionnement normal. Elle reste la bonne sémantique pour le futur job de purge —
-- purger une saison doit bien emporter ses montants — et un garde-fou si une suppression
-- physique était faite à la main depuis l'éditeur SQL.
