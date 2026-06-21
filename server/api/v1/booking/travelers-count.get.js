import { defineEventHandler, getQuery } from 'h3'

// Returns the cumulated number of travellers who have actually booked each
// requested voyage (used by the "best-sellers" badge "N voyageurs partis").
// booked_dates has no slug column, so we resolve travel_date_id -> travel_slug
// via travel_dates, then sum booked_places per slug for real bookings only.
export default defineEventHandler(async (event) => {
  const { slugs } = getQuery(event)

  const slugList = typeof slugs === 'string'
    ? slugs.split(',').map(s => s.trim()).filter(Boolean)
    : []

  if (!slugList.length) {
    return {}
  }

  // 1. Map every travel_date id to its voyage slug
  const { data: travelDates, error: tdError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug')
    .in('travel_slug', slugList)

  if (tdError) {
    console.error('travelers-count travel_dates error', tdError)
    return {}
  }
  if (!travelDates?.length) return {}

  const slugByDateId = {}
  for (const d of travelDates) {
    slugByDateId[d.id] = d.travel_slug
  }
  const dateIds = travelDates.map(d => d.id)

  // 2. Sum booked seats per travel_date for real bookings only
  const { data: bookings, error: bError } = await supabase
    .from('booked_dates')
    .select('travel_date_id, booked_places')
    .in('travel_date_id', dateIds)
    .eq('deleted', false)
    .eq('is_test', false)
    .eq('is_option', false)

  if (bError) {
    console.error('travelers-count booked_dates error', bError)
    return {}
  }

  const counts = {}
  for (const slug of slugList) {
    counts[slug] = 0
  }
  for (const b of bookings || []) {
    const slug = slugByDateId[b.travel_date_id]
    if (!slug) continue
    counts[slug] += Number(b.booked_places) || 0
  }

  return counts
})
