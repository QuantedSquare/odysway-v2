import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat, max_travelers, is_custom_travel, departure_date, return_date')
    .eq('deleted', false)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  const today = new Date()

  // Count number of dates per slug.
  // `booked_seats` reste le cumul de toutes les dates (compteur historique) ;
  // les champs `upcoming_*` ne portent que sur les départs à venir, qui sont
  // les seuls sur lesquels l'équipe peut encore agir.
  const slugMap = {}
  for (const row of data) {
    if (!row.travel_slug) continue
    if (!slugMap[row.travel_slug]) {
      slugMap[row.travel_slug] = {
        nb_dates: 0,
        booked_seats: 0,
        is_custom_travel: false,
        ongoing_dates: 0,
        upcoming_dates: 0,
        upcoming_booked: 0,
        upcoming_capacity: 0,
        next_departure: null,
      }
    }

    const travel = slugMap[row.travel_slug]
    travel.nb_dates++
    travel.booked_seats += row.booked_seat || 0
    travel.is_custom_travel = row.is_custom_travel

    const dep = new Date(row.departure_date)
    const ret = new Date(row.return_date)
    if (today >= dep && today <= ret) {
      travel.ongoing_dates += 1
    }

    if (dep >= today) {
      travel.upcoming_dates += 1
      travel.upcoming_booked += row.booked_seat || 0
      travel.upcoming_capacity += row.max_travelers || 0
      if (!travel.next_departure || dep < new Date(travel.next_departure)) {
        travel.next_departure = row.departure_date
      }
    }
  }

  return Object.entries(slugMap).map(([travel_slug, counters]) => ({
    travel_slug,
    ...counters,
  }))
})
