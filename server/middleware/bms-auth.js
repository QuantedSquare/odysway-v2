// Single enforcement point for the booking-management backoffice (BMS).
//
// Before this middleware, every BMS route carried its own copy of
// `if (isProdEnv) requireBookingUser(event)` where `isProdEnv` was derived from
// VERCEL_ENV. VERCEL_ENV is `preview` on every branch deployment, so preprod and
// every preview URL served the whole backoffice — reads *and* writes — with no
// authentication at all. Four routes had also been created without any check.
//
// The rule here is deny-by-default and environment-independent: auth is enforced
// identically on production, preview and preprod. Only `nuxt dev` bypasses it.
//
// Two namespaces, two postures — read this before adding a route:
//
//   /api/v1/booking/**  PRIVATE by default. A new endpoint is protected the
//                       moment the file exists. Opening one to the public means
//                       adding it to PUBLIC_BOOKING_ROUTES below, deliberately.
//
//   /api/v1/ac/**       PUBLIC by default: this namespace is mostly the booking
//                       funnel (deal creation, checkout, AC webhooks, and yes,
//                       `deal-from-bms` / `update-with-bms`, which are called
//                       from /checkout despite their names). Backoffice-only AC
//                       endpoints are listed in PROTECTED_AC_ROUTES.
//
// Handlers read the authenticated user from `event.context.bookingUser` for
// audit fields (last_editor, note author, activity log) — they must not re-run
// their own auth check.

import { createError, getRequestURL, sendRedirect, setResponseHeader } from 'h3'

const BMS_PAGE_PREFIX = '/booking-management'
const BOOKING_API_PREFIX = '/api/v1/booking/'
const AC_API_PREFIX = '/api/v1/ac/'

// Endpoints under /api/v1/booking/ reachable without a BMS session. Each one is
// called from the public site or the booking funnel — verified at the call site.
const PUBLIC_BOOKING_ROUTES = [
  // Voyage pages, /voyages, /prochains-departs, confirmation
  /^\/api\/v1\/booking\/travel-dates$/,
  /^\/api\/v1\/booking\/travelers-count$/,
  /^\/api\/v1\/booking\/travels-by-date$/,
  /^\/api\/v1\/booking\/purchase-data$/,
  /^\/api\/v1\/booking\/last-minute-voyages$/,
  // Funnel: option handling and resume-an-existing-booking middleware
  /^\/api\/v1\/booking\/booking-exists$/,
  /^\/api\/v1\/booking\/booked_date\/option$/,
  /^\/api\/v1\/booking\/booked_date\/extend-option$/,
  // Funnel: deal creation on the Details step (useStepperDeal)
  /^\/api\/v1\/booking\/[^/]+\/date\/[^/]+\/kickstart$/,
  /^\/api\/v1\/booking\/[^/]+\/date\/[^/]+\/assign-deal$/,
]

// Backoffice-only endpoints inside the otherwise-public /api/v1/ac/ namespace.
const PROTECTED_AC_ROUTES = [
  /^\/api\/v1\/ac\/deals\/[^/]+\/duplicate$/,
  /^\/api\/v1\/ac\/deals\/[^/]+\/inspect$/,
]

const normalize = (pathname) => {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

const requiresBookingSession = (path) => {
  if (path === BMS_PAGE_PREFIX || path.startsWith(`${BMS_PAGE_PREFIX}/`)) {
    return true
  }
  if (path.startsWith(BOOKING_API_PREFIX)) {
    return !PUBLIC_BOOKING_ROUTES.some(pattern => pattern.test(path))
  }
  if (path.startsWith(AC_API_PREFIX)) {
    return PROTECTED_AC_ROUTES.some(pattern => pattern.test(path))
  }
  return false
}

export default defineEventHandler((event) => {
  const path = normalize(getRequestURL(event).pathname)

  if (!requiresBookingSession(path)) {
    return
  }

  // The session is always resolved, so audit fields keep working locally.
  event.context.bookingUser = getBookingUserOrNull(event)

  if (isBookingAuthBypassed()) {
    return
  }

  if (event.context.bookingUser) {
    return
  }

  if (path.startsWith('/api/')) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié.' })
  }

  // Page navigation: send the user to the login screen rather than an error page.
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return sendRedirect(event, '/booking-login', 302)
})
