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
- `id` uuid PK
- `deal_id` bigint — AC deal ID
- `travel_date_id` uuid → `travel_dates.id`
- `booked_places` bigint (default 0)
- `payment_type` text — deposit / full / balance / custom
- `transaction_id` text — Stripe or Alma transaction ID
- `is_option` bool — reservation option (not yet paid)
- `expiracy_date` date — option expiry
- `deleted`, `is_test` bool

### `activecampaign_clients`
Mirror of AC contacts for local lookup.
- `id` bigint PK
- `contact` bigint — AC contact ID
- `email` varchar NOT NULL
- `firstname`, `lastname`, `city` varchar
- `zip_code` bigint
- `birthdate` timestamp

### `activecampaign_deals`
Mirror of AC deals for reporting and local queries.
- `id` bigint PK
- `contact` bigint — AC contact ID
- `title`, `status`, `stage` varchar
- `pipeline_id` smallint
- `total_value`, `price_per_traveler`, `rest_to_pay`, `total_paid` numeric
- `rest_to_pay_per_traveler`, `applied_promo_per_traveler` numeric
- `nb_traveler`, `nb_adults`, `nb_children` numeric
- `travel_type`, `country`, `iso`, `source`, `seller` varchar
- `indiv_room`, `is_couple` bool
- `insurance_choice`, `promo_code`, `lost_reason`, `paiement_method` varchar
- `insurance_price_per_traveler`, `insurance_commission` numeric
- `margin_per_traveler`, `flight_margin`, `total_margin` numeric
- `flight_ticket_price_per_traveler` numeric
- `max_teen_age`, `max_children_age` smallint
- `children_promo`, `teen_promo` numeric
- `departure_date`, `return_date`, `conversion_date` timestamp

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
