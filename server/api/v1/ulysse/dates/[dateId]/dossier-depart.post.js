import { createError, defineEventHandler } from 'h3'

// Resynchronise le dossier de départ (pipeline 4) d'une date : valeur et
// voyageurs agrégés, étape selon les dates et le remplissage — le calcul de
// chaque paiement. Correction de RES-11 du Docteur d'Ulysse. Miroir réécrit.
//
//   POST /api/v1/ulysse/dates/:dateId/dossier-depart
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const { dateId } = event.context.params

  let r
  try {
    r = await departures.resyncDepartureDeal(dateId)
  }
  catch (err) {
    console.error('[ulysse/dossier-depart]', dateId, err?.message)
    throw createError({ statusCode: 502, statusMessage: `Dossier de départ non resynchronisé : ${err?.message}` })
  }
  if (!r) throw createError({ statusCode: 409, statusMessage: 'Cette date n\'a pas de dossier de départ : rattachez-en un d\'abord.' })

  let miroir = 'a_jour'
  try {
    await dealMirrorSync.resynchroniserDeal(r.departureDealId)
  }
  catch (err) {
    miroir = 'erreur'
    console.error('[ulysse/dossier-depart] miroir', r.departureDealId, err?.message)
  }
  await logDateActivity(dateId, user, 'departure_deal_resynced', { departure_id: r.departureDealId, stage: r.stage, value: r.value / 100, nb_travelers: r.nbTravelers, source: 'docteur' })
  return { resultat: 'resynchronise', dossier: r.departureDealId, etape: String(r.stage), valeur: r.value / 100, voyageurs: r.nbTravelers, miroir }
})
