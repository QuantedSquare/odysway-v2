# Odysway v2

French travel agency booking platform specializing in immersive travel experiences. Single language (French). Production at https://odysway.com.

## Stack

- **Frontend**: Nuxt 4.1.3 (Vue 3), Vuetify 3.11, SCSS (Gordita font)
- **Backend**: Nitro server (integrated with Nuxt), Supabase PostgreSQL
- **CMS**: Sanity v2 (48 schema types, dataset: production, project: nu6yntji)
- **Payments**: Stripe (checkout sessions, webhooks), Alma (BNPL 3x)
- **CRM**: ActiveCampaign (113 custom deal fields, pipelines for sales + departures)
- **Email**: Brevo (transactional emails, newsletter lists)
- **Insurance**: Chapka API (CAP-EXPLORER / CAP-EXPLORACTION products)
- **Search**: Algolia (voyage/destination/region indexing)
- **Analytics**: GTM + GA4, Hotjar
- **Auth**: JWT sessions + Google OAuth (booking management, @odysway.com or superadmins)
- **Hosting**: Vercel with ISR (1-5 day revalidation by route type)

## Project Structure

```
app/
  pages/              # ~30 route files (voyages, destinations, blog, checkout, devis, booking-management...)
  components/         # Vue 3 components (Funnel/, Devis/, content/Voyages/, booking/, OgImage/, tracking/)
  composables/        # ~18 composables (useGtmTracking, useSeo, useStepperDeal, useTravelDates...)
  utils/              # Helpers (bookingApi, voyageBuilders, structuredData, pricing, formatDate...)
  layouts/            # default, homepage, funnel, booking, blank, voyage, simple-pages, no-faq
  middleware/         # booking-management auth, old link redirections
  plugins/            # vuetify.js, analytics.client.ts, vue-dompurify-html.js
  assets/scss/        # main.scss (typography, utilities), _fonts.scss (Gordita)

server/
  api/v1/             # 60+ Nitro API endpoints
    ac/               # ActiveCampaign (contacts CRUD, deals CRUD, webhooks)
    auth/             # Google OAuth login/callback, JWT session check/logout
    booking/          # Travel dates, booked dates, options, availability
    checkout/         # Payment session creation
    stripe/           # Stripe checkout + payment webhooks
    alma/             # Alma BNPL payment creation
    insurance/        # Chapka quote
    webhooks/         # Sanity revalidation, Stripe/Alma callbacks, cronjobs
    search/           # Algolia voyage search, embedding search
    brevo/            # Email operations
  utils/              # Service clients (auto-imported via nitro.imports.dirs)
    activecampaign.js # AC API client (113-field mapping, deal CRUD, price recalculation)
    stripe.js         # Stripe client (checkout sessions, customers, coupons)
    supabase.js       # Supabase client (travel_dates, booked_dates queries)
    booking.js        # Booking logic (status computation, seat management)
    departures.js     # Departure pipeline management
    alma.js           # Alma BNPL client
    chapka.js         # Chapka insurance client (SHA1 auth, quotes, notifications)
    brevo.js          # Brevo email client (contacts, lists, templates)
    algolia.ts        # Algolia indexing
    bookingAuth.js    # JWT auth + Google OAuth helpers
    bookingSession.js # Session management
    types/            # Zod schemas (contact.ts, deal.ts, insurance.ts)

cms/
  schemaTypes/        # 48+ Sanity schema definitions (voyage, destination, blog, checkout...)
  scripts/            # Data migration scripts (historical ButterCMS -> Sanity)
```

## Conventions

- **ESLint**: 2-space indent, single quotes, no semicolons, no trailing commas, eqeqeq, require-await
- **Vue SFC order**: `<template>` then `<script setup>` then `<style scoped>`
- **Composables**: `use` prefix, .js files, return object with refs/functions
- **API routes**: Nitro file-based routing with verb suffix (`.get.js`, `.post.ts`)
- **Validation**: Zod schemas in `server/utils/types/`
- **Money**: All monetary values in euro CENTS (integers), never floats
- **Images**: `<NuxtImg>` with sanity provider, always set width/sizes for responsive
- **Data fetching**: `useSanity()` + `groq` for CMS, internal API via fetch/apiRequest
- **All user-facing text**: French, no i18n library, content from Sanity or hardcoded

## Key Business Flows

