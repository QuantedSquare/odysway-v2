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
 * Keep in sync with cms/schemaTypes/index.ts. `node scripts/check-revalidation-coverage.mjs`
 * diffs the two and fails on any document type that is not listed below.
 */

export type RevalidationDoc = {
  _id?: string
  _type?: string
  _rev?: string
  slug?: string | null
}

/** Route families that can be enumerated from Sanity (see revalidationPaths.ts). */
export type RevalidationCollection = 'voyages' | 'blog' | 'destinations' | 'thematiques' | 'experiences'

export type RevalidationScope =
  /**
   * The document owns one or more fixed paths. `refs: true` additionally pulls in
   * the pages of the documents it points to / is pointed at (a voyage also shows
   * up on its destination and thematique pages).
   */
  | { kind: 'page', paths: (doc: RevalidationDoc) => string[], refs?: boolean }
  /** Settings document: affects every page of one or more route families. */
  | { kind: 'collection', collections: RevalidationCollection[], extra?: string[] }
  /** No page of its own: resolved through its references, both directions. */
  | { kind: 'refs', extra?: string[] }
  /** Rendered by a layout or the header/footer, so it is in the HTML of every page. */
  | { kind: 'global', reason: string }
  /** Nothing cached depends on it. */
  | { kind: 'none', reason: string }

const slugPath = (prefix: string) => (doc: RevalidationDoc) => (doc.slug ? [`${prefix}/${doc.slug}`] : [])

export const REVALIDATION_REGISTRY: Record<string, RevalidationScope> = {
  // === Documents with a page of their own ===============================
  voyage: {
    kind: 'page',
    refs: true, // destination / thematique / experience pages list it
    paths: doc => [...slugPath('/voyages')(doc), '/voyages', '/prochains-departs', '/'],
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
  // /checkout is deliberately not ISR-cached (see nuxt.config routeRules).
  checkout: { kind: 'none', reason: '/checkout is rendered per request' },
  checkoutAlert: { kind: 'none', reason: '/checkout is rendered per request' },
}

/**
 * Unknown type → full sweep. Deliberately expensive: a new schema type should be
 * correct by default and noisy enough to get classified properly.
 */
export const REVALIDATION_FALLBACK_SCOPE: RevalidationScope = {
  kind: 'global',
  reason: 'unknown document type (not in REVALIDATION_REGISTRY)',
}

export function revalidationScopeFor(type?: string): { scope: RevalidationScope, known: boolean } {
  const scope = type ? REVALIDATION_REGISTRY[type] : undefined
  if (!scope) return { scope: REVALIDATION_FALLBACK_SCOPE, known: false }
  return { scope, known: true }
}
