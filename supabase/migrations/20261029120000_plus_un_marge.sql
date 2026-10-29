-- « +1 qui fait baisser la marge » (retours des admins d'Ulysse, 28/10/2026).
--
-- Sur certains voyages, un voyageur de plus fait baisser la marge TOTALE du
-- groupe (un véhicule, un guide de plus) : au Pérou trek immersion, 4 voyageurs
-- rapportent 1 648 €, 5 n'en rapportent que 1 300 €. Ulysse le signale dans la
-- grille ; cette migration permet au site de l'empêcher, date par date.
-- Règles pures : shared/plusUn.js ; lectures et écritures : server/utils/plusUn.js.
--
-- travel_dates.plus_un_regle :
--   'libre'      — rien ne change (défaut : aucune date existante ne bouge) ;
--   'par_deux'   — le tunnel refuse une réservation qui ferait baisser la marge
--                  du groupe et propose le nombre minimum de places qui la
--                  maintient (« ces 2 dernières places se prennent à 2 ») ;
--   'supplement' — il l'accepte avec un supplément, déduit du solde si d'autres
--                  voyageurs arrivent ensuite et rétablissent la marge.
-- travel_dates.plus_un_supplement : montant du supplément en EUROS, pour la
--   réservation (pas par voyageur). NULL : la marge perdue, arrondie à la
--   dizaine supérieure.
--
-- booked_dates.supplement_plus_un : supplément posé sur la réservation, en
--   CENTIMES (comme les montants AC). La formule du deal (recalculatTotalValues)
--   l'ajoute à la valeur tant qu'il n'est pas levé.
-- booked_dates.supplement_plus_un_seuil : places payées de la date à partir
--   desquelles la marge du groupe est rétablie. NULL : jamais dans la capacité.
-- booked_dates.supplement_plus_un_leve_at : levée du supplément (seuil atteint).
--   Une fois levé, il ne revient pas, même si un voyageur annule ensuite.
--
-- ORDRE :
--   1. supabase/dashboard/09_plus_un_marge.sql sur le projet DASHBOARD
--      (travel_dates et booked_dates y sont répliquées) ;
--   2. cette migration sur PROD ;
--   3. déployer le code : la formule du deal lit booked_dates.supplement_plus_un
--      et ne réécrit plus rien tant qu'elle ne peut pas la lire.
--
-- PUREMENT ADDITIVE et idempotente.

ALTER TABLE "public"."travel_dates"
    ADD COLUMN IF NOT EXISTS "plus_un_regle"      text NOT NULL DEFAULT 'libre',
    ADD COLUMN IF NOT EXISTS "plus_un_supplement" numeric;

ALTER TABLE "public"."travel_dates"
    DROP CONSTRAINT IF EXISTS "travel_dates_plus_un_regle_check",
    DROP CONSTRAINT IF EXISTS "travel_dates_plus_un_supplement_check";

ALTER TABLE "public"."travel_dates"
    ADD CONSTRAINT "travel_dates_plus_un_regle_check"
        CHECK ("plus_un_regle" IN ('libre', 'par_deux', 'supplement')),
    ADD CONSTRAINT "travel_dates_plus_un_supplement_check"
        CHECK ("plus_un_supplement" IS NULL OR "plus_un_supplement" >= 0);

ALTER TABLE "public"."booked_dates"
    ADD COLUMN IF NOT EXISTS "supplement_plus_un"        integer,
    ADD COLUMN IF NOT EXISTS "supplement_plus_un_seuil"  integer,
    ADD COLUMN IF NOT EXISTS "supplement_plus_un_leve_at" timestamp with time zone;

ALTER TABLE "public"."booked_dates"
    DROP CONSTRAINT IF EXISTS "booked_dates_supplement_plus_un_check";

ALTER TABLE "public"."booked_dates"
    ADD CONSTRAINT "booked_dates_supplement_plus_un_check"
        CHECK ("supplement_plus_un" IS NULL OR "supplement_plus_un" >= 0);

COMMENT ON COLUMN "public"."travel_dates"."plus_un_regle" IS '« +1 qui fait baisser la marge » : libre | par_deux | supplement (shared/plusUn.js)';
COMMENT ON COLUMN "public"."travel_dates"."plus_un_supplement" IS 'Supplément « +1 » forcé, en euros, pour la réservation ; NULL = marge perdue arrondie';
COMMENT ON COLUMN "public"."booked_dates"."supplement_plus_un" IS 'Supplément « +1 » de la réservation, en centimes, compris dans la valeur du deal tant qu''il n''est pas levé';
COMMENT ON COLUMN "public"."booked_dates"."supplement_plus_un_seuil" IS 'Places payées de la date à partir desquelles le supplément « +1 » est levé';
COMMENT ON COLUMN "public"."booked_dates"."supplement_plus_un_leve_at" IS 'Levée du supplément « +1 » (déduit du solde)';
