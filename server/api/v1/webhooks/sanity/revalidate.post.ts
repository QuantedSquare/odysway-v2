import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { resolveRevalidation, waitForSanityRevision } from '~~/server/utils/revalidationPaths'
import { revalidatePaths } from '~~/server/utils/revalidationRunner'
import { logRevalidationEvent } from '~~/server/utils/revalidationJobs'
import { startSweep } from '~~/server/utils/revalidationSweep'
import { updateAlgoliaIndex } from '~~/server/utils/algolia'
import type { RevalidationDoc } from '~~/server/utils/revalidationRegistry'

/**
 * Sanity → ISR revalidation.
 *
 * Recommended webhook configuration in Sanity Manage (the handler tolerates less,
 * but loses precision):
 *   filter     : !(_id in path("drafts.**"))
 *   projection : {_id, _type, "slug": slug.current, _rev}
 *   headers    : x-sanity-webhook-secret: $SANITY_WEBHOOK_SECRET
 *
 * What this handler does NOT do any more is decide which paths a document affects:
 * that lives in server/utils/revalidationRegistry.ts, where every document type is
 * classified once by blast radius. A type missing from the registry now triggers a
 * full sweep instead of revalidating nothing at all.
 */

type SanityWebhookBody = {
  _id?: string
  _type?: string
  _rev?: string
  slug?: string | { current?: string } | null
  before?: SanityWebhookBody | null
  after?: SanityWebhookBody | null
}

function readDoc(body: SanityWebhookBody): RevalidationDoc {
  // Sanity delete events carry the document's last known state through before();
  // accept both shapes so a deletion still revalidates the listing pages.
  const source = body?.after || body || {}
  const before = body?.before || {}
  const slug = source.slug ?? before.slug
  return {
    _id: source._id || before._id || body._id,
    _type: source._type || before._type,
    _rev: source._rev || undefined,
    slug: typeof slug === 'string' ? slug : slug?.current,
  }
}

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-sanity-webhook-secret')
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  try {
    const body = await readBody(event)
    const doc = readDoc(body)
    console.log(`[revalidation] webhook: ${doc._type || 'unknown'} ${doc._id || ''} ${doc.slug || ''}`)

    // Drafts never render on public pages; revalidating on a draft mutation would
    // just re-cache the same published content.
    if (doc._id?.startsWith('drafts.')) {
      return { success: true, skipped: 'draft', _id: doc._id }
    }
    if (!doc._type) {
      console.warn('[revalidation] payload has no _type — check the webhook projection', body)
      await logRevalidationEvent({ doc_id: doc._id, mode: 'none', reason: 'payload without _type' })
      return { success: true, skipped: 'no-type' }
    }

    // Index updates are independent of ISR and must not be cut short by the
    // response: waitUntil keeps the invocation alive until they settle.
    if (['voyage', 'destination', 'region'].includes(doc._type)) {
      event.waitUntil(
        updateAlgoliaIndex()
          .then(res => console.log(`[revalidation] Algolia updated: ${res.count} records`))
          .catch(err => console.error('[revalidation] Algolia update failed', err)),
      )
    }

    // The single most important line of the whole flow: regenerating a page before
    // Sanity serves the new revision re-caches the OLD content for a full day.
    const revision = await waitForSanityRevision(doc._id, doc._rev)
    if (!revision.confirmed && !revision.skipped && !revision.deleted) {
      console.warn(`[revalidation] Sanity still serving an older revision after ${revision.waitedMs}ms — revalidating anyway`)
    }

    const resolved = await resolveRevalidation(doc)

    if (resolved.mode === 'none') {
      console.log(`[revalidation] nothing to do for ${doc._type} (${resolved.reason})`)
      await logRevalidationEvent({
        doc_type: doc._type,
        doc_id: doc._id,
        doc_rev: doc._rev,
        scope: resolved.scopeKind,
        mode: 'none',
        known_type: resolved.knownType,
        reason: resolved.reason,
        revision_confirmed: revision.confirmed,
        revision_wait_ms: revision.waitedMs,
      })
      return { success: true, documentType: doc._type, mode: 'none', reason: resolved.reason }
    }

    if (resolved.mode === 'sweep') {
      const { job, blocked, total } = await startSweep(event, {
        kind: resolved.paths.length ? 'scoped' : 'global',
        type: doc._type,
        id: doc._id,
        rev: doc._rev,
        reason: resolved.reason,
      }, resolved.paths)
      await logRevalidationEvent({
        doc_type: doc._type,
        doc_id: doc._id,
        doc_rev: doc._rev,
        scope: resolved.scopeKind,
        mode: 'sweep',
        known_type: resolved.knownType,
        reason: resolved.reason,
        job_id: job?.id,
        revision_confirmed: revision.confirmed,
        revision_wait_ms: revision.waitedMs,
      })
      return {
        success: true,
        documentType: doc._type,
        mode: 'sweep',
        jobId: job?.id,
        queuedBehindRunningSweep: blocked,
        paths: total,
        reason: resolved.reason,
        timestamp: new Date().toISOString(),
      }
    }

    const run = await revalidatePaths(resolved.paths)
    await logRevalidationEvent({
      doc_type: doc._type,
      doc_id: doc._id,
      doc_rev: doc._rev,
      scope: resolved.scopeKind,
      mode: 'paths',
      known_type: resolved.knownType,
      paths: resolved.paths,
      ok: run.ok,
      stale: run.stale,
      failed: run.failed,
      revision_confirmed: revision.confirmed,
      revision_wait_ms: revision.waitedMs,
      reason: run.enabled ? null : run.reason,
    })

    return {
      success: true,
      documentType: doc._type,
      slug: doc.slug,
      mode: 'paths',
      revalidated: resolved.paths,
      relatedTypes: [...new Set(resolved.relatedTypes || [])],
      result: { ok: run.ok, stale: run.stale, failed: run.failed, problems: run.problems, skipped: run.enabled ? undefined : run.reason },
      revisionConfirmed: revision.confirmed,
      timestamp: new Date().toISOString(),
    }
  }
  catch (error) {
    console.error('[revalidation] webhook error', error)
    throw createError({ statusCode: 500, message: 'Failed to process webhook' })
  }
})
