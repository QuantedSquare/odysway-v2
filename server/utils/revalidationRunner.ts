/**
 * Issues the actual ISR revalidation requests.
 *
 * Two things this deliberately does NOT do any more:
 *   - hit the preprod deployment. ISR routeRules are production-only
 *     (nuxt.config.ts), so every preprod request was a full SSR render for a
 *     cache that does not exist.
 *   - append `/_payload.json`. `experimental.payloadExtraction` is false in
 *     production, so those requests were 404s and doubled the request count.
 */

export type RevalidationOutcome = {
  path: string
  status: 'success' | 'stale' | 'failed'
  httpStatus?: number
  cacheStatus?: string
  error?: string
}

export type RevalidationRunResult = {
  enabled: boolean
  baseUrl?: string
  ok: number
  stale: number
  failed: number
  /** Only the problematic ones: a 480-path sweep must not log 480 lines. */
  problems: RevalidationOutcome[]
  reason?: string
}

const CONCURRENCY = Number(process.env.REVALIDATION_CONCURRENCY || 8)

export function revalidationTarget() {
  const config = useRuntimeConfig()
  const isProduction = process.env.VERCEL_ENV === 'production'
  const forced = process.env.REVALIDATION_FORCE === '1'
  const baseUrl = (process.env.REVALIDATION_TARGET_URL || config.public.siteURL || '').replace(/\/$/, '')
  const bypassToken = process.env.VERCEL_BYPASS_TOKEN

  if (!isProduction && !forced) {
    return { enabled: false as const, reason: `ISR is production-only (VERCEL_ENV=${process.env.VERCEL_ENV || 'unset'}); set REVALIDATION_FORCE=1 to override` }
  }
  if (!bypassToken) return { enabled: false as const, reason: 'VERCEL_BYPASS_TOKEN is not set' }
  if (!baseUrl) return { enabled: false as const, reason: 'no base URL (BASE_URL / REVALIDATION_TARGET_URL)' }

  return { enabled: true as const, baseUrl, bypassToken }
}

async function revalidateOne(baseUrl: string, bypassToken: string, path: string): Promise<RevalidationOutcome> {
  const url = `${baseUrl}${path}`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-prerender-revalidate': bypassToken,
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    })
    // The body has to be drained for the render to actually complete.
    await response.text().catch(() => {})

    const cacheStatus = response.headers.get('x-vercel-cache') || 'UNKNOWN'
    if (!response.ok) {
      return { path, status: 'failed', httpStatus: response.status, cacheStatus }
    }
    // HIT means the bypass token was not honoured: the page was served from cache
    // and never regenerated. It is a failure, not a detail.
    if (cacheStatus === 'HIT') {
      return { path, status: 'stale', httpStatus: response.status, cacheStatus }
    }
    return { path, status: 'success', httpStatus: response.status, cacheStatus }
  }
  catch (err) {
    return { path, status: 'failed', error: err instanceof Error ? err.message : String(err) }
  }
}

/** Bounded-concurrency pool. ~8 parallel renders keeps a 40-path chunk under 10s. */
export async function revalidatePaths(paths: string[]): Promise<RevalidationRunResult> {
  const target = revalidationTarget()
  if (!target.enabled) {
    console.log(`[revalidation] skipped (${target.reason}) for ${paths.length} paths`)
    return { enabled: false, ok: 0, stale: 0, failed: 0, problems: [], reason: target.reason }
  }

  const queue = [...paths]
  const problems: RevalidationOutcome[] = []
  let ok = 0
  let stale = 0
  let failed = 0

  const worker = async () => {
    for (;;) {
      const path = queue.shift()
      if (!path) return
      const outcome = await revalidateOne(target.baseUrl, target.bypassToken, path)
      if (outcome.status === 'success') ok++
      else {
        if (outcome.status === 'stale') stale++
        else failed++
        if (problems.length < 25) problems.push(outcome)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length || 1) }, worker))

  console.log(`[revalidation] ${target.baseUrl}: ${ok} ok, ${stale} stale, ${failed} failed (${paths.length} paths)`)
  if (problems.length) console.warn('[revalidation] problems', problems)

  return { enabled: true, baseUrl: target.baseUrl, ok, stale, failed, problems }
}
