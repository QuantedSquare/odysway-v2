import { defineEventHandler, getHeader, createError } from 'h3'
import { startSweep } from '~~/server/utils/revalidationSweep'

/**
 * Safety net: re-sweeps every ISR path once a day.
 *
 * On-demand revalidation can always lose an event — a webhook Sanity never
 * delivered, a broken chunk chain, a deploy in the middle of a sweep. This gives a
 * hard floor: no page can be stale for more than a day, which is the guarantee the
 * ISR TTLs were supposed to provide in the first place.
 *
 * Schedule it with Vercel Cron (Authorization: Bearer $CRON_SECRET is sent
 * automatically) or any external scheduler sending x-cron-secret, like
 * /api/v1/webhooks/booking/cronjob.
 */
export default defineEventHandler(async (event) => {
  const cronSecret = getHeader(event, 'x-cron-secret')
  const bearer = getHeader(event, 'authorization')
  const expected = process.env.CRON_SECRET
  const authorized = Boolean(expected) && (cronSecret === expected || bearer === `Bearer ${expected}`)
  if (!authorized) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { job, blocked, total } = await startSweep(event, { kind: 'nightly', reason: 'nightly safety sweep' })
  return {
    success: true,
    jobId: job?.id,
    queuedBehindRunningSweep: blocked,
    paths: total,
    timestamp: new Date().toISOString(),
  }
})
