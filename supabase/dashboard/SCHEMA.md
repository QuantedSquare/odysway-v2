# Odysway Dashboard Database — Schema Reference

Reference for the Odysway analytics dashboard Supabase project. This DB is a near-real-time mirror of the production booking/CRM database, plus client-writable enrichment tables and pre-built analytics views. Use this document to write SQL queries that power visualisations and KPIs.

## Connection & conventions

- **Engine**: PostgreSQL 15+ (Supabase hosted).
- **Read-only role**: query the `public.*` and `dashboard.*` schemas. Do not write to `public.*` (those rows are overwritten by replication from prod).
- **Writable role**: insert/update/delete in `client.*` only.
- **Language of business data**: French. Status values, classifications, lost reasons, etc. are stored in French.
- **Money**: all monetary columns are in **EUR**, stored as decimal numbers (e.g. `1872.51`), not cents. Already divided by 100 at ingestion time.
- **Dates**: `created_at`, `updated_at`, `mdate` are `timestamptz` (UTC). `departure_date`, `return_date`, `expiracy_date` are `date` (no time).
- **NULL semantics**: most columns are nullable; mirror tables preserve NULL when AC has no value.

## Schemas overview

| Schema       | Purpose                                | Writable? |
|--------------|----------------------------------------|-----------|
| `public`     | Read-only mirror of prod (CRM + booking) | No        |
| `client`     | Client-writable enrichment (targets, tags, notes) | Yes |
| `dashboard`  | Pre-built views & materialized views   | Read-only |

---

## `public` — Mirror tables (read-only)

### `public.activecampaign_deals`
A row per CRM deal (booking quote or sale). Source of truth for revenue, margin, conversions, and acquisition channels.

| Column | Type | Description |
|---|---|---|
| `id` | bigint | Deal ID (AC). Part of composite PK with `contact`. |
| `contact` | bigint | Foreign key to `activecampaign_clients.contact`. |
| `title` | varchar | Deal title (often voyage name + traveler). |
| `status` | varchar | One of `'Ouvert'`, `'Gagné'`, `'Perdu'`, `'Supprimé'`. |
| `stage` | varchar | Sales stage name (free-form). |
| `stage_id` | text | AC stage numeric id. |
| `pipeline_id` | smallint | `1` = main sales pipeline, `3` = trash. Pipeline `4` (Gestions Départs) is excluded from the mirror. |
| `pipeline_title` | text | Human-readable pipeline name (e.g. "Voyages en cours"). |
| `owner_id` | text | AC owner id (sales rep). |
| `seller` | varchar | Display name of sales rep (e.g. "Jean Dupont"). |
| `currency` | text | Usually `'eur'`. |
| `win_probability` | smallint | 0–100. Set by AC. |
| `total_value` | numeric | Total deal value in EUR. |
| `price_per_traveler` | numeric | Base price per traveler. |
| `deposit_price` | numeric | Down-payment amount per traveler. |
| `indiv_room_price` | numeric | Single-room supplement per traveler. |
| `extension_price` | numeric | Optional extension per traveler. |
| `flight_ticket_price_per_traveler` | numeric | Flight cost per traveler. |
| `insurance_price_per_traveler` | numeric | Insurance cost per traveler. |
| `insurance_commission` | numeric | Commission earned on insurance. |
| `agent_cost` | numeric | Local agent purchase cost. Subtract from total to get true margin. |
| `nb_traveler` | numeric | Total travelers. |
| `nb_adults`, `nb_children`, `nb_teen`, `nb_under_age` | numeric | Demographic breakdown. |
| `applied_promo_per_traveler` | numeric | Promo applied per traveler. |
| `children_promo`, `promo_earlybird`, `promo_last_minute` | numeric | Promotion amounts. |
| `got_earlybird`, `got_last_minute` | boolean | Whether the promo was actually applied. |
| `promo_code` | varchar | Code used at checkout. |
| `total_paid` | numeric | Amount already paid by the customer. |
| `rest_to_pay` | numeric | Outstanding balance. |
| `rest_to_pay_per_traveler` | numeric | Per-pax outstanding. |
| `margin_per_traveler` | numeric | Margin per traveler. |
| `flight_margin` | numeric | Margin on the flight portion. |
| `total_margin` | numeric | Total deal margin. |
| `travel_type` | varchar | E.g. `'Voyage de Groupe'`, `'Voyage Individuel'`. |
| `country` | varchar | Destination country (label). |
| `iso` | varchar | ISO country code (e.g. `'PE'`, `'JP'`). |
| `zone_chapka` | numeric | Insurance zone id. |
| `slug` | text | Voyage slug — joins to a logical voyage entity. |
| `current_step` | text | Funnel step at last update. |
| `is_couple` | boolean | Couple booking flag. |
| `indiv_room` | boolean | Wants single room. |
| `is_cap_exploraction` | boolean | Premium insurance product chosen. |
| `include_flight` | boolean | Flight included in the package. |
| `flight_ticket_bought` | boolean | Operational: tickets purchased? |
| `max_children_age` | smallint | Eligibility threshold for child promo. |
| `insurance_choice` | varchar | Free-form insurance label. |
| `source` | varchar | Free-form source (legacy). |
| `acquisition_source` | text | Structured acquisition source (multi-select label). |
| `other_acquisition_source` | text | Free-form fallback when `acquisition_source` is "Autre". |
| `utm` | text | Raw UTM string. |
| `paiement_method` | varchar | Payment method label. |
| `lost_reason` | varchar | Set when `status='Perdu'`. |
| `departure_date`, `return_date` | timestamp | Travel dates. |
| `forecasted_closing_date` | timestamp | Sales forecast date. |
| `conversion_date` | timestamp | When the deal moved to "Gagné". Use this for revenue cohorts. |
| `next_date` | timestamptz | Next scheduled task on the deal. |
| `next_task_id` | text | AC task id. |
| `link_bms` | text | Link to internal Booking Management System. |
| `created_at` | timestamptz | Deal creation time. |
| `mdate` | timestamptz | Last modification time (AC source). |
| `updated_at` | timestamptz | Mirror-side timestamp. |

