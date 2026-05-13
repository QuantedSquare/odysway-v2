-- Enrichment of activecampaign_deals / activecampaign_clients for the analytics dashboard
-- and idempotency table for ActiveCampaign webhooks.

-- =========================================================================
-- activecampaign_deals: marketing, pricing, promos, operationnel, metadata
-- =========================================================================

ALTER TABLE "public"."activecampaign_deals"
    ADD COLUMN IF NOT EXISTS "updated_at"               timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "mdate"                    timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "slug"                     text,
    ADD COLUMN IF NOT EXISTS "current_step"             text,
    ADD COLUMN IF NOT EXISTS "utm"                      text,
    ADD COLUMN IF NOT EXISTS "acquisition_source"       text,
    ADD COLUMN IF NOT EXISTS "other_acquisition_source" text,
    ADD COLUMN IF NOT EXISTS "extension_price"          numeric,
    ADD COLUMN IF NOT EXISTS "indiv_room_price"         numeric,
    ADD COLUMN IF NOT EXISTS "deposit_price"            numeric,
    ADD COLUMN IF NOT EXISTS "agent_cost"               numeric,
    ADD COLUMN IF NOT EXISTS "promo_earlybird"          numeric,
    ADD COLUMN IF NOT EXISTS "got_earlybird"            boolean,
    ADD COLUMN IF NOT EXISTS "promo_last_minute"        numeric,
    ADD COLUMN IF NOT EXISTS "got_last_minute"          boolean,
    ADD COLUMN IF NOT EXISTS "nb_teen"                  numeric,
    ADD COLUMN IF NOT EXISTS "nb_under_age"             numeric,
    ADD COLUMN IF NOT EXISTS "forecasted_closing_date"  timestamp without time zone,
    ADD COLUMN IF NOT EXISTS "is_cap_exploraction"      boolean,
    ADD COLUMN IF NOT EXISTS "flight_ticket_bought"     boolean,
    ADD COLUMN IF NOT EXISTS "zone_chapka"              numeric,
    ADD COLUMN IF NOT EXISTS "link_bms"                 text,
    ADD COLUMN IF NOT EXISTS "include_flight"           boolean,
    ADD COLUMN IF NOT EXISTS "currency"                 text,
    ADD COLUMN IF NOT EXISTS "owner_id"                 text,
    ADD COLUMN IF NOT EXISTS "stage_id"                 text,
    ADD COLUMN IF NOT EXISTS "win_probability"          smallint,
    ADD COLUMN IF NOT EXISTS "next_date"                timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "next_task_id"             text;

-- =========================================================================
-- activecampaign_clients: phone, country, tags, address, mdate, optin
-- =========================================================================

ALTER TABLE "public"."activecampaign_clients"
    ADD COLUMN IF NOT EXISTS "phone"             text,
    ADD COLUMN IF NOT EXISTS "iso_contact"       text,
    ADD COLUMN IF NOT EXISTS "tags"              text[],
    ADD COLUMN IF NOT EXISTS "address"           text,
    ADD COLUMN IF NOT EXISTS "mdate"             timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "updated_at"        timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "optin_newsletter"  boolean;

-- =========================================================================
-- ac_processed_events: idempotency guard for ActiveCampaign webhooks
-- key format: "<entity>-<id>-<mdate>" e.g. "deal-46-2019-09-06T11:29:48-05:00"
-- =========================================================================

CREATE TABLE IF NOT EXISTS "public"."ac_processed_events" (
    "id"         text                        NOT NULL,
    "created_at" timestamp with time zone    DEFAULT "now"() NOT NULL,
    CONSTRAINT "ac_processed_events_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."ac_processed_events" OWNER TO "postgres";
ALTER TABLE "public"."ac_processed_events" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."ac_processed_events" TO "anon";
GRANT ALL ON TABLE "public"."ac_processed_events" TO "authenticated";
GRANT ALL ON TABLE "public"."ac_processed_events" TO "service_role";
