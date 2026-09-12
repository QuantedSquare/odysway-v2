/**
 * Which cached paths does a Sanity document affect?
 *
 * This file replaces the 150-line if/else chain that used to live inside the
 * revalidation webhook. The point is not brevity: it is that the webhook no
 * longer decides anything. Every document type is classified by *blast radius*
 * once, here, and a type that is missing from the table falls back to the widest
 * scope (a full sweep) instead of silently revalidating nothing — which is what
 * happened to `siteBanner` for months.
 *
 * Plain JS on purpose: tests/unit/revalidationRegistry.test.mjs imports this
 * table and checks it against cms/schemaTypes and against the ISR routeRules of
 * nuxt.config.ts, so a new document type or a renamed route fails a test instead
 * of quietly revalidating the wrong thing.
 *
 * @typedef {{ _id?: string, _type?: string, _rev?: string, slug?: string | null,
 *   availabilityTypes?: string[] | null, portage?: boolean | null,
 *   customPagePublished?: boolean | null }} RevalidationDoc
 *
 * Route families that can be enumerated from Sanity (see revalidationPaths.js).
 * @typedef {'voyages' | 'blog' | 'destinations' | 'thematiques' | 'experiences'} RevalidationCollection
 *
 * @typedef {{ kind: 'page', paths: (doc: RevalidationDoc) => string[], refs?: boolean }
 *   | { kind: 'collection', collections: RevalidationCollection[], extra?: string[] }
 *   | { kind: 'refs', extra?: string[] }
 *   | { kind: 'global', reason: string }
 *   | { kind: 'none', reason: string }} RevalidationScope
 *
 * The five kinds:
 *   page       — owns fixed paths; `refs: true` also pulls in the pages of the
 *                documents it points to / is pointed at (a voyage shows up on
 *                its destination and thematique pages).
 *   collection — settings document affecting a whole route family.
 *   refs       — no page of its own, resolved through references, both directions.
 *   global     — rendered by a layout / header / footer, so in every page's HTML.
 *   none       — nothing cached depends on it.
 */

/** @type {(prefix: string) => (doc: RevalidationDoc) => string[]} */
const slugPath = prefix => doc => (doc.slug ? [`${prefix}/${doc.slug}`] : [])

/**
 * A voyage has up to three cached pages, and which ones depend on its own flags
 * (the predicates live in app/utils/portage.js):
 *   - /voyages/<slug> always exists, and /voyages/<slug>/lp with it (the alias
 *     serving variant B of the rendez-vous A/B test);
 *   - a « sur-mesure seul » voyage (availabilityTypes === ['custom']) is kept out
 *     of the listings, the search and the sitemap, and is sold on a link-only
 *     page once `customPagePublished` is set: /portage/<slug> when it is carried
 *     for an outside guide, /sur-mesure/<slug> otherwise. /voyages/<slug> then
 *     302s to it, so it still has to be revalidated.
 * Keeping the listing paths out for an unlisted voyage is not an optimisation
 * detail: it is three renders per edit that would prove nothing.
 * @type {(doc: RevalidationDoc) => string[]}
 */
export function voyagePaths(doc) {
  const listings = ['/voyages', '/prochains-departs', '/']
  if (!doc.slug) return listings

  const paths = [`/voyages/${doc.slug}`, `/voyages/${doc.slug}/lp`]
  const types = doc.availabilityTypes
  const surMesureSeul = Array.isArray(types) && types.length === 1 && types[0] === 'custom'

  if (!surMesureSeul) return [...paths, ...listings]
  if (doc.customPagePublished) paths.push(`${doc.portage ? '/portage' : '/sur-mesure'}/${doc.slug}`)
  return paths
}

