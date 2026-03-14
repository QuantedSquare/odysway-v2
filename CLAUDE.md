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

- `travel_dates`: departure/return dates, booked_seat, min/max_travelers, status, pricing
- `booked_dates`: booking records linked to AC deal_id + travel_date_id, payment_type, is_option, expiry
- `activecampaign_clients`: contact sync (firstname, lastname, email, birthdate, city, zip_code)

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
