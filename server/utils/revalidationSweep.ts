import { getRequestURL, type H3Event } from 'h3'
import { listAllSitePaths } from './revalidationPaths'
import { startSweepJob, type SweepJob, type SweepTrigger } from './revalidationJobs'

/**
 * Starting and chaining a full sweep.
 *
 * A sweep walks every ISR path (~480 today) in chunks of 40, one Vercel invocation
 * per chunk. Chunks are chained by an HTTP call the caller does NOT await to
 * completion: it aborts the client side after a few seconds, once the request has
 * been delivered. Awaiting the full chain would make the first invocation live for
 * the whole sweep, which is exactly the function timeout we are avoiding.
 *
 * If a chain ever breaks (a killed invocation), two things recover it: the job's
 * heartbeat frees the lock after 3 minutes, and the nightly cron re-sweeps
 * everything — so the worst case is a page that is at most a day stale, which is
 * already the ISR guarantee.
 */

const SWEEP_PATH = '/api/v1/webhooks/sanity/sweep'

export function internalOrigin(event: H3Event) {
  return getRequestURL(event).origin.replace(/\/$/, '')
}

export async function triggerSweepChunk(origin: string, jobId: string) {
  try {
    await fetch(`${origin}${SWEEP_PATH}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-sanity-webhook-secret': process.env.SANITY_WEBHOOK_SECRET || '',
      },
      body: JSON.stringify({ jobId }),
      signal: AbortSignal.timeout(3000),
    })
  }
  catch (err) {
    const name = (err as Error)?.name
    // Expected: we hang up as soon as the request is delivered. The chunk runs on.
    if (name !== 'AbortError' && name !== 'TimeoutError') {
      console.error('[revalidation] could not trigger next sweep chunk', err)
    }
  }
}

/**
 * Starts a chunked job. `scopedPaths` restricts it to a known path list (a settings
 * document affecting one route family); omitted, it walks every ISR path.
 */
export async function startSweep(event: H3Event, trigger: SweepTrigger = {}, scopedPaths?: string[]): Promise<{
  job: SweepJob
  blocked: boolean
  total: number
}> {
  const paths = scopedPaths?.length ? scopedPaths : await listAllSitePaths()
  const { job, blocked } = await startSweepJob(paths, trigger)
  if (!blocked) {
    console.log(`[revalidation] sweep ${job.id} started — ${paths.length} paths (${trigger.reason || trigger.type || trigger.kind})`)
    await triggerSweepChunk(internalOrigin(event), job.id)
  }
  return { job, blocked, total: paths.length }
}
