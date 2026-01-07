import { defineEventHandler, getHeader, readBody, createError } from 'h3'

function computeStatus({ booked_seat, min_travelers, max_travelers }) {
  const booked = Number(booked_seat || 0)
  const min = Number(min_travelers || 0)
  const max = Number(max_travelers || 0)

  // Highest priority first
  if (max > 0 && booked >= max) return 'guaranteed'
  if (min > 0 && booked >= min) return 'confirmed'
  return 'soon_confirmed'
}

function extractRecord(body) {
  // Supabase webhooks can send different shapes depending on configuration
  return body?.record || body?.new || body?.data?.record || body?.data?.new || null
}

const DEBOUNCE_MS = 10_000
let lastRunAt = 0

export default defineEventHandler(async (event) => {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = getHeader(event, 'x-cron-secret')
  if (!headerSecret || headerSecret !== cronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Best-effort debounce to avoid webhook cascades (per-process)
  const now = Date.now()
  if (now - lastRunAt < DEBOUNCE_MS) {
    return { success: true, skipped: true, reason: 'debounced' }
  }
  lastRunAt = now

  const body = await readBody(event)
  // Still parse payload for debugging / future use, but we intentionally recompute for ALL rows.
  const record = extractRecord(body)

  const PAGE_SIZE = 1000
  let from = 0
  let totalScanned = 0
  let totalUpdated = 0

  while (true) {
    const { data: rows, error: fetchError } = await supabase
      .from('travel_dates')
      .select('id, booked_seat, min_travelers, max_travelers, status')
      .range(from, from + PAGE_SIZE - 1)

    if (fetchError) {
      throw createError({ statusCode: 500, statusMessage: fetchError.message })
    }
    if (!rows || rows.length === 0) break

    totalScanned += rows.length

    const updates = []
    for (const row of rows) {
      const nextStatus = computeStatus(row)
      if (row.status !== nextStatus) {
        updates.push({ id: row.id, status: nextStatus })
      }
    }

    // Update only rows that need it (still may trigger webhooks per row, hence debounce)
    if (updates.length) {
      // Chunk to keep payload sizes reasonable
      const CHUNK = 500
      for (let i = 0; i < updates.length; i += CHUNK) {
        const slice = updates.slice(i, i + CHUNK)
        const { error: upsertError, data: upserted } = await supabase
          .from('travel_dates')
          .upsert(slice, { onConflict: 'id' })
          .select('id')

        if (upsertError) {
          throw createError({ statusCode: 500, statusMessage: upsertError.message })
        }
        totalUpdated += upserted?.length || slice.length
      }
    }

    if (rows.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return {
    success: true,
    updated: totalUpdated,
    scanned: totalScanned,
    trigger: record?.id ? { id: record.id } : null,
  }
})
