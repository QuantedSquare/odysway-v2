import { defineEventHandler, getHeader, createError } from 'h3'

/**
 * Cron endpoint that iterates over all travel_dates with a departure_id and
 * moves the corresponding "Gestions Départs" deal (pipeline 4) to the correct
 * stage based on the current date and booking fill state.
 *
 * Call via: POST /api/v1/webhooks/booking/departure-stages
 * Requires header: x-cron-secret: <CRON_SECRET>
 */
export default defineEventHandler(async (event) => {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = getHeader(event, 'x-cron-secret')
  if (!headerSecret || headerSecret !== cronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Fetch all travel_dates that have a departure record deal, including past ones so they
  // can be moved to RETOUR_VOYAGE. The diff check below prevents redundant AC updates.
  const { data: rows, error: fetchError } = await supabase
    .from('travel_dates')
    .select('id, departure_date, return_date, booked_seat, min_travelers, departure_id')
    .not('departure_id', 'is', null)

  if (fetchError) {
    throw createError({ statusCode: 500, statusMessage: fetchError.message })
  }

  if (!rows || rows.length === 0) {
    return { success: true, scanned: 0, updated: 0 }
  }

  let updated = 0

  for (const row of rows) {
    try {
      const stageId = departures.computeDepartureStage(
        row.departure_date,
        row.return_date,
        row.booked_seat,
        row.min_travelers,
      )

      // Fetch the current stage of the departure deal to avoid unnecessary updates
      const { deal } = await activecampaign.getDealById(row.departure_id)
      const currentStage = deal?.stage ? String(deal.stage) : null

      if (currentStage !== String(stageId)) {
        await activecampaign.updateDeal(row.departure_id, {
          stage: String(stageId),
        })
        updated++
        console.log(`Departure deal ${row.departure_id} (travel_date ${row.id}): stage ${currentStage} → ${stageId}`)
      }
    }
    catch (err) {
      console.error(`Error syncing departure deal for travel_date ${row.id}:`, err.message)
    }
  }

  return {
    success: true,
    scanned: rows.length,
    updated,
  }
})