1. **Booking funnel**: Voyage page -> Select date -> Devis form (traveler info) -> Creates AC deal + booked_date in Supabase -> Checkout (Stripe or Alma) -> Confirmation
2. **Payment types**: deposit (30% + insurance), full, balance (remaining), custom
3. **Post-payment webhook cascade**: Stripe checkout.completed -> update Supabase booked_dates -> update AC deal value -> notify Chapka insurance -> send Slack alert
4. **Booking management**: Internal dashboard at /booking-management (Google OAuth, @odysway.com only)
5. **Content publishing**: Sanity update -> webhook -> Vercel ISR revalidation + Algolia index sync
6. **Departure management**: AC pipeline 4 (Gestions Departs), auto-creates departure deals, links travelers

## Pipeline logic — the most important concept

`pipeline_id` is the primary segmentation axis for deals. Understand this before writing any dashboard.

| `pipeline_id` | `pipeline_title` | Meaning |
|---|---|---|
| `1` | Prospects | Prospects pipeline. A deal here represents a traveler who has expressed interest (quote request, contact form, etc.) but has not yet paid. |
| `2` | Voyageurs | Converted client pipeline. A deal moves here when the client makes their **first payment**. This is the authoritative signal for a conversion. |
| `3` | Corbeille | Trash / archived. Exclude from all reports. |
| `4` | Gestions Départs | Operational departure management. **these deals do not exist in supabase datatable.** |

## ISR revalidation (Sanity -> deployed site)

Production serves every public page through Vercel ISR with 1 to 5 day TTLs
(`nuxt.config.ts` routeRules), so a Sanity change is only visible once the affected
paths are revalidated. The pipeline is path-based, never live-content: `liveContent`
stays off in production on purpose.

**Blast radius decides everything.** `server/utils/revalidationRegistry.ts` classifies
each of the 44 document types once:

| scope | meaning | example |
|---|---|---|
| `page` | owns fixed paths (`refs: true` also expands the reference graph) | `voyage`, `blog`, `homePage` |
| `collection` | settings document affecting a whole route family | `page_voyage` -> all `/voyages/*` |
| `refs` | no page of its own, resolved through references (both directions) | `badge`, `blogCategory` |
| `global` | rendered by a layout / header / footer, so present on every page | `siteBanner`, `header`, `review`, `tops` |
| `none` | nothing cached depends on it | `checkout` (rendered per request) |

An unknown type falls back to `global` (a full sweep) instead of silently doing
nothing — the bug that kept `siteBanner` stale for a day after each edit.
`npm run check:revalidation` fails if a document type is not classified.

**Flow**

1. `POST /api/v1/webhooks/sanity/revalidate` — drafts skipped, then
   `waitForSanityRevision()` blocks until the client a page render uses (the API CDN
   in production) actually serves the new `_rev`. Skipping this re-caches the OLD
   content for a full day.
2. `page` / `collection` / `refs` -> the resolved paths are revalidated inline
   (concurrency 8, capped at 60 paths).
3. `global` -> a **sweep** job walks all ~470 ISR paths in chunks of 40, one Vercel
   invocation per chunk, chained by `POST .../sanity/sweep`. A Supabase lock
   (`revalidation_jobs`, partial unique index on `status = 'running'`) allows a single
   sweep at a time; a burst of edits asks the running sweep for another pass instead
   of starting a second one. A resolution over 60 paths (`page_voyage` -> 97 voyage
   pages) runs through the same job machinery but **scoped** to those paths.
4. `GET .../sanity/nightly-revalidation` (cron, `x-cron-secret` or
   `Authorization: Bearer $CRON_SECRET`) re-sweeps daily — the hard floor that makes
   a lost webhook cost at most one day.
5. `GET .../sanity/revalidation-status` (same secrets) shows recent jobs and events.
   Read it in this order: `known_type: false`, `mode: 'none'`, `revision_confirmed: false`,
   `stale > 0` (bypass token not honoured, page served from cache).

Revalidation only ever targets production (preprod has no ISR at all) and never
appends `/_payload.json` (`payloadExtraction` is false in production).

**Site banner** is the one piece of global content that also reconciles client-side:
the ISR HTML renders the cached copy, then `SiteBanner.vue` re-reads
`/api/v1/globals/banner` (edge-cached 60s, outside the page cache) after hydration so
enabling or cutting a banner is immediate instead of waiting for the sweep. The GROQ
projection is shared by both reads in `shared/utils/siteBanner.ts` — keep them equal.

Env: `SANITY_WEBHOOK_SECRET`, `VERCEL_BYPASS_TOKEN`, `CRON_SECRET`, optional
`REVALIDATION_CHUNK_SIZE`, `REVALIDATION_CONCURRENCY`, `REVALIDATION_TARGET_URL`,
`REVALIDATION_FORCE=1` (revalidate from a non-production deployment).

