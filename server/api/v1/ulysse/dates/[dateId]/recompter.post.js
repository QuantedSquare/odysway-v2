import { createError, defineEventHandler } from 'h3'

// Recompte les places d'une date : Σ des réservations actives + co-remplissage,
// et le statut qui en découle. Correction de RES-07 (Docteur d'Ulysse), par la
// même fonction que chaque écriture du BMS.
//
//   POST /api/v1/ulysse/dates/:dateId/recompter
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const { dateId } = event.context.params

  const { data: avant, error } = await supabase.from('travel_dates').select('id, booked_seat, status').eq('id', dateId).maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!avant) throw createError({ statusCode: 404, statusMessage: 'Date introuvable.' })

  const apres = await booking.recomputeBookedSeatAndStatus(dateId)
  if (apres?.error) throw createError({ statusCode: 500, statusMessage: apres.error })

  await logDateActivity(dateId, user, 'seats_recomputed', {
    booked_seat: { avant: avant.booked_seat, apres: apres.booked_seat },
    status: { avant: avant.status, apres: apres.status },
    source: 'docteur',
  })
  return { dateId, avant: { bookedSeat: avant.booked_seat, statut: avant.status }, apres: { bookedSeat: apres.booked_seat, statut: apres.status } }
})