/** @type {Record<string, RevalidationScope>} */
export const REVALIDATION_REGISTRY = {
  // === Documents with a page of their own ===============================
  voyage: {
    kind: 'page',
    refs: true, // destination / thematique / experience pages list it
    paths: voyagePaths,
  },
  blog: {
    kind: 'page',
    refs: true,
    paths: doc => [...slugPath('/blog')(doc), '/blog'],
  },
  destination: {
    kind: 'page',
    refs: true,
    paths: doc => [...slugPath('/destinations')(doc), '/destinations', '/voyages', '/'],
  },
  category: {
    kind: 'page',
    refs: true,
    paths: doc => [...slugPath('/thematiques')(doc), '/thematiques'],
  },
  experience: {
    kind: 'page',
    refs: true,
    paths: doc => [...slugPath('/experiences')(doc), '/experiences'],
  },

  // === Singletons ======================================================
  homePage: { kind: 'page', paths: () => ['/'] },
  entreprise: { kind: 'page', paths: () => ['/entreprise'] },
  surMesure: { kind: 'page', paths: () => ['/sur-mesure'] },
  // Landing du portage. /partenariat est un 301 vers /portage (routeRules).
  page_partenariat: { kind: 'page', paths: () => ['/portage'] },
  visionVoyageOdysway: { kind: 'page', paths: () => ['/vision-voyage-odysway'] },
  privacyPolicy: { kind: 'page', paths: () => ['/politique-de-confidentialite'] },
  legalMentions: { kind: 'page', paths: () => ['/mentions-legales'] },
  chequesVacances: { kind: 'page', paths: () => ['/cheques-vacances'] },
  conditionsGeneralesVente: { kind: 'page', paths: () => ['/conditions-generales-de-vente'] },
  confirmation: { kind: 'page', paths: () => ['/confirmation'] },
  offreCadeau: { kind: 'page', paths: () => ['/offre-cadeau'] },
  recruitment: { kind: 'page', paths: () => ['/nous-recrutons'] },
  avisVoyageurs: { kind: 'page', paths: () => ['/avis-voyageurs'] },
  page_contact: { kind: 'page', paths: () => ['/contact'] },
  devis: { kind: 'page', paths: () => ['/devis'] },
  // /search is a 301 to /voyages (nuxt.config routeRules): never revalidate it directly.
  search: { kind: 'page', paths: () => ['/voyages', '/prochains-departs'] },
  page_prochains_departs: { kind: 'page', paths: () => ['/prochains-departs'] },

  // === Page settings: one route family each =============================
  page_voyage: { kind: 'collection', collections: ['voyages'] },
  page_blog: { kind: 'collection', collections: ['blog'], extra: ['/blog'] },
  page_thematiques: { kind: 'collection', collections: ['thematiques'], extra: ['/thematiques'] },
  page_experiences: { kind: 'collection', collections: ['experiences'], extra: ['/experiences'] },
  page_destinations: { kind: 'collection', collections: ['destinations'], extra: ['/destinations'] },

  // === Referenced content, narrow radius ================================
  badge: { kind: 'refs' },
  difficultyLevel: { kind: 'refs' },
  promotion: { kind: 'refs' },
  blogCategory: { kind: 'refs', extra: ['/blog'] },

  // === Layout-wide content: present in the HTML of (nearly) every page ===
  // This site renders most shared content from the layouts, so "referenced
  // everywhere" is the norm rather than the exception — hence the sweep.
  siteBanner: { kind: 'global', reason: 'rendered by the 6 public layouts' },
  header: { kind: 'global', reason: 'TopBar, on every page' },
  footer: { kind: 'global', reason: 'FooterOdysway, on every page' },
  ctas: { kind: 'global', reason: 'layouts + FaqContainer + PartenairesContainer' },
  newsletter: { kind: 'global', reason: 'NewsletterContainer, used by several layouts' },
  voyage_card: { kind: 'global', reason: 'card labels appear in every listing' },
  faq: { kind: 'global', reason: 'FaqContainer (simple-pages layout) + HomeFaqSection' },
  region: { kind: 'global', reason: 'destinations menu in TopBar + search field' },
  review: { kind: 'global', reason: 'CommonReviewContainer (simple-pages layout) + carousels' },
  tops: { kind: 'global', reason: 'TopTravelsTabs (homepage, no-faq and voyage layouts)' },
  teamMember: { kind: 'global', reason: 'AvatarsRowStack (default layout)' },
  partner: { kind: 'global', reason: 'PartenairesContainer (no-faq + simple-pages layouts)' },

  // === Nothing cached depends on these ==================================
  // /checkout is deliberately not ISR-cached (see nuxt.config routeRules), and
  // /espace-porteur is ssr:false + no-store, so no Sanity edit can stale it.
  checkout: { kind: 'none', reason: '/checkout is rendered per request' },
  checkoutAlert: { kind: 'none', reason: '/checkout is rendered per request' },
}

/**
 * Unknown type → full sweep. Deliberately expensive: a new schema type should be
 * correct by default and noisy enough to get classified properly.
 * @type {RevalidationScope}
 */
export const REVALIDATION_FALLBACK_SCOPE = {
  kind: 'global',
  reason: 'unknown document type (not in REVALIDATION_REGISTRY)',
}

/** @type {(type?: string) => { scope: RevalidationScope, known: boolean }} */
export function revalidationScopeFor(type) {
  const scope = type ? REVALIDATION_REGISTRY[type] : undefined
  if (!scope) return { scope: REVALIDATION_FALLBACK_SCOPE, known: false }
  return { scope, known: true }
}

export default { REVALIDATION_REGISTRY, REVALIDATION_FALLBACK_SCOPE, revalidationScopeFor, voyagePaths }
