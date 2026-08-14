// Content-Security-Policy in Report-Only mode.
//
// Report-Only NEVER blocks anything — the browser only logs violations to the
// console (and to report-uri if configured). This lets us observe what the CSP
// would break in production before switching to an enforcing policy in
// nuxt.config.ts (security.headers.contentSecurityPolicy).
//
// Console noise is not free even in Report-Only: Google Tag Assistant reads the
// console and reports "Content Security Policy (CSP) bloque les scripts Google"
// as a hard error as soon as it sees a googletagmanager/google-analytics
// violation, report-only or not. The whitelist below was rebuilt from the
// violations actually observed in production (home, page voyage, checkout) so
// the console stays clean and the policy is safe to enforce later.
//
// Once the console is clean in production, move these directives into
// nuxt-security's contentSecurityPolicy and drop this middleware.

// GTM server-side tagging (custom domain) — loader + collector + its cookie
// pixel and iframe.
const SST = [
  'https://load.sst.odysway.com',
  'https://sst.odysway.com',
]

// Google Ads / Analytics / Tag Manager. See
// https://developers.google.com/tag-platform/security/guides/csp
// gstatic serves the Ads call-tracking + web-conversion loaders, doubleclick
// the remarketing pixels, googleadservices the conversion endpoints.
const GOOGLE_SCRIPT = [
  'https://www.googletagmanager.com',
  'https://*.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://ssl.google-analytics.com',
  'https://www.gstatic.com',
  'https://www.googleadservices.com',
  'https://*.g.doubleclick.net',
]

// Google Ads remarketing hits every ccTLD of the visitor's region. Odysway
// sells in FR/BE/CH/LU/CA, plus the .com fallback.
const GOOGLE_CCTLD = [
  'https://www.google.com',
  'https://www.google.fr',
  'https://www.google.be',
  'https://www.google.ch',
  'https://www.google.lu',
  'https://www.google.ca',
]

const GOOGLE_COLLECT = [
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://*.googletagmanager.com',
  'https://www.googleadservices.com',
  'https://*.doubleclick.net',
  ...GOOGLE_CCTLD,
]

const CSP_DIRECTIVES = [
  'default-src \'self\'',
  // script-src-elem is set explicitly: without it the browser falls back to
  // script-src and reports the directive name Tag Assistant flags.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${[...SST, ...GOOGLE_SCRIPT].join(' ')} https://js.stripe.com https://*.hotjar.com https://app.cal.com https://tally.so`,
  `script-src-elem 'self' 'unsafe-inline' ${[...SST, ...GOOGLE_SCRIPT].join(' ')} https://js.stripe.com https://*.hotjar.com https://app.cal.com https://tally.so`,
  'style-src \'self\' \'unsafe-inline\'',
  // GA4/Ads/Meta send a large share of their hits as pixel <img> requests.
  `img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io ${[...SST, ...GOOGLE_COLLECT].join(' ')} https://*.hotjar.com https://www.facebook.com https://*.facebook.com`,
  'font-src \'self\' data: https://*.hotjar.com',
  `connect-src 'self' https://*.sanity.io https://*.algolia.net https://*.algolianet.com ${[...SST, ...GOOGLE_COLLECT].join(' ')} https://*.hotjar.com wss://*.hotjar.com https://app.cal.com https://tally.so`,
  // sst.odysway.com iframes itself for cross-domain cookie sync; doubleclick
  // and googletagmanager frame the Ads conversion pings.
  `frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.googletagmanager.com ${SST.join(' ')} https://*.doubleclick.net https://app.cal.com https://tally.so https://www.youtube.com https://www.youtube-nocookie.com`,
  'frame-ancestors \'self\'',
  'base-uri \'self\'',
  'form-action \'self\'',
].join('; ')

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Security-Policy-Report-Only', CSP_DIRECTIVES)
})