## Supabase Tables

### `travel_dates`
Departure slots for each voyage. Has two layers of fields: real values (used internally) and `displayed_*` overrides (shown to users).
- `id` uuid PK
- `travel_slug` varchar — links to Sanity voyage
- `departure_date`, `return_date` date
- `min_travelers`, `max_travelers`, `booked_seat` int
- `starting_price`, `flight_price` numeric
- `include_flight`, `early_bird`, `last_minute`, `is_custom_travel`, `is_indiv_travel` bool
- `badges` text
- `status`, `displayed_status` text
- `displayed_min_travelers`, `displayed_max_travelers`, `displayed_booked_seat` int
- `displayed_starting_price` numeric
- `displayed_include_flight`, `displayed_early_bird`, `displayed_last_minute` bool
- `displayed_badges` text
- `custom_display` bool — when true, use `displayed_*` values instead of real ones
- `closing_days` bigint — days before departure when booking closes
- `co_filling` int — co-filling seat count
- `published`, `deleted`, `is_test` bool
- `departure_id` text — links to AC departure deal
- `bms_reference` text
- `travel_type_prefix` text
- `last_editor` text, `updated_at` timestamptz

### `booked_dates`
Booking records — one row per booking linked to an AC deal and a travel date.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Part of composite PK with `deal_id`. |
| `deal_id` | bigint | UNIQUE. Joins to `activecampaign_deals.id`. |
| `travel_date_id` | uuid | Joins to `travel_dates.id`. |
| `booked_places` | bigint | Seats consumed by this booking. |
| `payment_type` | text | `'deposit'`, `'full'`, `'balance'`, `'custom'`. |
| `transaction_id` | text | Stripe or Alma transaction id. |
| `is_option` | boolean | Reservation option (not yet paid). |
| `expiracy_date` | date | Option expiry date. |
| `deleted`, `is_test` | boolean | **Always filter these out.** |
| `created_at` | timestamptz | Booking creation time. |

---

### `activecampaign_clients`
Mirror of AC contacts for local lookup.

| Column | Type | Description |
|---|---|---|
| `id` | bigint | Internal id. Part of composite PK with `email`. |
| `contact` | bigint | AC contact id. **Join to `activecampaign_deals.contact` on this column.** Has UNIQUE constraint. |
| `email` | varchar | Email address. |
| `firstname`, `lastname` | varchar | Names. |
| `phone` | text | Phone number. |
| `birthdate` | timestamp | Date of birth. |
| `city`, `zip_code`, `address` | varchar/bigint/text | Postal info (often partial). |
| `iso_contact` | text | Client's country ISO. |
| `tags` | text[] | AC tag labels assigned to the contact. |
| `optin_newsletter` | boolean | Newsletter subscription flag. |
| `created_at`, `mdate`, `updated_at` | timestamptz | Timestamps. |

### `activecampaign_deals`
Mirror of AC deals for reporting and local queries.
A row per CRM deal. Source of truth for revenue, margin, conversions, and acquisition channels.

| Column | Type | Description |
|---|---|---|
| `id` | bigint | Deal ID. Part of composite PK with `contact`. |
| `contact` | bigint | FK to `activecampaign_clients.contact`. |
| `title` | varchar | Deal title (usually voyage name + traveler name). |
| `status` | varchar | `'Ouvert'`, `'Gagné'`, `'Perdu'`, `'Supprimé'`. |
| `stage` | varchar | Sales stage name (free-form). |
| `stage_id` | text | AC stage numeric id. |
| `pipeline_id` | smallint | See pipeline logic above. |
| `pipeline_title` | varchar | Human-readable pipeline name (e.g. `'Prospects'`, `'Voyageurs'`). Use `pipeline_id` for filtering; use `pipeline_title` for display. |
| `owner_id` | text | AC owner id (sales rep). |
| `seller` | varchar | Display name of sales rep (e.g. `'Jean Dupont'`). |
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
| `nb_traveler` | numeric | Total travelers on the deal. |
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
| `total_margin` | numeric | Total deal margin in EUR. |
| `travel_type` | varchar | `'Voyage de Groupe'`, `'Voyage Individuel'`, etc. |
| `country` | varchar | Destination country (label). |
| `iso` | varchar | ISO country code (e.g. `'PE'`, `'JP'`). |
| `slug` | text | Voyage slug — the logical identifier for a voyage product. Groups all deals for the same trip. |
| `current_step` | text | Funnel step at last update. |
| `is_couple` | boolean | Couple booking flag. |
| `indiv_room` | boolean | Single room requested. |
| `is_cap_exploraction` | boolean | Premium insurance product chosen. |
| `include_flight` | boolean | Flight included in the package. |
| `flight_ticket_bought` | boolean | Operational: tickets purchased? |
| `insurance_choice` | varchar | Free-form insurance label. |
| `source` | varchar | Free-form source (legacy). |
| `acquisition_source` | text | Structured acquisition source. Prefer this over `source`. |
| `other_acquisition_source` | text | Free-form fallback when `acquisition_source` is "Autre". |
| `utm` | text | Raw UTM string. |
| `paiement_method` | varchar | Payment method label. |
| `lost_reason` | varchar | Set when `status = 'Perdu'`. |
| `departure_date`, `return_date` | timestamp | Travel dates. |
| `forecasted_closing_date` | timestamp | Sales forecast date. |
| `conversion_date` | timestamp | When the deal moved to pipeline 2 ("Gagné"). **Use for revenue cohorts.** |
| `created_at` | timestamptz | Deal creation time. |
| `mdate` | timestamptz | Last modification time (source CRM). |
| `updated_at` | timestamptz | Mirror-side last-updated timestamp. |

