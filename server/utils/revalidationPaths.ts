import {
  type RevalidationCollection,
  type RevalidationDoc,
  type RevalidationScope,
  revalidationScopeFor,
  voyagePaths,
} from './revalidationRegistry.js'
import { sanityAsPagesClient, sanityFreshClient } from './sanityClients'

/**
 * Path resolution for ISR revalidation: which URLs must be regenerated after a
 * Sanity mutation, and how to make sure Sanity actually serves the new revision
 * before we regenerate anything.
 */

const notDraft = '!(_id in path("drafts.**"))'

/**
 * Blocks until the client a page render would use reports the revision the webhook
 * was fired for.
 *
 * This is the fix for the quiet failure mode of the previous implementation: it
 * slept 2s and regenerated. When the read came back stale, the fresh SSR HTML was
 * re-cached with the OLD content — for a whole day, and with nothing in the logs
 * to say so. Returns false on timeout; the caller revalidates anyway (better than
 * nothing) but records it as suspect.
 */
export async function waitForSanityRevision(id?: string, rev?: string, timeoutMs = 12_000) {
  if (!id || !rev) return { confirmed: false, waitedMs: 0, skipped: true }
  const client = sanityAsPagesClient()
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const seen = await client.fetch<string | null>('*[_id == $id][0]._rev', { id })
      // A deleted document never comes back: stop waiting, the delete is the change.
      if (seen === rev || seen === null) {
        return { confirmed: seen === rev, waitedMs: Date.now() - startedAt, skipped: false, deleted: seen === null }
      }
    }
    catch (err) {
      console.error('[revalidation] revision check failed', err)
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return { confirmed: false, waitedMs: Date.now() - startedAt, skipped: false }
}

/** Static ISR paths, mirroring the routeRules block of nuxt.config.ts. */
const STATIC_PATHS = [
  '/',
  '/voyages',
  '/prochains-departs',
  '/portage',
  '/destinations',
  '/thematiques',
  '/experiences',
  '/blog',
  '/avis-voyageurs',
  '/entreprise',
  '/sur-mesure',
  '/vision-voyage-odysway',
  '/contact',
  '/faq',
  '/nous-recrutons',
  '/cheques-vacances',
  '/offre-cadeau',
  '/devis',
  '/politique-de-confidentialite',
  '/mentions-legales',
  '/conditions-generales-de-vente',
  '/confirmation',
]

/**
 * How each route family is enumerated. Unlike the sitemap source
 * (server/api/__sitemap__/urls.ts) this includes « sur-mesure seul » voyages:
 * they are kept out of the listings and the sitemap, but their link-only page IS
 * an ISR entry, so a stale one is just as wrong as any other.
 *
 * Voyages go through the registry's own `voyagePaths()` rather than a prefix: a
 * voyage owns two to three cached pages depending on its flags, and duplicating
 * that rule here is how the two would drift apart.
 */
const COLLECTION_QUERIES: Record<RevalidationCollection, { query: string, toPaths: (row: RevalidationDoc) => string[] }> = {
  voyages: {
    query: `*[_type == "voyage" && ${notDraft} && defined(slug.current)]{ "slug": slug.current, availabilityTypes, portage, customPagePublished }`,
    toPaths: row => voyagePaths(row),
  },
  blog: {
    query: `*[_type == "blog" && ${notDraft} && defined(slug.current)]{ "slug": slug.current }`,
    toPaths: row => (row.slug ? [`/blog/${row.slug}`] : []),
  },
  destinations: {
    query: `*[_type == "destination" && ${notDraft} && defined(slug.current)]{ "slug": slug.current }`,
    toPaths: row => (row.slug ? [`/destinations/${row.slug}`] : []),
  },
  thematiques: {
    query: `*[_type == "category" && ${notDraft} && defined(slug.current)]{ "slug": slug.current }`,
    toPaths: row => (row.slug ? [`/thematiques/${row.slug}`] : []),
  },
  experiences: {
    query: `*[_type == "experience" && ${notDraft} && defined(slug.current)]{ "slug": slug.current }`,
    toPaths: row => (row.slug ? [`/experiences/${row.slug}`] : []),
  },
}

