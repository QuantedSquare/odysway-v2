import { defineEventHandler } from 'h3'


export default defineEventHandler(async (event) => {
  const travelDateId = event.context.params.travelDateId
  // Delete related booked_dates first
  const { error: bookedError } = await supabase
    .from('booked_dates')
    .delete()
    .eq('travel_date_id', travelDateId)
  if (bookedError) return { error: bookedError.message }
  // Delete the travel_dates row
  const { error } = await supabase
    .from('travel_dates')
    .delete()
    .eq('id', travelDateId)
  if (error) return { error: error.message }
  return { success: true }
})
