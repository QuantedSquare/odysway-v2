-- Marges v4 : le coût d'achat, d'où la marge par voyageur est DÉRIVÉE.
--
-- Contexte : Ulysse, le back-office qui remplace /booking-management, porte
-- l'éditeur de grille tarifaire. Par palier de voyageurs, il saisit le coût
-- d'achat fournisseur et le prix de vente ; la marge par voyageur en découle.
--
-- La propriété à préserver : `voyage_margins.margin_per_traveler` RESTE la
-- colonne que tout le monde lit. server/utils/margins.js, le tableau de bord des
-- marges et la fiche date continuent de fonctionner SANS MODIFICATION : ils
-- ignorent les colonnes ajoutées ici. Ulysse écrit la marge dérivée dans
-- `margin_per_traveler` en même temps que le coût, par les endpoints
-- `margins/[slug]/pricing` et `margins/[slug]/basis`.
--
-- Bascule voyage par voyage, jamais en masse (décision d'Alex, 17/09/2026) :
--   1. un voyage reste en `margin_basis = 'entered'` — marge saisie, comme
--      aujourd'hui — tant qu'on n'a pas saisi son prix de vente ;
--   2. à la saisie du prix, Ulysse déduit le coût de la marge en base
--      (coût = prix − frais − marge) : aucun coût n'est inventé, et la marge
--      dérivée égale la marge saisie à l'arrondi près ;
--   3. Ulysse réconcilie marge dérivée et marge saisie sur toutes les lignes du
--      voyage ; sans écart inexpliqué, le voyage passe en `purchase_cost`.
-- Pendant la double écriture, l'ancien éditeur peut toujours modifier une
-- marge : la réconciliation d'Ulysse le détecte — la ligne a un `updated_at`
-- postérieur à son `pricing_updated_at`, que seul Ulysse écrit — et l'affiche.
--
-- PUREMENT ADDITIVE : colonnes nullables ou à défaut, aucune ligne existante ne
-- change de sens. Idempotente.
--
-- Ni voyage_margins ni voyage_margin_settings ne sont répliquées vers le projet
-- dashboard (supabase/dashboard/01_target_tables.sql ne les connaît pas) :
-- aucun ajout miroir n'est requis avant de jouer ceci en prod.

-- =========================================================================
-- 1. voyage_margins : coût, prix et change, palier par palier
-- =========================================================================
-- Le prix est porté par la ligne et non par le voyage : il varie selon l'année
-- et la saison (et, en privatif, selon le palier). La même valeur se répète sur
-- les paliers d'une année × saison en GIR — c'est le prix de la ligne qui a
-- servi à dériver SA marge, ce qui rend chaque ligne réconciliable seule.
--
-- purchase_cost_per_traveler : dans la devise fournisseur (voyage_margin_settings.purchase_currency)
-- sale_price_per_traveler    : en euros
-- fx_rate                    : 1 € = fx_rate $ au moment de la dérivation ; NULL en euros
-- pricing_updated_at         : dernière écriture tarifaire de la ligne, par Ulysse seulement.
--                              L'ancien éditeur ne met à jour que updated_at : une ligne dont
--                              updated_at dépasse pricing_updated_at a été retouchée depuis.

ALTER TABLE "public"."voyage_margins"
    ADD COLUMN IF NOT EXISTS "purchase_cost_per_traveler" numeric,
    ADD COLUMN IF NOT EXISTS "sale_price_per_traveler"    numeric,
    ADD COLUMN IF NOT EXISTS "fx_rate"                    numeric,
    ADD COLUMN IF NOT EXISTS "pricing_updated_at"         timestamp with time zone;

ALTER TABLE "public"."voyage_margins"
    DROP CONSTRAINT IF EXISTS "voyage_margins_purchase_cost_check",
    DROP CONSTRAINT IF EXISTS "voyage_margins_sale_price_check",
    DROP CONSTRAINT IF EXISTS "voyage_margins_fx_rate_check",
    DROP CONSTRAINT IF EXISTS "voyage_margins_pricing_pair_check";

ALTER TABLE "public"."voyage_margins"
    ADD CONSTRAINT "voyage_margins_purchase_cost_check"
        CHECK ("purchase_cost_per_traveler" IS NULL OR "purchase_cost_per_traveler" >= 0),
    ADD CONSTRAINT "voyage_margins_sale_price_check"
        CHECK ("sale_price_per_traveler" IS NULL OR "sale_price_per_traveler" > 0),
    ADD CONSTRAINT "voyage_margins_fx_rate_check"
        CHECK ("fx_rate" IS NULL OR "fx_rate" > 0),
    -- Un coût sans prix (ou l'inverse) ne permet de dériver aucune marge.
    ADD CONSTRAINT "voyage_margins_pricing_pair_check"
        CHECK (("purchase_cost_per_traveler" IS NULL) = ("sale_price_per_traveler" IS NULL));

-- =========================================================================
-- 2. voyage_margin_settings : paramètres tarifaires du voyage
-- =========================================================================
-- grid_model         : 'gir' (prix saisi → marge) · 'privatif' (coût + marge cible → prix)
--                      NULL = aucun modèle tarifaire, marge saisie comme avant.
--                      Le co-remplissage (achat / vente date par date) ne passe pas par
--                      cette table : margins.js ne le lit pas, il vit dans le schéma ulysse.
-- purchase_currency  : devise du coût d'achat
-- single_supplement  : supplément chambre individuelle facturé par le fournisseur, par
--                      chambre, dans sa devise. Absorbé une fois par groupe impair.
-- bank_fees_pct      : frais bancaires appliqués à la dernière dérivation (copie du réglage
--                      Admin d'Ulysse) — la réconciliation refait le calcul avec CE taux.
-- target_margin_pct  : taux de marge cible du privatif, en % du coût
-- margin_basis       : 'entered' (marge saisie, fait foi) · 'purchase_cost' (marge dérivée)
-- pricing_updated_*  : dernière écriture tarifaire par Ulysse — distincts de updated_*, que
--                      l'ancien éditeur écrit aussi (mode, écart enfant).

ALTER TABLE "public"."voyage_margin_settings"
    ADD COLUMN IF NOT EXISTS "grid_model"         text,
    ADD COLUMN IF NOT EXISTS "purchase_currency"  text DEFAULT 'EUR' NOT NULL,
    ADD COLUMN IF NOT EXISTS "single_supplement"  numeric,
    ADD COLUMN IF NOT EXISTS "bank_fees_pct"      numeric,
    ADD COLUMN IF NOT EXISTS "target_margin_pct"  numeric,
    ADD COLUMN IF NOT EXISTS "margin_basis"       text DEFAULT 'entered' NOT NULL,
    ADD COLUMN IF NOT EXISTS "pricing_updated_at" timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "pricing_updated_by" text;

ALTER TABLE "public"."voyage_margin_settings"
    DROP CONSTRAINT IF EXISTS "voyage_margin_settings_grid_model_check",
    DROP CONSTRAINT IF EXISTS "voyage_margin_settings_purchase_currency_check",
    DROP CONSTRAINT IF EXISTS "voyage_margin_settings_single_supplement_check",
    DROP CONSTRAINT IF EXISTS "voyage_margin_settings_bank_fees_pct_check",
    DROP CONSTRAINT IF EXISTS "voyage_margin_settings_target_margin_pct_check",
    DROP CONSTRAINT IF EXISTS "voyage_margin_settings_margin_basis_check";

ALTER TABLE "public"."voyage_margin_settings"
    ADD CONSTRAINT "voyage_margin_settings_grid_model_check"
        CHECK ("grid_model" IS NULL OR "grid_model" IN ('gir', 'privatif')),
    ADD CONSTRAINT "voyage_margin_settings_purchase_currency_check"
        CHECK ("purchase_currency" IN ('EUR', 'USD')),
    ADD CONSTRAINT "voyage_margin_settings_single_supplement_check"
        CHECK ("single_supplement" IS NULL OR "single_supplement" >= 0),
    ADD CONSTRAINT "voyage_margin_settings_bank_fees_pct_check"
        CHECK ("bank_fees_pct" IS NULL OR ("bank_fees_pct" >= 0 AND "bank_fees_pct" < 100)),
    ADD CONSTRAINT "voyage_margin_settings_target_margin_pct_check"
        CHECK ("target_margin_pct" IS NULL OR "target_margin_pct" > 0),
    -- Basculer suppose un modèle : sans lui, rien ne dérive la marge.
    ADD CONSTRAINT "voyage_margin_settings_margin_basis_check"
        CHECK ("margin_basis" = 'entered' OR ("margin_basis" = 'purchase_cost' AND "grid_model" IS NOT NULL));

-- =========================================================================
-- 3. Vérification
-- =========================================================================
DO $$
DECLARE n_rows integer; n_settings integer;
BEGIN
  SELECT count(*) INTO n_rows FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'voyage_margins'
    AND column_name IN ('purchase_cost_per_traveler', 'sale_price_per_traveler', 'fx_rate', 'pricing_updated_at');
  SELECT count(*) INTO n_settings FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'voyage_margin_settings'
    AND column_name IN ('grid_model', 'purchase_currency', 'single_supplement', 'bank_fees_pct',
                        'target_margin_pct', 'margin_basis', 'pricing_updated_at', 'pricing_updated_by');
  RAISE NOTICE 'marges v4 : voyage_margins -> % colonnes%, voyage_margin_settings -> % colonnes%',
    n_rows, CASE WHEN n_rows = 4 THEN '' ELSE '  <-- ATTENDU 4' END,
    n_settings, CASE WHEN n_settings = 8 THEN '' ELSE '  <-- ATTENDU 8' END;
END $$;
