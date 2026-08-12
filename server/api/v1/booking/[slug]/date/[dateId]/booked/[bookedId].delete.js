import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { bookedId } = event.context.params

  // Fetch the row to get travel_date_id (contrat null | row)
  const bookedRow = await booking.retrieveBookedDateById(bookedId)
  if (!bookedRow?.deal_id) {
    throw createError({ statusCode: 404, statusMessage: 'Impossible de trouver la réservation à supprimer.' })
  }

  const travel_date_id = bookedRow.travel_date_id
  console.log(`BMS: soft delete de la réservation ${bookedId} sur la date ${travel_date_id}`)

  const removed = await booking.softDeleteBookedDateById(bookedId, {
    user: bookingUser,
    reason: softDelete.REASONS.MANUAL,
  })
  if (removed.error) {
    throw createError({ statusCode: 500, statusMessage: removed.error })
  }

  // Update travel_dates.booked_seat
  const recompute = await booking.recomputeBookedSeatAndStatus(travel_date_id)
  if (recompute?.error) {
    throw createError({ statusCode: 500, statusMessage: recompute.error })
  }

  // Met le deal de départ en veille s'il ne reste aucun payant. Il n'est PAS
  // supprimé : une réaffectation du même pax doit retrouver son suivi AC.
  await departures.cleanupDepartureDealIfEmpty(travel_date_id)

  await logDateActivity(travel_date_id, bookingUser, 'deal_removed', { deal_id: bookedRow.deal_id, booked_id: bookedId })

  console.log(`BMS: réservation ${bookedId} masquée, booked_seat recalculé à ${recompute.booked_seat}`)
  return { success: true, booked_id: bookedId, booked_seat: recompute.booked_seat, status: recompute.status }
})
