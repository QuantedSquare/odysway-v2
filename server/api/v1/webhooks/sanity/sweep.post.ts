import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { listAllSitePaths } from '~~/server/utils/revalidationPaths'
import { revalidatePaths, revalidationTarget } from '~~/server/utils/revalidationRunner'
import {
  SWEEP_CHUNK_SIZE,
  SWEEP_MAX_PASSES,
  advanceSweepJob,
  finishSweepJob,
  loadSweepJob,
  restartSweepJob,
} from '~~/server/utils/revalidationJobs'
import { internalOrigin, startSweep, triggerSweepChunk } from '~~/server/utils/revalidationSweep'

/**
 * One chunk of a full revalidation sweep.
 *
 * Called without a jobId it starts a sweep (and takes the Supabase lock); called
 * with one it processes the next SWEEP_CHUNK_SIZE paths and hands over to the
 * following invocation. Each chunk is ~40 paths at concurrency 8, so it stays well
 * inside a function timeout while a whole sweep (~480 paths) spans ~12 chunks.
 */
export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-sanity-webhook-secret')
  const cronSecret = getHeader(event, 'x-cron-secret')
  const authorized = (secret && secret === process.env.SANITY_WEBHOOK_SECRET)
    || (cronSecret && cronSecret === process.env.CRON_SECRET)
  if (!authorized) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = (await readBody(event).catch(() => ({}))) || {}

  // No jobId: this is a sweep request, not a chunk.
  if (!body.jobId) {
    const { job, blocked, total } = await startSweep(event, {
      kind: body.kind || 'manual',
      reason: body.reason || 'manual sweep',
    })
    return { success: true, jobId: job?.id, queuedBehindRunningSweep: blocked, paths: total }
  }

  const job = await loadSweepJob(body.jobId)
  if (!job) throw createError({ statusCode: 404, message: 'Unknown job' })
  if (job.status !== 'running') {
    return { success: true, skipped: `job is ${job.status}`, jobId: job.id }
  }

  const target = revalidationTarget()
  if (!target.enabled) {
    await finishSweepJob(job, 'failed')
    console.log(`[revalidation] sweep ${job.id} aborted: ${target.reason}`)
    return { success: true, jobId: job.id, aborted: target.reason }
  }

  const paths = Array.isArray(job.paths) ? job.paths : []
  const chunk = paths.slice(job.cursor, job.cursor + SWEEP_CHUNK_SIZE)

  if (!chunk.length) {
    await finishSweepJob(job)
    return { success: true, jobId: job.id, done: true, total: paths.length }
  }

  const run = await revalidatePaths(chunk)
  const cursor = job.cursor + chunk.length
  await advanceSweepJob(job, { cursor, ok: run.ok, stale: run.stale, failed: run.failed, problems: run.problems })
  console.log(`[revalidation] sweep ${job.id} pass ${job.pass}: ${cursor}/${paths.length}`)

  if (cursor < paths.length) {
    await triggerSweepChunk(internalOrigin(event), job.id)
    return { success: true, jobId: job.id, cursor, total: paths.length, pass: job.pass }
  }

  // Pass complete. Documents published while the sweep was walking may have been
  // missed on paths it had already passed, so a queued rerun starts a fresh pass
  // over everything rather than a second concurrent sweep.
  const refreshed = (await loadSweepJob(job.id)) || job
  if (refreshed.rerun_requested && refreshed.pass < SWEEP_MAX_PASSES) {
    // A scoped job keeps its own list; a site-wide one re-enumerates, so content
    // published during the pass is included.
    const freshPaths = refreshed.kind === 'scoped' ? paths : await listAllSitePaths()
    await restartSweepJob(refreshed, freshPaths)
    await triggerSweepChunk(internalOrigin(event), job.id)
    console.log(`[revalidation] sweep ${job.id} restarting for pass ${refreshed.pass + 1}`)
    return { success: true, jobId: job.id, restarted: true, pass: refreshed.pass + 1, total: freshPaths.length }
  }

  await finishSweepJob(refreshed)
  console.log(`[revalidation] sweep ${job.id} done — ${refreshed.ok} ok, ${refreshed.stale} stale, ${refreshed.failed} failed`)
  return {
    success: true,
    jobId: job.id,
    done: true,
    total: paths.length,
    result: { ok: refreshed.ok, stale: refreshed.stale, failed: refreshed.failed },
  }
})
