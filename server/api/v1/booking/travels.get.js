import { defineEventHandler } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug')

  if (error) {
    return []
  }

  // Count number of dates per slug
  const slugMap = {}
  for (const row of data) {
    if (!row.travel_slug) continue
    if (!slugMap[row.travel_slug]) slugMap[row.travel_slug] = 0
    slugMap[row.travel_slug]++
  }
  return Object.entries(slugMap).map(([travel_slug, nb_dates]) => ({ travel_slug, nb_dates }))
})