export async function listCollectionPaths(collections: RevalidationCollection[]): Promise<string[]> {
  const client = sanityFreshClient()
  const groups = await Promise.all(collections.map(async (name) => {
    const { query, toPaths } = COLLECTION_QUERIES[name]
    const rows = await client.fetch<RevalidationDoc[]>(query)
    return rows.flatMap(row => toPaths(row))
  }))
  return groups.flat()
}

/** Every ISR-cached public path. ~600 entries today; this is what a sweep walks. */
export async function listAllSitePaths(): Promise<string[]> {
  const dynamic = await listCollectionPaths(Object.keys(COLLECTION_QUERIES) as RevalidationCollection[])
  return dedupePaths([...STATIC_PATHS, ...dynamic])
}

export function dedupePaths(paths: string[]): string[] {
  return [...new Set(paths.filter(Boolean))]
}

/**
 * Every `_ref` anywhere in a document, at any depth — minus assets. A voyage holds
 * ~56 refs and nearly all of them are images: resolving those would cost a query and
 * tell us nothing about which pages to revalidate.
 */
const ASSET_REF = /^(image|file)-/

function collectRefIds(value: unknown, out = new Set<string>()): Set<string> {
  if (!value || typeof value !== 'object') return out
  if (Array.isArray(value)) {
    for (const item of value) collectRefIds(item, out)
    return out
  }
  const record = value as Record<string, unknown>
  if (typeof record._ref === 'string' && !record._ref.startsWith('drafts.') && !ASSET_REF.test(record._ref)) {
    out.add(record._ref)
  }
  for (const key of Object.keys(record)) {
    if (key === '_ref') continue
    collectRefIds(record[key], out)
  }
  return out
}

type RelatedDoc = RevalidationDoc & { _id: string, _type: string }

// The voyage flags ride along: a related voyage may be a « sur-mesure seul » one,
// whose page lives on /portage/<slug> or /sur-mesure/<slug> (see voyagePaths).
const RELATED_PROJECTION = '{ _id, _type, "slug": slug.current, availabilityTypes, portage, customPagePublished }'

/**
 * Both directions of the reference graph, one hop:
 *   - reverse: documents that cite this one (a voyage citing a badge);
 *   - forward: documents this one cites (a review citing its voyage).
 *
 * The previous implementation hard-coded `['/', '/avis-voyageurs', '/vision-voyage-odysway']`
 * for every referenced type, which is how a review on a voyage page never updated.
 */
async function findRelatedDocs(id: string): Promise<RelatedDoc[]> {
  const client = sanityFreshClient()
  const [incoming, self] = await Promise.all([
    client.fetch<RelatedDoc[]>(
      `*[references($id) && ${notDraft}]${RELATED_PROJECTION}`,
      { id },
    ),
    client.fetch<Record<string, unknown> | null>('*[_id == $id][0]', { id }),
  ])

  const outgoingIds = [...collectRefIds(self)]
  const outgoing = outgoingIds.length
    ? await client.fetch<RelatedDoc[]>(
      `*[_id in $ids && ${notDraft}]${RELATED_PROJECTION}`,
      { ids: outgoingIds },
    )
    : []

  const byId = new Map<string, RelatedDoc>()
  for (const doc of [...incoming, ...outgoing]) {
    // sanity.* system documents (assets, file metadata) never map to a page.
    if (doc?._id && doc._id !== id && !doc._type?.startsWith('sanity.')) byId.set(doc._id, doc)
  }
  return [...byId.values()]
}

/**
 * A voyage's cached paths depend on three fields the webhook payload does not
 * carry (availabilityTypes, portage, customPagePublished — see voyagePaths).
 * Without them a link-only /portage/<slug> or /sur-mesure/<slug> page would be
 * missed, and an unlisted voyage would pointlessly revalidate the listings.
 */
