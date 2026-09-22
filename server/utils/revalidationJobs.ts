import supabase from './supabase'
import type { RevalidationOutcome } from './revalidationRunner'

/**
 * Sweep bookkeeping in Supabase: the lock that keeps two full sweeps from running
 * at once, the cursor that lets a sweep span several function invocations, and the
 * audit trail that answers "why is this page still stale?".
 *
 * The lock is a partial unique index on `status = 'running'` (see
 * supabase/migrations/..._revalidation_jobs.sql), so acquiring it is atomic: a
 * concurrent insert fails with 23505 rather than racing.
 */

export const SWEEP_CHUNK_SIZE = Number(process.env.REVALIDATION_CHUNK_SIZE || 40)
/** A burst of edits collapses into at most this many sweep passes. */
export const SWEEP_MAX_PASSES = 5

export type SweepJob = {
  id: string
  kind: string
  status: string
  cursor: number
  total: number
  pass: number
  rerun_requested: boolean
  paths: string[]
  ok: number
  stale: number
  failed: number
  trigger_type: string | null
  trigger_reason: string | null
  started_at: string
  heartbeat_at: string
}

export type SweepTrigger = {
  kind?: string
  type?: string | null
  id?: string | null
  rev?: string | null
  reason?: string | null
}

/** Frees jobs whose invocation died mid-chain, so the lock can never wedge. */
async function releaseStaleJobs() {
  const { error } = await supabase
    .from('revalidation_jobs')
    .update({ status: 'stale', finished_at: new Date().toISOString() })
    .eq('status', 'running')
    .lt('heartbeat_at', new Date(Date.now() - 3 * 60 * 1000).toISOString())
  if (error) console.error('[revalidation] could not release stale jobs', error)
}

export async function startSweepJob(paths: string[], trigger: SweepTrigger = {}) {
  await releaseStaleJobs()

  const { data, error } = await supabase
    .from('revalidation_jobs')
    .insert({
      kind: trigger.kind || 'global',
      trigger_type: trigger.type ?? null,
      trigger_id: trigger.id ?? null,
      trigger_rev: trigger.rev ?? null,
      trigger_reason: trigger.reason ?? null,
      paths,
      total: paths.length,
    })
    .select()
    .single()

  if (!error) return { job: data as SweepJob, blocked: false as const }

  // 23505 = unique violation on the single-running-job index: a sweep is already
  // walking every path. Asking it for one more pass is both cheaper and more
  // correct than starting a second one (a path it has already passed would
  // otherwise keep the old content).
  if (error.code === '42P01') {
    throw new Error('revalidation_jobs table is missing — apply supabase/migrations/20260911120000_revalidation_jobs.sql')
  }
  if (error.code === '23505') {
    const running = await currentRunningJob()
    if (running) {
      await supabase.from('revalidation_jobs').update({ rerun_requested: true }).eq('id', running.id)
      console.log(`[revalidation] sweep already running (${running.id}) — queued another pass`)
      return { job: running, blocked: true as const }
    }
  }
  throw error
}

export async function currentRunningJob(): Promise<SweepJob | null> {
  const { data, error } = await supabase
    .from('revalidation_jobs')
    .select('*')
    .eq('status', 'running')
    .order('started_at', { ascending: false })
    .limit(1)
  if (error) {
    console.error('[revalidation] could not read running job', error)
    return null
  }
  return (data?.[0] as SweepJob) || null
}

export async function loadSweepJob(id: string): Promise<SweepJob | null> {
  const { data, error } = await supabase.from('revalidation_jobs').select('*').eq('id', id).single()
  if (error) {
    console.error('[revalidation] could not load job', id, error)
    return null
  }
  return data as SweepJob
}

export async function advanceSweepJob(job: SweepJob, chunk: {
  cursor: number
  ok: number
  stale: number
  failed: number
  problems: RevalidationOutcome[]
}) {
  const { error } = await supabase
    .from('revalidation_jobs')
    .update({
      cursor: chunk.cursor,
      ok: job.ok + chunk.ok,
      stale: job.stale + chunk.stale,
      failed: job.failed + chunk.failed,
      heartbeat_at: new Date().toISOString(),
      ...(chunk.problems.length ? { problems: chunk.problems.slice(0, 25) } : {}),
    })
    .eq('id', job.id)
  if (error) console.error('[revalidation] could not advance job', job.id, error)
}

/** Restarts the cursor for another pass over every path (edits arrived mid-sweep). */
export async function restartSweepJob(job: SweepJob, paths: string[]) {
  const { error } = await supabase
    .from('revalidation_jobs')
    .update({
      cursor: 0,
      pass: job.pass + 1,
      rerun_requested: false,
      paths,
      total: paths.length,
      heartbeat_at: new Date().toISOString(),
    })
    .eq('id', job.id)
  if (error) console.error('[revalidation] could not restart job', job.id, error)
}

export async function finishSweepJob(job: SweepJob, status: 'done' | 'failed' = 'done') {
  const { error } = await supabase
    .from('revalidation_jobs')
    .update({ status, finished_at: new Date().toISOString(), heartbeat_at: new Date().toISOString() })
    .eq('id', job.id)
  if (error) console.error('[revalidation] could not finish job', job.id, error)
}

/**
 * One row per webhook. Cheap, and the only way to find out after the fact that a
 * document type resolved to zero paths or that Sanity never served the new revision.
 */
export async function logRevalidationEvent(row: {
  doc_type?: string | null
  doc_id?: string | null
  doc_rev?: string | null
  scope?: string | null
  mode?: string | null
  known_type?: boolean
  paths?: string[]
  ok?: number
  stale?: number
  failed?: number
  revision_confirmed?: boolean
  revision_wait_ms?: number
  job_id?: string | null
  reason?: string | null
}) {
  const { error } = await supabase.from('revalidation_events').insert({
    ...row,
    // A global sweep has no path list worth storing here; the job row has it.
    paths: (row.paths || []).slice(0, 100),
  })
  if (error) console.error('[revalidation] could not log event', error)
}
