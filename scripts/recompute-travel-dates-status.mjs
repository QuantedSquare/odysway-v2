import supabase from '../server/utils/supabase.js'

function computeStatus({ booked_seat, min_travelers, max_travelers }) {
  const booked = Number(booked_seat || 0)
  const min = Number(min_travelers || 0)
  const max = Number(max_travelers || 0)

  if (max > 0 && booked >= max) return 'guaranteed'
  if (min > 0 && booked >= min) return 'confirmed'
  return 'soon_confirmed'
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    dryRun: args.has('--dry-run'),
    pageSize: (() => {
      const idx = argv.indexOf('--page-size')
      if (idx === -1) return 1000
      const v = Number(argv[idx + 1])
      return Number.isFinite(v) && v > 0 ? Math.floor(v) : 1000
    })(),
  }
}

async function main() {
  const { dryRun, pageSize } = parseArgs(process.argv)

  let from = 0
  let totalScanned = 0
  let totalToUpdate = 0
  let totalUpdated = 0

  console.log(`[status-backfill] start (dryRun=${dryRun}, pageSize=${pageSize})`)

  while (true) {
    const { data: rows, error } = await supabase
      .from('travel_dates')
      .select('id, booked_seat, min_travelers, max_travelers, status')
      .range(from, from + pageSize - 1)

    if (error) throw new Error(error.message)
    if (!rows || rows.length === 0) break

    totalScanned += rows.length

    const updates = []
    for (const row of rows) {
      const nextStatus = computeStatus(row)
      if (row.status !== nextStatus) {
        updates.push({ id: row.id, status: nextStatus })
      }
    }

    totalToUpdate += updates.length

    if (!dryRun && updates.length) {
      const CHUNK = 500
      for (let i = 0; i < updates.length; i += CHUNK) {
        const slice = updates.slice(i, i + CHUNK)
        const { error: upsertError, data: upserted } = await supabase
          .from('travel_dates')
          .upsert(slice, { onConflict: 'id' })
          .select('id')

        if (upsertError) throw new Error(upsertError.message)
        totalUpdated += upserted?.length || slice.length
      }
    }

    if (rows.length < pageSize) break
    from += pageSize
  }

  console.log(`[status-backfill] scanned=${totalScanned} toUpdate=${totalToUpdate} updated=${dryRun ? 0 : totalUpdated}`)

  console.log('[status-backfill] done')
}

main().catch((err) => {
  console.error('[status-backfill] failed:', err?.message || err)
  process.exit(1)
})
