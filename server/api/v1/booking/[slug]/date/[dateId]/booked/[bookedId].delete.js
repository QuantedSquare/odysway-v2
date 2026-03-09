import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { bookedId } = event.context.params

  // Fetch the row to get travel_date_id
  const bookedRow = await booking.retrieveBookedDateById(bookedId)
  if (bookedRow.error || !bookedRow.deal_id) {
    throw createError({ statusCode: 404, statusMessage: 'Impossible de trouver la réservation à supprimer.' })
  }

  console.log('BMS: bookedRow =', bookedRow)
  const travel_date_id = bookedRow.travel_date_id
  console.log(`BMS: Deleting booked reservation ${bookedId} for travel_date ${travel_date_id}`)

  const deletedBookedId = await booking.deleteBookedDateById(bookedId)
  if (deletedBookedId.error) {
    throw createError({ statusCode: 500, statusMessage: deletedBookedId.error })
  }

  // Update travel_dates.booked_seat
  const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id)
  if (allBooked.error) {
    throw createError({ statusCode: 500, statusMessage: allBooked.error })
  }

  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  await booking.updateTravelDate(travel_date_id, totalBooked)

  // Remove departure record deal if no paying clients remain
  await departures.cleanupDepartureDealIfEmpty(travel_date_id)

  console.log(`BMS: Successfully deleted booked reservation ${bookedId}, updated total booked seats to ${totalBooked}`)
  return { success: true }
})
