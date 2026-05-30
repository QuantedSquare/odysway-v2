-- Feature: BMS margin tracking + supplier invoices per travel date.
-- - voyage_margins: PAX margin table per voyage (Pattern A)
-- - travel_dates.margin_override_per_traveler: fixed margin override per date (Pattern B)
-- - travel_dates.real_traveler_count_override: manual override of the real traveler count
-- - date_invoices: supplier invoice files + amount per travel date
--
-- Note: the Supabase storage bucket "date-invoices" must be created via the
-- Supabase dashboard (or storage SQL extension) since the storage schema is
-- not managed by these SQL migrations. See existing "date-attachments" bucket
-- for reference.

-- =========================================================================
-- voyage_margins: per-voyage PAX margin table (Pattern A)
-- =========================================================================

CREATE TABLE IF NOT EXISTS "public"."voyage_margins" (
    "id"                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
    "voyage_slug"         text                     NOT NULL,
    "pax"                 integer                  NOT NULL,
    "margin_per_traveler" numeric,
    "updated_at"          timestamp with time zone DEFAULT now(),
    "updated_by"          text,
    CONSTRAINT "voyage_margins_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "voyage_margins_voyage_slug_pax_key" UNIQUE ("voyage_slug", "pax"),
    CONSTRAINT "voyage_margins_pax_check" CHECK ("pax" > 0)
);

CREATE INDEX IF NOT EXISTS "voyage_margins_voyage_slug_idx"
    ON "public"."voyage_margins" ("voyage_slug");

-- =========================================================================
-- travel_dates: per-date override fields
-- =========================================================================

ALTER TABLE "public"."travel_dates"
    ADD COLUMN IF NOT EXISTS "margin_override_per_traveler" numeric,
    ADD COLUMN IF NOT EXISTS "real_traveler_count_override" integer;

-- =========================================================================
-- date_invoices: supplier invoices (file + amount) per travel date
-- =========================================================================

CREATE TABLE IF NOT EXISTS "public"."date_invoices" (
    "id"             uuid                     DEFAULT gen_random_uuid() NOT NULL,
    "travel_date_id" uuid                     NOT NULL,
    "file_name"      text                     NOT NULL,
    "file_size"      integer                  NOT NULL,
    "mime_type"      text                     NOT NULL,
    "storage_path"   text                     NOT NULL,
    "amount"         numeric                  NOT NULL,
    "label"          text,
    "uploaded_by"    text,
    "created_at"     timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "date_invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "date_invoices_travel_date_id_fkey"
        FOREIGN KEY ("travel_date_id") REFERENCES "public"."travel_dates"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "date_invoices_travel_date_id_idx"
    ON "public"."date_invoices" ("travel_date_id");
