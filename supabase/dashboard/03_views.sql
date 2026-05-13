-- ============================================================================
-- RUN ON: DASHBOARD project
-- Purpose: views combining mirrored (public.*) data + client enrichment.
-- Add KPI matviews as needed; refresh strategy at bottom of file.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS dashboard;

-- ---------------------------------------------------------------------------
-- Deal-centric view: deal + client + travel_date + custom tags / classification
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW dashboard.deals_full AS
SELECT
    d.id,
    d.contact,
    c.email,
    c.firstname,
    c.lastname,
    c.phone,
    c.iso_contact          AS client_iso,
    c.tags                 AS client_tags,
    d.title,
    d.status,
    d.stage,
    d.pipeline_id,
    d.seller,
    d.source,
    d.acquisition_source,
    d.utm,
    d.slug                 AS voyage_slug,
    d.current_step,
    d.country,
    d.iso,
    d.travel_type,
    d.is_couple,
    d.indiv_room,
    d.include_flight,
    d.is_cap_exploraction,
    d.nb_traveler,
    d.nb_adults,
    d.nb_children,
    d.nb_teen,
    d.total_value,
    d.price_per_traveler,
    d.deposit_price,
    d.indiv_room_price,
    d.extension_price,
    d.flight_ticket_price_per_traveler,
    d.insurance_price_per_traveler,
    d.applied_promo_per_traveler,
    d.promo_earlybird,
    d.promo_last_minute,
    d.got_earlybird,
    d.got_last_minute,
    d.rest_to_pay,
    d.total_paid,
    d.margin_per_traveler,
    d.flight_margin,
    d.total_margin,
    d.agent_cost,
    d.lost_reason,
    d.departure_date,
    d.return_date,
    d.conversion_date,
    d.forecasted_closing_date,
    d.created_at,
    d.mdate,
    d.win_probability,
    cls.classification     AS client_classification,
    cls.priority           AS classification_priority
FROM public.activecampaign_deals d
LEFT JOIN public.activecampaign_clients c ON c.contact = d.contact
LEFT JOIN client.deal_classifications cls ON cls.deal_id = d.id;

-- ---------------------------------------------------------------------------
-- Booking-centric view: travel_date + bookings + linked deals
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW dashboard.bookings_full AS
SELECT
    bd.id                AS booking_id,
    bd.deal_id,
    bd.travel_date_id,
    bd.booked_places,
    bd.payment_type,
    bd.is_option,
    bd.expiracy_date,
    bd.transaction_id,
    bd.created_at        AS booking_created_at,
    td.travel_slug,
    td.departure_date,
    td.return_date,
    td.max_travelers,
    td.min_travelers,
    td.booked_seat       AS travel_date_total_booked,
    td.starting_price,
    td.status            AS travel_date_status,
    td.published         AS travel_date_published,
    d.status             AS deal_status,
    d.total_value        AS deal_total_value,
    d.total_paid         AS deal_total_paid,
    d.contact            AS contact_id,
    c.email,
    c.firstname,
    c.lastname
FROM public.booked_dates bd
LEFT JOIN public.travel_dates td          ON td.id = bd.travel_date_id
LEFT JOIN public.activecampaign_deals d   ON d.id = bd.deal_id
LEFT JOIN public.activecampaign_clients c ON c.contact = d.contact
WHERE bd.deleted = false AND bd.is_test = false;

-- ---------------------------------------------------------------------------
-- Materialized: monthly revenue by acquisition source
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard.monthly_revenue_by_source AS
SELECT
    date_trunc('month', conversion_date)::date AS month,
    COALESCE(acquisition_source, source, 'unknown') AS channel,
    count(*)                                   AS deals_won,
    sum(total_value)                           AS gross_revenue,
    sum(total_margin)                          AS total_margin,
    sum(nb_traveler)                           AS total_travelers
FROM public.activecampaign_deals
WHERE status = 'Gagné' AND conversion_date IS NOT NULL
GROUP BY 1, 2;

CREATE UNIQUE INDEX IF NOT EXISTS monthly_revenue_by_source_uk
    ON dashboard.monthly_revenue_by_source (month, channel);

-- ---------------------------------------------------------------------------
-- Materialized: voyage performance (per slug)
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard.voyage_performance AS
SELECT
    slug                                       AS voyage_slug,
    count(*) FILTER (WHERE status = 'Gagné')   AS deals_won,
    count(*) FILTER (WHERE status = 'Perdu')   AS deals_lost,
    count(*) FILTER (WHERE status = 'Ouvert')  AS deals_open,
    sum(total_value) FILTER (WHERE status = 'Gagné') AS won_revenue,
    sum(total_margin) FILTER (WHERE status = 'Gagné') AS won_margin,
    sum(nb_traveler) FILTER (WHERE status = 'Gagné') AS travelers_won,
    avg(price_per_traveler) FILTER (WHERE status = 'Gagné') AS avg_price_per_traveler
FROM public.activecampaign_deals
WHERE slug IS NOT NULL
GROUP BY slug;

CREATE UNIQUE INDEX IF NOT EXISTS voyage_performance_uk
    ON dashboard.voyage_performance (voyage_slug);

-- ---------------------------------------------------------------------------
-- Materialized: upcoming departures with occupancy
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard.upcoming_departures AS
SELECT
    td.id                              AS travel_date_id,
    td.travel_slug,
    td.departure_date,
    td.return_date,
    td.min_travelers,
    td.max_travelers,
    td.booked_seat,
    CASE
        WHEN td.max_travelers > 0
            THEN round((td.booked_seat::numeric / td.max_travelers) * 100, 1)
        ELSE NULL
    END                                AS occupancy_pct,
    td.starting_price,
    td.status,
    count(bd.id) FILTER (WHERE bd.deleted = false)         AS active_bookings,
    sum(d.total_value) FILTER (WHERE d.status = 'Gagné')    AS confirmed_revenue
FROM public.travel_dates td
LEFT JOIN public.booked_dates bd        ON bd.travel_date_id = td.id AND bd.is_test = false
LEFT JOIN public.activecampaign_deals d ON d.id = bd.deal_id
WHERE td.departure_date >= current_date
  AND td.deleted = false
  AND td.is_test = false
  AND td.published = true
GROUP BY td.id;

CREATE UNIQUE INDEX IF NOT EXISTS upcoming_departures_uk
    ON dashboard.upcoming_departures (travel_date_id);

-- ---------------------------------------------------------------------------
-- Scheduled refresh (requires pg_cron extension, enabled by default on Supabase)
-- ---------------------------------------------------------------------------
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'refresh-dashboard-matviews',
    '*/15 * * * *',
    $$
        REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard.monthly_revenue_by_source;
        REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard.voyage_performance;
        REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard.upcoming_departures;
    $$
);

GRANT USAGE ON SCHEMA dashboard TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA dashboard TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA dashboard
    GRANT SELECT ON TABLES TO authenticated;
