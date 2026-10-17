import { createError, defineEventHandler, readBody } from 'h3'

// Places d'une réservation alignées sur les voyageurs du deal (RES-02 du
// Docteur d'Ulysse), puis recompte de la date.
//
//   POST /api/v1/ulysse/booked/:bookedId/places
//   en-têtes x-ulysse-service-token, x-ulysse-user
//   corps    { places: entier ≥ 1, avant: entier }
// 409 si la réservation ne compte plus `avant` places, ou si elle est supprimée.

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const { bookedId } = event.context.params
  const b = (await readBody(event).catch(() => null)) || {}
  if (!Number.isInteger(b.places) || b.places < 1 || b.places > 99) {
    throw createError({ statusCode: 400, statusMessage: 'Places : un entier de 1 à 99.' })
  }
  if (!Number.isInteger(b.avant)) throw createError({ statusCode: 400, statusMessage: '`avant` requis : les places lues par Ulysse.' })

  const resa = await booking.retrieveBookedDateById(bookedId, { includeDeleted: true })
  if (!resa) throw createError({ statusCode: 404, statusMessage: 'Réservation introuvable.' })
  if (resa.deleted) throw createError({ statusCode: 409, statusMessage: 'Réservation supprimée : restaurez-la d\'abord.' })
  if (Number(resa.booked_places) !== b.avant) {
    throw createError({ statusCode: 409, statusMessage: 'Les places ont changé depuis l\'affichage.', data: { places: Number(resa.booked_places) } })
  }

  const { error } = await supabase.from('booked_dates').update({ booked_places: b.places }).eq('id', bookedId).eq('deleted', false)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const date = await booking.recomputeBookedSeatAndStatus(resa.travel_date_id)
  if (date?.error) throw createError({ statusCode: 500, statusMessage: date.error })

  await logDateActivity(resa.travel_date_id, user, 'booked_places_updated', {
    booked_id: bookedId, deal_id: resa.deal_id, booked_places: { avant: b.avant, apres: b.places }, source: 'docteur',
  })
  return { bookedId, places: b.places, date: { id: resa.travel_date_id, bookedSeat: date.booked_seat, statut: date.status } }
})
