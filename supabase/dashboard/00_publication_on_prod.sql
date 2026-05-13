-- ============================================================================
-- RUN ON: PROD Supabase project (ufyskkwszklmrgcifanb)
-- Purpose: expose tables to the dashboard project via logical replication
-- Prereq:  Supabase plan must support wal_level=logical (Pro and above).
--          Confirm with: SHOW wal_level;  -- must return 'logical'
-- ============================================================================

-- Replica identity FULL ensures UPDATE/DELETE on the subscriber side
-- can locate rows even on tables whose primary key is composite.
ALTER TABLE "public"."activecampaign_deals"   REPLICA IDENTITY FULL;
ALTER TABLE "public"."activecampaign_clients" REPLICA IDENTITY FULL;
ALTER TABLE "public"."travel_dates"           REPLICA IDENTITY FULL;
ALTER TABLE "public"."booked_dates"           REPLICA IDENTITY FULL;

DROP PUBLICATION IF EXISTS dashboard_pub;

CREATE PUBLICATION dashboard_pub FOR TABLE
    "public"."activecampaign_deals",
    "public"."activecampaign_clients",
    "public"."travel_dates",
    "public"."booked_dates"
WITH (publish = 'insert, update, delete');

-- Dedicated replication user (give the password to the dashboard subscription).
-- If the user already exists, only the password is reset.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dashboard_replicator') THEN
        CREATE ROLE dashboard_replicator WITH LOGIN REPLICATION
            PASSWORD 'CHANGE_ME_BEFORE_RUNNING';
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO dashboard_replicator;
GRANT SELECT ON
    "public"."activecampaign_deals",
    "public"."activecampaign_clients",
    "public"."travel_dates",
    "public"."booked_dates"
TO dashboard_replicator;
