import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('travel_dates')
    .select('id, travel_slug, departure_date, return_date, departure_id, booked_seat, max_travelers, published, status, displayed_status')
    .order('departure_date', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