async function enrichDoc(doc: RevalidationDoc): Promise<RevalidationDoc> {
  if (doc._type !== 'voyage' || !doc._id) return doc
  if (doc.availabilityTypes !== undefined) return doc
  try {
    const flags = await sanityFreshClient().fetch<RevalidationDoc | null>(
      '*[_id == $id][0]{ availabilityTypes, portage, customPagePublished }',
      { id: doc._id },
    )
    return { ...doc, ...(flags || {}) }
  }
  catch (err) {
    // Falling back to the listed-voyage shape: /voyages/<slug> and the listings
    // still get revalidated, which is the pre-portage behaviour.
    console.error('[revalidation] could not read voyage flags', doc._id, err)
    return doc
  }
}

/** Paths a `page` / `collection` scope owns, without any reference expansion. */
async function ownPaths(scope: RevalidationScope, doc: RevalidationDoc): Promise<string[]> {
  if (scope.kind === 'page') return scope.paths(doc)
  if (scope.kind === 'collection') {
    return [...(scope.extra || []), ...await listCollectionPaths(scope.collections)]
  }
  return []
}

export type ResolvedRevalidation = {
  /**
   * 'paths' → revalidate inline; 'sweep' → hand over to the chunked job (with an
   * empty `paths` meaning "every path on the site"); 'none' → nothing cached.
   */
  mode: 'paths' | 'sweep' | 'none'
  paths: string[]
  scopeKind: RevalidationScope['kind']
  reason?: string
  knownType: boolean
  relatedTypes?: string[]
}

/**
 * How many paths we are willing to revalidate inside the webhook request. Past
 * that the resolved list is handed to a chunked job instead — same mechanism as a
 * global sweep, but restricted to those paths (a `page_voyage` edit walks the 97
 * voyage pages, not all 468).
 */
const INLINE_PATH_LIMIT = 60

export async function resolveRevalidation(doc: RevalidationDoc): Promise<ResolvedRevalidation> {
  const { scope, known } = revalidationScopeFor(doc._type)

  if (scope.kind === 'none') {
    return { mode: 'none', paths: [], scopeKind: 'none', reason: scope.reason, knownType: known }
  }
  if (scope.kind === 'global') {
    return { mode: 'sweep', paths: [], scopeKind: 'global', reason: scope.reason, knownType: known }
  }

  const enriched = await enrichDoc(doc)
  const paths = await ownPaths(scope, enriched)
  const relatedTypes: string[] = []

  const wantsRefs = scope.kind === 'refs' || (scope.kind === 'page' && scope.refs)
  if (wantsRefs && enriched._id) {
    if (scope.kind === 'refs' && scope.extra) paths.push(...scope.extra)

    for (const related of await findRelatedDocs(enriched._id)) {
      relatedTypes.push(related._type)
      const { scope: relatedScope } = revalidationScopeFor(related._type)
      // One hop only: deeper expansion costs more queries than it saves.
      if (relatedScope.kind === 'page' || relatedScope.kind === 'collection') {
        paths.push(...await ownPaths(relatedScope, related))
      }
      // A layout-wide related document (a `tops` list, a review) means the changed
      // document may also show up in a widget rendered on every page. We do NOT
      // escalate to a sweep for that: voyages are edited several times a day and
      // ~600 renders per edit is not a trade worth making. The homepage — where
      // those widgets actually matter — is revalidated, and the nightly sweep
      // keeps the guarantee that nothing stays stale for more than a day.
      if (relatedScope.kind === 'global') paths.push('/')
    }
  }

  const unique = dedupePaths(paths)
  if (unique.length > INLINE_PATH_LIMIT) {
    return {
      mode: 'sweep',
      paths: unique,
      scopeKind: scope.kind,
      reason: `${unique.length} paths resolved (> ${INLINE_PATH_LIMIT}), running them as a scoped sweep`,
      knownType: known,
      relatedTypes,
    }
  }
  if (!unique.length) {
    return { mode: 'none', paths: [], scopeKind: scope.kind, reason: 'no cached path resolved', knownType: known, relatedTypes }
  }
  return { mode: 'paths', paths: unique, scopeKind: scope.kind, knownType: known, relatedTypes }
}
