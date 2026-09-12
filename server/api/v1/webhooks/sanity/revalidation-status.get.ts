import { defineEventHandler, getHeader, createError } from 'h3'
import supabase from '~~/server/utils/supabase'
import { REVALIDATION_REGISTRY } from '~~/server/utils/revalidationRegistry'
import { revalidationTarget } from '~~/server/utils/revalidationRunner'

/**
 * Read-only view of what the revalidation pipeline has been doing. The question
 * this answers is the one that used to be unanswerable: "the editor published
 * something 10 minutes ago and the site did not change — why?".
 *
 * Look for, in order: `known_type: false` (type missing from the registry),
 * `mode: 'none'` (resolved to no cached path), `revision_confirmed: false` (Sanity
 * was still serving the old revision), `stale > 0` (bypass token not honoured).
 */
export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-sanity-webhook-secret')
  const cronSecret = getHeader(event, 'x-cron-secret')
  const authorized = (secret && secret === process.env.SANITY_WEBHOOK_SECRET)
    || (cronSecret && cronSecret === process.env.CRON_SECRET)
  if (!authorized) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const [{ data: jobs }, { data: events }] = await Promise.all([
    supabase
      .from('revalidation_jobs')
      .select('id, kind, status, trigger_type, trigger_reason, cursor, total, pass, rerun_requested, ok, stale, failed, started_at, heartbeat_at, finished_at')
      .order('started_at', { ascending: false })
      .limit(10),
    supabase
      .from('revalidation_events')
      .select('created_at, doc_type, doc_id, scope, mode, known_type, ok, stale, failed, revision_confirmed, revision_wait_ms, reason, job_id')
      .order('created_at', { ascending: false })
      .limit(25),
  ])

  const target = revalidationTarget()
  return {
    target: target.enabled ? { enabled: true, baseUrl: target.baseUrl } : { enabled: false, reason: target.reason },
    registryTypes: Object.keys(REVALIDATION_REGISTRY).length,
    jobs: jobs || [],
    events: events || [],
  }
})
