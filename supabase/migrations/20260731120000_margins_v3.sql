-- Margins v3: seasonal pricing, child margin delta, per-voyage config mode.
-- See plan /Users/alex/.claude/plans/tidy-noodling-pizza.md
--
-- Three additions, all backwards-compatible — a voyage with no season and no
-- settings row resolves exactly like it did before this migration:
--   1. voyage_margin_seasons  — recurring DD/MM windows per voyage (haute/basse saison)
--   2. voyage_margin_settings — config mode (pax table / per-date / excluded) + child delta
--   3. voyage_margins.season_id — the seasonal dimension on the existing PAX table
--
-- Requires PostgreSQL >= 15 for UNIQUE NULLS NOT DISTINCT. Check with `SELECT version();`
-- before running (Supabase has shipped 15+ since 2023).

-- =========================================================================
-- voyage_margin_seasons: recurring month/day windows, defined once per voyage
-- =========================================================================
-- No `year` column on purpose: the window recurs every year, only the amounts
-- in voyage_margins are entered per year. A season may wrap around 31/12
-- (start 01/10 → end 30/04); the matcher in server/utils/margins.js handles it.

CREATE TABLE IF NOT EXISTS "public"."voyage_margin_seasons" (
    "id"          uuid                     DEFAULT gen_random_uuid() NOT NULL,
    "voyage_slug" text                     NOT NULL,
    "label"       text                     NOT NULL,
    "start_month" smallint                 NOT NULL,
    "start_day"   smallint                 NOT NULL,
    "end_month"   smallint                 NOT NULL,
    "end_day"     smallint                 NOT NULL,
    "sort_order"  integer                  DEFAULT 0 NOT NULL,
    "created_at"  timestamp with time zone DEFAULT now(),
    "updated_at"  timestamp with time zone DEFAULT now(),
    "updated_by"  text,
    CONSTRAINT "voyage_margin_seasons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "voyage_margin_seasons_start_month_check" CHECK ("start_month" BETWEEN 1 AND 12),
    CONSTRAINT "voyage_margin_seasons_start_day_check"   CHECK ("start_day"   BETWEEN 1 AND 31),
    CONSTRAINT "voyage_margin_seasons_end_month_check"   CHECK ("end_month"   BETWEEN 1 AND 12),
    CONSTRAINT "voyage_margin_seasons_end_day_check"     CHECK ("end_day"     BETWEEN 1 AND 31)
);

CREATE INDEX IF NOT EXISTS "voyage_margin_seasons_voyage_slug_idx"
    ON "public"."voyage_margin_seasons" ("voyage_slug");

-- =========================================================================
-- voyage_margin_settings: one row per voyage
-- =========================================================================
-- `config_mode` drives how the Configuration tab decides "configured" vs not:
--   pax_table — the PAX table (× seasons) is the source of truth  [default]
--   per_date  — margins are set date by date via margin_override_per_traveler
--   excluded  — voyage is out of margin tracking, never flagged as unconfigured
--
-- `child_margin_delta` is ADDED to the adult margin for each child: the supplier
-- cost is lower for a child, so the margin is higher. NULL = same as adult.

CREATE TABLE IF NOT EXISTS "public"."voyage_margin_settings" (
    "voyage_slug"        text                     NOT NULL,
    "config_mode"        text                     DEFAULT 'pax_table' NOT NULL,
    "child_margin_delta" numeric,
    "updated_at"         timestamp with time zone DEFAULT now(),
    "updated_by"         text,
    CONSTRAINT "voyage_margin_settings_pkey" PRIMARY KEY ("voyage_slug"),
    CONSTRAINT "voyage_margin_settings_config_mode_check"
        CHECK ("config_mode" IN ('pax_table', 'per_date', 'excluded'))
);

-- =========================================================================
-- voyage_margins: seasonal dimension
-- =========================================================================
-- season_id IS NULL = the "toutes saisons / défaut" row. Every pre-existing row
-- becomes a default row, so resolution is unchanged until a season is created.
--
-- NULLS NOT DISTINCT is required: with the default NULLS DISTINCT, two identical
-- default rows could coexist and PostgREST's upsert (onConflict) would break.

ALTER TABLE "public"."voyage_margins"
    ADD COLUMN IF NOT EXISTS "season_id" uuid;

ALTER TABLE "public"."voyage_margins"
    DROP CONSTRAINT IF EXISTS "voyage_margins_season_id_fkey";

ALTER TABLE "public"."voyage_margins"
    ADD CONSTRAINT "voyage_margins_season_id_fkey"
    FOREIGN KEY ("season_id") REFERENCES "public"."voyage_margin_seasons"("id") ON DELETE CASCADE;

ALTER TABLE "public"."voyage_margins"
    DROP CONSTRAINT IF EXISTS "voyage_margins_voyage_slug_pax_year_key";

ALTER TABLE "public"."voyage_margins"
    DROP CONSTRAINT IF EXISTS "voyage_margins_slug_pax_year_season_key";

ALTER TABLE "public"."voyage_margins"
    ADD CONSTRAINT "voyage_margins_slug_pax_year_season_key"
    UNIQUE NULLS NOT DISTINCT ("voyage_slug", "pax", "year", "season_id");

CREATE INDEX IF NOT EXISTS "voyage_margins_season_id_idx"
    ON "public"."voyage_margins" ("season_id");

-- =========================================================================
-- Backfill: auto-detect voyages already driven by per-date overrides
-- =========================================================================
-- A voyage with zero PAX rows but at least one date carrying an override was
-- being counted as "non configuré" — that is exactly the case this migration
-- fixes (le Japon). Everything else keeps the 'pax_table' default and needs no row.

INSERT INTO "public"."voyage_margin_settings" ("voyage_slug", "config_mode")
SELECT DISTINCT td."travel_slug", 'per_date'
FROM "public"."travel_dates" td
WHERE td."margin_override_per_traveler" IS NOT NULL
  AND td."travel_slug" IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM "public"."voyage_margins" vm
      WHERE vm."voyage_slug" = td."travel_slug"
  )
ON CONFLICT ("voyage_slug") DO NOTHING;
