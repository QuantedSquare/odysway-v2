// Content-Security-Policy in Report-Only mode.
//
// Report-Only NEVER blocks anything — the browser only logs violations to the
// console (and to report-uri if configured). This lets us observe what the CSP
// would break in production before switching to an enforcing policy in
// nuxt.config.ts (security.headers.contentSecurityPolicy).
//
// Once the console is clean in production, move these directives into
// nuxt-security's contentSecurityPolicy and drop this middleware.

const CSP_DIRECTIVES = [
  'default-src \'self\'',
  // GTM/SST, Stripe.js and Hotjar inject inline + external scripts; Vuetify/Nuxt need inline.
  'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://www.googletagmanager.com https://load.sst.odysway.com https://sst.odysway.com https://js.stripe.com https://*.hotjar.com',
  'style-src \'self\' \'unsafe-inline\'',
  'img-src \'self\' data: blob: https://cdn.sanity.io https://*.sanity.io https://www.googletagmanager.com https://*.google-analytics.com https://*.hotjar.com',
  'font-src \'self\' data: https://*.hotjar.com',
  'connect-src \'self\' https://*.sanity.io https://*.algolia.net https://*.algolianet.com https://www.google-analytics.com https://load.sst.odysway.com https://sst.odysway.com https://*.hotjar.com wss://*.hotjar.com',
  'frame-src \'self\' https://js.stripe.com https://hooks.stripe.com https://www.googletagmanager.com',
  'frame-ancestors \'self\'',
  'base-uri \'self\'',
  'form-action \'self\'',
].join('; ')

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Security-Policy-Report-Only', CSP_DIRECTIVES)
})
