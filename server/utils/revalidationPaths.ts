import {
  type RevalidationCollection,
  type RevalidationDoc,
  type RevalidationScope,
  revalidationScopeFor,
} from './revalidationRegistry'
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

const COLLECTION_QUERIES: Record<RevalidationCollection, { prefix: string, query: string }> = {
  // Unlike the sitemap source (server/api/__sitemap__/urls.ts) this includes
  // custom voyages: they are noindex, but they ARE ISR-cached pages, so a stale
  // one is just as wrong as any other.
  voyages: { prefix: '/voyages', query: `*[_type == "voyage" && ${notDraft} && defined(slug.current)].slug.current` },
  blog: { prefix: '/blog', query: `*[_type == "blog" && ${notDraft} && defined(slug.current)].slug.current` },
  destinations: { prefix: '/destinations', query: `*[_type == "destination" && ${notDraft} && defined(slug.current)].slug.current` },
  thematiques: { prefix: '/thematiques', query: `*[_type == "category" && ${notDraft} && defined(slug.current)].slug.current` },
  experiences: { prefix: '/experiences', query: `*[_type == "experience" && ${notDraft} && defined(slug.current)].slug.current` },
}

export async function listCollectionPaths(collections: RevalidationCollection[]): Promise<string[]> {
  const client = sanityFreshClient()
  const groups = await Promise.all(collections.map(async (name) => {
    const { prefix, query } = COLLECTION_QUERIES[name]
    const slugs = await client.fetch<string[]>(query)
    return slugs.filter(Boolean).map(slug => `${prefix}/${slug}`)
  }))
  return groups.flat()
}

/** Every ISR-cached public path. ~480 entries today; this is what a sweep walks. */
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

type RelatedDoc = { _id: string, _type: string, slug?: string | null }

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
      `*[references($id) && ${notDraft}]{ _id, _type, "slug": slug.current }`,
      { id },
    ),
    client.fetch<Record<string, unknown> | null>('*[_id == $id][0]', { id }),
  ])

  const outgoingIds = [...collectRefIds(self)]
  const outgoing = outgoingIds.length
    ? await client.fetch<RelatedDoc[]>(
      `*[_id in $ids && ${notDraft}]{ _id, _type, "slug": slug.current }`,
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

  const paths = await ownPaths(scope, doc)
  const relatedTypes: string[] = []

  const wantsRefs = scope.kind === 'refs' || (scope.kind === 'page' && scope.refs)
  if (wantsRefs && doc._id) {
    if (scope.kind === 'refs' && scope.extra) paths.push(...scope.extra)

    for (const related of await findRelatedDocs(doc._id)) {
      relatedTypes.push(related._type)
      const { scope: relatedScope } = revalidationScopeFor(related._type)
      // One hop only: deeper expansion costs more queries than it saves.
      if (relatedScope.kind === 'page' || relatedScope.kind === 'collection') {
        paths.push(...await ownPaths(relatedScope, related))
      }
      // A layout-wide related document (a `tops` list, a review) means the changed
      // document may also show up in a widget rendered on every page. We do NOT
      // escalate to a sweep for that: voyages are edited several times a day and
      // ~480 renders per edit is not a trade worth making. The homepage — where
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
