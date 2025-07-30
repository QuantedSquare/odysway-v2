import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const { bookedId } = event.context.params
  // // Fetch the row to get travel_date_id
  // const { data: bookedRow, error: fetchError } = await supabase
  //   .from('booked_dates')
  //   .select('travel_date_id')
  //   .eq('id', bookedId)
  //   .single()

  // console.log('======bookedRow=======', bookedRow, fetchError)
  // if (fetchError || !bookedRow) return { error: 'Impossible de trouver la réservation à supprimer.' }
  // const travel_date_id = bookedRow.travel_date_id

  // // Delete the row
  // const { error } = await supabase
  //   .from('booked_dates')
  //   .delete()
  //   .eq('id', bookedId)
  // if (error) return { error: error.message }

  // // Update travel_dates.booked_seat
  // const { data: allBooked, error: sumError } = await supabase
  //   .from('booked_dates')
  //   .select('booked_places')
  //   .eq('travel_date_id', travel_date_id)
  // if (sumError) return { error: sumError.message }
  // const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  // await supabase
  //   .from('travel_dates')
  //   .update({ booked_seat: totalBooked })
  //   .eq('id', travel_date_id)

  // Fetch the row to get travel_date_id
  const bookedRow = await booking.retrieveBookedDateByDealId(bookedId)

  if (!bookedRow) return { error: 'Impossible de trouver la réservation à supprimer.' }

  const travel_date_id = bookedRow.travel_date_id

  // Delete the row
  await booking.deleteBookedDateByDealId(bookedId)

  // Update travel_dates.booked_seat
  const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id)
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  await booking.updateTravelDate(travel_date_id, totalBooked)

  return { success: true }
})