**Notes for analytics**:
- For revenue, filter by `status = 'Gagné'`.
- For acquisition reporting, prefer `acquisition_source` over `source` (the latter is legacy free-form). Fallback chain: `COALESCE(acquisition_source, source, 'unknown')`.
- Test deals are filtered out at ingestion (`ottmann.alex@gmail.com`, `test@gmail.com`).

### `public.activecampaign_clients`
A row per CRM contact (customer).

| Column | Type | Description |
|---|---|---|
| `id` | bigint | Internal id. Part of composite PK with `email`. |
| `contact` | bigint | AC contact id. **Use this column to join with `activecampaign_deals.contact`.** Has UNIQUE constraint. |
| `email` | varchar | Email address. Always present. |
| `firstname`, `lastname` | varchar | Names. |
| `phone` | text | Phone number. |
| `birthdate` | timestamp | Date of birth. |
| `city`, `zip_code`, `address` | varchar/bigint/text | Postal info (often partial). |
| `iso_contact` | text | Client's country ISO. |
| `tags` | text[] | AC tag labels assigned to the contact. |
| `optin_newsletter` | boolean | Newsletter subscription flag. |
| `created_at`, `mdate`, `updated_at` | timestamptz | Timestamps. |

### `public.travel_dates`
Departure slots for each voyage. One row per (voyage, departure date).

| Column | Type | Description |
|---|---|---|
| `id` | uuid | PK. |
| `travel_slug` | varchar | Voyage slug — joins to `activecampaign_deals.slug` logically. |
| `departure_date`, `return_date` | date | Travel dates. |
| `min_travelers`, `max_travelers` | int | Operational capacity bounds. |
| `booked_seat` | int | Actual booked seats (sum across `booked_dates`). |
| `starting_price`, `flight_price` | numeric | Display prices. |
| `include_flight`, `early_bird`, `last_minute`, `is_custom_travel`, `is_indiv_travel` | boolean | Flags. |
| `published` | boolean | Visible on the website. |
| `status` | text | Operational status (e.g. `'open'`, `'guaranteed'`, `'cancelled'`). |
| `closing_days` | bigint | Days before departure when booking closes. |
| `displayed_*` columns | mixed | Override values shown to users when `custom_display = true`. For reporting, use the non-displayed versions. |
| `departure_id` | text | Links to the AC departure deal (in pipeline 4, not in this DB). |
| `bms_reference`, `travel_type_prefix` | text | Operational metadata. |
| `co_filling` | int | Co-filling seats. |
| `deleted`, `is_test` | boolean | Filter these out in reports. |
| `created_at`, `updated_at` | timestamptz | Timestamps. |

### `public.booked_dates`
One row per booking (deal ↔ travel_date).

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Part of composite PK with `deal_id`. |
| `deal_id` | bigint | UNIQUE. Joins to `activecampaign_deals.id`. |
| `travel_date_id` | uuid | Joins to `travel_dates.id`. |
| `booked_places` | bigint | Seats consumed by this booking. |
| `payment_type` | text | `'deposit'`, `'full'`, `'balance'`, `'custom'`. |
| `transaction_id` | text | Stripe or Alma transaction id. |
| `is_option` | boolean | Reservation option (not yet paid). |
| `expiracy_date` | date | Option expiry. |
| `deleted`, `is_test` | boolean | Filter out in reports. |
| `created_at` | timestamptz | Booking creation time. |

