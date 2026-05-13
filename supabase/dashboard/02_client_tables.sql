-- ============================================================================
-- RUN ON: DASHBOARD project
-- Purpose: client-writable enrichment tables. These live in a dedicated
-- `client` schema, completely separate from the replicated `public` mirror.
-- The client can read/write/alter freely here without breaking replication.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS client;

-- Monthly / yearly sales targets (revenue, conversions, custom KPI)
CREATE TABLE IF NOT EXISTS client.sales_targets (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    period      date    NOT NULL,                       -- first day of the period
    granularity text    NOT NULL CHECK (granularity IN ('month', 'quarter', 'year')),
    metric      text    NOT NULL,                       -- e.g. 'revenue', 'deals_won', 'avg_basket'
    target      numeric NOT NULL,
    owner       text,                                   -- optional: seller email or team
    notes       text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (period, granularity, metric, owner)
);

-- Free-form tags the client can attach to a deal (segmentation, follow-up, etc.)
CREATE TABLE IF NOT EXISTS client.custom_tags (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id    bigint NOT NULL,
    tag        text   NOT NULL,
    color      text,
    created_by text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (deal_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_custom_tags_deal_id ON client.custom_tags (deal_id);
CREATE INDEX IF NOT EXISTS idx_custom_tags_tag     ON client.custom_tags (tag);

-- Manual deal classifications (VIP, repeat customer, complaint, etc.)
CREATE TABLE IF NOT EXISTS client.deal_classifications (
    deal_id        bigint PRIMARY KEY,
    classification text NOT NULL,
    priority       smallint,
    set_by         text,
    set_at         timestamptz NOT NULL DEFAULT now()
);

-- Dashboard comments — notes on deals, voyages, departures
CREATE TABLE IF NOT EXISTS client.dashboard_comments (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL CHECK (entity_type IN ('deal', 'voyage', 'travel_date', 'client')),
    entity_id   text NOT NULL,
    author      text NOT NULL,
    content     text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dashboard_comments_entity
    ON client.dashboard_comments (entity_type, entity_id);

-- Voyage cost overrides (when AC doesn't have the full operational cost)
CREATE TABLE IF NOT EXISTS client.voyage_costs (
    travel_slug    text PRIMARY KEY,
    base_cost      numeric,
    flight_cost    numeric,
    other_cost     numeric,
    cost_currency  text DEFAULT 'EUR',
    notes          text,
    updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Permissions (let authenticated dashboard user manage everything in client schema)
GRANT USAGE ON SCHEMA client TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA client TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA client TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA client
    GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA client
    GRANT ALL ON SEQUENCES TO authenticated;