---
### `date_notes`
Internal notes on travel dates (booking management UI).
- `id` uuid PK, `travel_date_id` uuid FK
- `author_email`, `author_name`, `author_picture` text
- `content` text NOT NULL

### `date_activity_log`
Audit log of changes made to travel dates.
- `id` uuid PK, `travel_date_id` uuid FK
- `editor_email`, `editor_name`, `editor_picture` text
- `action` text NOT NULL
- `changes` jsonb

### `date_attachments`
Files attached to travel dates.
- `id` uuid PK, `travel_date_id` uuid FK
- `file_name`, `mime_type`, `storage_path` text
- `file_size` int
- `uploaded_by` text

### `alma_ids`
Tracks Alma payment IDs to prevent duplicate processing.
- `id` text PK

### `stripe_processed_events`
Idempotency guard for Stripe webhook events.
- `id` text PK — Stripe event ID

### `webhooks`
Raw webhook payload log.
- `id` bigint PK
- `json` json

### `revalidation_jobs`
Full-sweep bookkeeping for ISR revalidation (see the section above). One running job
at a time, enforced by a partial unique index on `status = 'running'`.
- `id` uuid PK, `kind` text (`global` | `scoped` | `nightly` | `manual`), `status` text (`running` | `done` | `failed` | `stale`)
- `trigger_type`, `trigger_id`, `trigger_rev`, `trigger_reason` text — the Sanity document behind it
- `paths` jsonb — frozen path list, so the cursor stays stable across invocations
- `total`, `cursor`, `pass` int, `rerun_requested` bool
- `ok`, `stale`, `failed` int, `problems` jsonb
- `started_at`, `heartbeat_at` (a job silent for 3 min releases the lock), `finished_at` timestamptz

### `revalidation_events`
One row per revalidation webhook — the audit trail for "why is this page still stale?".
- `id` bigserial PK, `doc_type`, `doc_id`, `doc_rev` text
- `scope` text (registry scope), `mode` text (`paths` | `sweep` | `none`), `known_type` bool
- `paths` jsonb, `ok`, `stale`, `failed` int
- `revision_confirmed` bool, `revision_wait_ms` int — false means the render may have read stale Sanity data
- `job_id` uuid FK -> `revalidation_jobs`, `reason` text, `created_at` timestamptz

### `deals_duplicate`
Archive/backup table — same schema as `activecampaign_deals`. Not used in active flows.

## Dev Commands

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint check
```

## Sensitive Files

- `server/utils/supabase.js` -- Contains hardcoded service_role key (known issue)
- `server/utils/activecampaign.js` -- `customFieldsMapDeal` maps numeric AC field IDs; changing IDs breaks CRM sync
- `app/plugins/vuetify.js` -- Theme config shared across entire UI; changes affect all pages
- `.env` -- Never commit; contains all service keys (Stripe, Supabase, AC, Brevo, Chapka, Algolia, Sanity, Google OAuth, Slack webhooks)

## Agents

Specialized agents are available in `.claude/agents/`:
- `frontend` -- Nuxt/Vue/Vuetify frontend specialist (scoped to `app/`)
- `backend` -- Nitro API / Supabase / integrations specialist (scoped to `server/`)
- `security` -- Security auditing and best practices
- `uiux` -- UI/UX design, accessibility, conversion optimization
- `verifier` -- QA verification and testing
