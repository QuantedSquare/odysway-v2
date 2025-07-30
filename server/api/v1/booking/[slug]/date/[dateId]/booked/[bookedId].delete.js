import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const { bookedId } = event.context.params
  // Fetch the row to get travel_date_id
  const bookedRow = await booking.retrieveBookedDateById(bookedId)

  if (!bookedRow.deal_id || bookedRow.error) return { error: 'Impossible de trouver la réservation à supprimer.' }
  const travel_date_id = bookedRow.travel_date_id

  // Delete the row from Supabase and AC
  await activecampaign.deleteDeal(bookedRow.deal_id)

  const deletedBookedId = await booking.deleteBookedDateById(bookedId)
  if (deletedBookedId.error) return { error: deletedBookedId.error }

  // Update travel_dates.booked_seat
  const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id)
  if (allBooked.error) return { error: allBooked.error }

  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  await booking.updateTravelDate(travel_date_id, totalBooked)
})