---

## `client` — Writable enrichment

These tables are managed by the dashboard user / client AI agent. They never get overwritten by replication. Use them to layer custom business logic on top of the mirrored data.

### `client.sales_targets`
Monthly/quarterly/yearly targets per metric.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | PK. |
| `period` | date | First day of the period. |
| `granularity` | text | `'month'`, `'quarter'`, `'year'`. |
| `metric` | text | E.g. `'revenue'`, `'deals_won'`, `'avg_basket'`. Free-form. |
| `target` | numeric | Target value. |
| `owner` | text | Optional: seller email or team. |
| `notes` | text | |

UNIQUE on `(period, granularity, metric, owner)`.

### `client.custom_tags`
Free-form tags the client attaches to a deal.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | PK. |
| `deal_id` | bigint | Joins to `public.activecampaign_deals.id`. |
| `tag` | text | Label. |
| `color` | text | Hex color for UI. |
| `created_by`, `created_at` | text/timestamptz | |

UNIQUE on `(deal_id, tag)`. Indexed on `deal_id`, `tag`.

### `client.deal_classifications`
Manual single-classification per deal (VIP, repeat, complaint, etc.).

| Column | Type | Description |
|---|---|---|
| `deal_id` | bigint | PK. |
| `classification` | text | E.g. `'VIP'`, `'Repeat customer'`. |
| `priority` | smallint | Sort/severity. |
| `set_by`, `set_at` | text/timestamptz | |

### `client.dashboard_comments`
Notes on dashboard entities.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | PK. |
| `entity_type` | text | One of `'deal'`, `'voyage'`, `'travel_date'`, `'client'`. |
| `entity_id` | text | The entity id (cast to text). |
| `author` | text | |
| `content` | text | |
| `created_at` | timestamptz | |

### `client.voyage_costs`
Operational cost overrides for margin calculation when AC data is incomplete.

| Column | Type | Description |
|---|---|---|
| `travel_slug` | text | PK — joins to `activecampaign_deals.slug` / `travel_dates.travel_slug`. |
| `base_cost`, `flight_cost`, `other_cost` | numeric | Cost components in EUR. |
| `cost_currency` | text | Default `'EUR'`. |
| `notes` | text | |
| `updated_at` | timestamptz | |

---

## `dashboard` — Pre-built views

Use these first; only query `public.*` directly for fields not yet exposed.

### `dashboard.deals_full` (view)
Deal + client + classification join. One row per deal, with the most relevant analytics columns. Use this for any deal-level reporting.

Joins: `activecampaign_deals` ⟕ `activecampaign_clients` ⟕ `client.deal_classifications`.

Notable columns (in addition to those from `activecampaign_deals`):
- `email`, `firstname`, `lastname`, `phone`, `client_iso`, `client_tags`
- `voyage_slug` (alias of `slug`)
- `client_classification`, `classification_priority`

### `dashboard.bookings_full` (view)
Booking-centric: one row per `booked_dates` joined to travel_date, deal, and client. Filters out `deleted` and `is_test`.

Use for occupancy reports, payment status, departure cohorts.

### `dashboard.monthly_revenue_by_source` (matview)
Monthly aggregation of won deals by acquisition channel.

| Column | Type | Description |
|---|---|---|
| `month` | date | First day of the month. |
| `channel` | text | `COALESCE(acquisition_source, source, 'unknown')`. |
| `deals_won` | bigint | Count. |
| `gross_revenue` | numeric | Sum of `total_value`. |
| `total_margin` | numeric | Sum of `total_margin`. |
| `total_travelers` | numeric | Sum of `nb_traveler`. |

Refreshed every 15 minutes via `pg_cron`.

### `dashboard.voyage_performance` (matview)
Per-voyage funnel.

| Column | Description |
|---|---|
| `voyage_slug` | Voyage slug. |
| `deals_won`, `deals_lost`, `deals_open` | Counts by status. |
| `won_revenue`, `won_margin` | Sums of value/margin for won deals. |
| `travelers_won` | Sum of `nb_traveler` for won deals. |
| `avg_price_per_traveler` | Average price for won deals. |

### `dashboard.upcoming_departures` (matview)
Departures from today onward, with occupancy.

| Column | Description |
|---|---|
| `travel_date_id` | Travel date PK. |
| `travel_slug`, `departure_date`, `return_date` | |
| `min_travelers`, `max_travelers`, `booked_seat` | |
| `occupancy_pct` | `booked_seat / max_travelers * 100` (rounded to 1 decimal). |
| `starting_price`, `status` | From `travel_dates`. |
| `active_bookings` | Count of non-deleted bookings. |
| `confirmed_revenue` | Sum of `total_value` for won deals on this departure. |

