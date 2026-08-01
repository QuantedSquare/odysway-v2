import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat, is_custom_travel, departure_date, return_date')

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  const today = new Date()

  // Count number of dates per slug
  const slugMap = {}
  for (const row of data) {
    if (!row.travel_slug) continue
    if (!slugMap[row.travel_slug]) {
      slugMap[row.travel_slug] = {
        nb_dates: 0,
        booked_seats: 0,
        is_custom_travel: false,
        ongoing_dates: 0,
      }
    }

    slugMap[row.travel_slug].nb_dates++
    slugMap[row.travel_slug].booked_seats += row.booked_seat || 0
    slugMap[row.travel_slug].is_custom_travel = row.is_custom_travel

    const dep = new Date(row.departure_date)
    const ret = new Date(row.return_date)
    if (today >= dep && today <= ret) {
      slugMap[row.travel_slug].ongoing_dates += 1
    }
  }

  return Object.entries(slugMap).map(([travel_slug, { nb_dates, booked_seats, is_custom_travel, ongoing_dates }]) => ({
    travel_slug,
    nb_dates,
    booked_seats,
    is_custom_travel,
    ongoing_dates,
  }))
})
