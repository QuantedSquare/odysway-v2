// Content-Security-Policy in Report-Only mode.
//
// Report-Only NEVER blocks anything — the browser only logs violations to the
// console AND posts them to the report endpoint below. This lets us observe what
// the CSP would break in production before switching to an enforcing policy in
// nuxt.config.ts (security.headers.contentSecurityPolicy).
//
// The allowlist below was built from violations actually observed in production
// (homepage, voyage page, /rdv-projet-voyage). It is NOT exhaustive: the funnel,
// booking-management and non-French visitors were never exercised. Do not flip
// this to enforcing until public.csp_violations has gone quiet on real traffic
// for a few days — that table is the whole point of the report endpoint.

// Google Ads fires its remarketing pixels at the visitor's country TLD
// (google.fr here, google.be for a Belgian visitor, and so on). CSP cannot
// wildcard a TLD, so this list is a deliberate choice: .com and .fr cover the
// overwhelming majority of a French agency's traffic. Visitors elsewhere lose
// the Ads remarketing pixel only — GA4 and conversion tracking are unaffected.
const GOOGLE_TLDS = ['https://www.google.com', 'https://www.google.fr']

const CSP_DIRECTIVES = [
  'default-src \'self\'',

  // GTM/SST, Stripe.js and Hotjar inject inline + external scripts; Vuetify/Nuxt need inline.
  // gstatic/googleads/googleadservices are pulled in by the Ads tag at runtime,
  // not by us. cal.com (/rdv-projet-voyage), tally.so (funnel) and capcadeau
  // (gift cards) are embed widgets — see useCalEmbed.js, Funnel/TallyForm.vue,
  // content/IntegrationCapcadeau.vue.
  [
    'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'',
    'https://www.googletagmanager.com',
    'https://load.sst.odysway.com https://sst.odysway.com',
    'https://www.gstatic.com',
    'https://googleads.g.doubleclick.net',
    'https://www.googleadservices.com',
    'https://js.stripe.com',
    'https://*.hotjar.com',
    'https://app.cal.com',
    'https://tally.so',
    'https://www.capcadeau.com',
  ].join(' '),

  'style-src \'self\' \'unsafe-inline\'',

  // GA4 and Ads deliver most of their payload as 1x1 pixels, hence the breadth
  // here. sst.odysway.com serves a cookie-setting pixel (/_/set_cookie).
  [
    'img-src \'self\' data: blob:',
    'https://cdn.sanity.io https://*.sanity.io',
    'https://www.googletagmanager.com',
    // Covers www.google-analytics.com AND region1.analytics.google.com, which
    // is where GA4 actually sends EU traffic — the old www-only entry missed it.
    'https://*.google-analytics.com https://*.analytics.google.com',
    'https://*.doubleclick.net',
    ...GOOGLE_TLDS,
    'https://sst.odysway.com',
    'https://www.facebook.com',
    'https://*.hotjar.com',
    'https://app.cal.com',
  ].join(' '),

  'font-src \'self\' data: https://*.hotjar.com',

  [
    'connect-src \'self\'',
    'https://*.sanity.io',
    'https://*.algolia.net https://*.algolianet.com',
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com https://*.analytics.google.com',
    'https://*.doubleclick.net',
    ...GOOGLE_TLDS,
    'https://www.googleadservices.com',
    'https://load.sst.odysway.com https://sst.odysway.com',
    'https://*.hotjar.com wss://*.hotjar.com',
    'https://app.cal.com',
    'https://tally.so',
  ].join(' '),

  // sst.odysway.com frames itself for server-side tagging; the rest are embeds.
  [
    'frame-src \'self\'',
    'https://js.stripe.com https://hooks.stripe.com',
    'https://www.googletagmanager.com',
    'https://sst.odysway.com',
    'https://app.cal.com',
    'https://tally.so',
    'https://www.capcadeau.com',
  ].join(' '),

  'frame-ancestors \'self\'',
  'base-uri \'self\'',
  'form-action \'self\'',

  // Two reporting mechanisms on purpose. report-uri is deprecated but is what
  // Safari and older Chrome still speak; report-to is the Reporting API and is
  // what current Chrome prefers. They deliver different payload shapes — the
  // endpoint reads both.
  'report-uri /api/v1/csp-report',
  'report-to csp-endpoint',
].join('; ')

// report-to references a group declared in this separate header; without it
// Chrome silently ignores the directive.
const REPORTING_ENDPOINTS = 'csp-endpoint="/api/v1/csp-report"'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Security-Policy-Report-Only', CSP_DIRECTIVES)
  setResponseHeader(event, 'Reporting-Endpoints', REPORTING_ENDPOINTS)
})
