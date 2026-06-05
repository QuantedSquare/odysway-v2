-- Margins v2: multi-year voyage_margins, optional-file date_invoices, new AC field mirror.
-- See plan /Users/alex/.claude/plans/users-alex-downloads-tarifs-voyages-ody-crystalline-kettle.md

-- =========================================================================
-- voyage_margins: per-year configuration
-- Old UNIQUE(voyage_slug, pax) → new UNIQUE(voyage_slug, pax, year).
-- Existing rows are backfilled with the current calendar year (2026 at deploy time).
-- =========================================================================

ALTER TABLE "public"."voyage_margins"
    ADD COLUMN IF NOT EXISTS "year" integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

ALTER TABLE "public"."voyage_margins"
    DROP CONSTRAINT IF EXISTS "voyage_margins_voyage_slug_pax_key";

ALTER TABLE "public"."voyage_margins"
    ADD CONSTRAINT "voyage_margins_voyage_slug_pax_year_key"
    UNIQUE ("voyage_slug", "pax", "year");

CREATE INDEX IF NOT EXISTS "voyage_margins_voyage_slug_year_idx"
    ON "public"."voyage_margins" ("voyage_slug", "year");

-- =========================================================================
-- date_invoices: allow rows without an attached file (~5% exception cases).
-- Keep `amount NOT NULL`. Add CHECK to guarantee we always have either a file
-- or a human-readable label so the row stays identifiable.
-- =========================================================================

ALTER TABLE "public"."date_invoices"
    ALTER COLUMN "file_name"    DROP NOT NULL,
    ALTER COLUMN "file_size"    DROP NOT NULL,
    ALTER COLUMN "mime_type"    DROP NOT NULL,
    ALTER COLUMN "storage_path" DROP NOT NULL;

ALTER TABLE "public"."date_invoices"
    DROP CONSTRAINT IF EXISTS "date_invoices_file_or_label_check";

ALTER TABLE "public"."date_invoices"
    ADD CONSTRAINT "date_invoices_file_or_label_check"
    CHECK ("label" IS NOT NULL OR "file_name" IS NOT NULL);

-- =========================================================================
-- activecampaign_deals: mirror new AC field 117 "Marge supplémentaire par pax"
-- (introduced because field 14 "Marge par voyageur (base)" is now exclusively
-- overridden by the BMS PAX table — extras like extension/early check-in need
-- their own field).
-- =========================================================================

ALTER TABLE "public"."activecampaign_deals"
    ADD COLUMN IF NOT EXISTS "extra_margin_per_traveler" numeric;
