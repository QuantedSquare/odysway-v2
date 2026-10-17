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
    .eq('deleted', false)
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

  const voyageurs = await avancerVoyageurs()

  return {
    success: true,
    scanned: rows.length,
    updated,
    voyageurs,
  }
})

/**
 * Voyageurs (pipeline 2) : « Voyage en cours » au départ, « Retour Client »
 * après le retour (server/utils/cycleVoyageur.js : les voyageurs soldés
 * seulement). Candidats lus dans le miroir, étape vérifiée dans AC avant
 * d'écrire : un commercial a pu la changer depuis la dernière synchronisation.
 */
async function avancerVoyageurs() {
  const aujourdhui = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
  const { data: candidats, error } = await supabase
    .from('activecampaign_deals')
    .select('id, stage_id, departure_date, return_date')
    .eq('pipeline_id', 2)
    .eq('status', 'Ouvert')
    .eq('deleted', false)
    .in('stage_id', [cycleVoyageur.ETAPES_P2.EN_ATTENTE_DEPART, cycleVoyageur.ETAPES_P2.VOYAGE_EN_COURS])
    .lte('departure_date', aujourdhui)
  if (error) {
    console.error('Voyageurs : lecture du miroir impossible', error.message)
    return { scanned: 0, updated: 0, erreur: error.message }
  }

  let updated = 0
  for (const c of candidats || []) {
    const attendue = cycleVoyageur.etapeVoyageurAttendue({ stage: c.stage_id, departureDate: c.departure_date, returnDate: c.return_date, aujourdhui })
    if (!attendue) continue
    try {
      const { deal } = await activecampaign.getDealById(c.id)
      if (String(deal?.stage) !== String(c.stage_id) || String(deal?.group) !== '2' || String(deal?.status) !== '0') continue
      await activecampaign.updateDeal(c.id, { stage: attendue })
      updated++
      console.log(`Voyageur ${c.id} : étape ${c.stage_id} → ${attendue}`)
    }
    catch (err) {
      console.error(`Voyageur ${c.id} : étape non avancée`, err?.message)
    }
  }
  return { scanned: (candidats || []).length, updated }
}