---

## Logical relationships (no FK enforced on mirror)

```
activecampaign_clients (contact PK)
   └──< activecampaign_deals (contact)
            └──< booked_dates (deal_id)
                       └── travel_dates (travel_date_id)

activecampaign_deals.slug  ─── logically links to ──→  travel_dates.travel_slug
```

Foreign keys are NOT enforced on the mirror (replication-friendly). Join on the column names above.

---

## Common query recipes

### Monthly revenue (won deals) for current year
```sql
SELECT date_trunc('month', conversion_date)::date AS month,
       sum(total_value) AS revenue,
       count(*)         AS deals_won
FROM public.activecampaign_deals
WHERE status = 'Gagné'
  AND conversion_date >= date_trunc('year', current_date)
GROUP BY 1
ORDER BY 1;
```

### Revenue vs. target (uses `client.sales_targets`)
```sql
SELECT t.period,
       t.target,
       coalesce(r.revenue, 0) AS actual,
       round(coalesce(r.revenue, 0) / t.target * 100, 1) AS pct_attained
FROM client.sales_targets t
LEFT JOIN (
    SELECT date_trunc('month', conversion_date)::date AS month,
           sum(total_value) AS revenue
    FROM public.activecampaign_deals
    WHERE status = 'Gagné'
    GROUP BY 1
) r ON r.month = t.period
WHERE t.granularity = 'month' AND t.metric = 'revenue'
ORDER BY t.period;
```

### Top 10 voyages by margin (last 12 months)
```sql
SELECT voyage_slug, won_margin, deals_won, travelers_won
FROM dashboard.voyage_performance
WHERE voyage_slug IN (
    SELECT slug FROM public.activecampaign_deals
    WHERE status = 'Gagné'
      AND conversion_date >= current_date - interval '12 months'
)
ORDER BY won_margin DESC NULLS LAST
LIMIT 10;
```

### Upcoming departures at risk (occupancy < min_travelers within 30 days)
```sql
SELECT travel_slug, departure_date, booked_seat, min_travelers,
       (min_travelers - booked_seat) AS missing_pax
FROM dashboard.upcoming_departures
WHERE departure_date <= current_date + interval '30 days'
  AND booked_seat < min_travelers
ORDER BY departure_date;
```

### UTM channel attribution
```sql
SELECT month, channel, deals_won, gross_revenue, total_margin
FROM dashboard.monthly_revenue_by_source
WHERE month >= date_trunc('year', current_date)
ORDER BY month DESC, gross_revenue DESC;
```

### Customer LTV (top spenders)
```sql
SELECT c.contact, c.email, c.firstname, c.lastname,
       count(d.id)                            AS deals,
       sum(d.total_value) FILTER (WHERE d.status = 'Gagné') AS lifetime_revenue
FROM public.activecampaign_clients c
JOIN public.activecampaign_deals  d ON d.contact = c.contact
GROUP BY c.contact, c.email, c.firstname, c.lastname
HAVING sum(d.total_value) FILTER (WHERE d.status = 'Gagné') > 0
ORDER BY lifetime_revenue DESC
LIMIT 50;
```

### Conversion funnel
```sql
SELECT status, count(*) AS deals, sum(total_value) AS total_value
FROM public.activecampaign_deals
WHERE created_at >= current_date - interval '90 days'
GROUP BY status
ORDER BY array_position(ARRAY['Ouvert','Gagné','Perdu','Supprimé'], status);
```

### Tagged deals (uses `client.custom_tags`)
```sql
SELECT t.tag, count(*) AS tagged_deals,
       sum(d.total_value) AS tagged_revenue
FROM client.custom_tags t
JOIN public.activecampaign_deals d ON d.id = t.deal_id
WHERE d.status = 'Gagné'
GROUP BY t.tag
ORDER BY tagged_revenue DESC;
```

---

## Tips for the AI agent

- **Filter test/deleted data** when querying mirror tables: `WHERE deleted = false AND is_test = false` on `travel_dates` and `booked_dates`. Activecampaign tables have no such flag (test deals are pre-filtered at ingestion).
- **Pipeline 4** (Gestions Départs) deals are not in this DB at all.
- **Refresh staleness**: matviews refresh every 15 min. If sub-15-min freshness is needed, query the underlying tables directly.
- **Status values are French** (`'Gagné'` not `'Won'`). Always compare to the French literal.
- **Don't write to `public.*`** — changes will be overwritten by the next webhook event from prod.
- **Use `dashboard.deals_full` / `bookings_full`** for joins that span deals + clients + classifications; they're maintained centrally.
