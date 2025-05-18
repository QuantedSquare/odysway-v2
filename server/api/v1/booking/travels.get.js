import { defineEventHandler } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat')

  if (error) {
    return []
  }

  // Count number of dates per slug
  const slugMap = {}
  for (const row of data) {
    if (!row.travel_slug) continue
    if (!slugMap[row.travel_slug]) {
      slugMap[row.travel_slug] = {
        nb_dates: 0,
        booked_seats: 0,
      }
    }
    slugMap[row.travel_slug].nb_dates++
    slugMap[row.travel_slug].booked_seats += row.booked_seat || 0
  }
  return Object.entries(slugMap).map(([travel_slug, { nb_dates, booked_seats }]) => ({ travel_slug, nb_dates, booked_seats }))
})
