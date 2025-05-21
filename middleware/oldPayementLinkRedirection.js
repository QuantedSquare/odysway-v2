import supabase from '~/server/utils/supabase'

export default defineNuxtRouteMiddleware(async (to) => {
  const route = useRoute()
  let query = { step: 1 }

  if (route.query.isSold === 'true') {
    Object.assign(query, { type: 'balance' })
  }
  else if (route.query.acompte === 'true') {
    Object.assign(query, { type: 'deposit' })
  }
  else {
    Object.assign(query, { type: 'custom', amount: route.query.amount })
  }
  const { data: existingBookedDate, error } = await supabase
    .from('booked_dates')
    .select('*')
    .eq('deal_id', route.query.orderId)
  console.log('existingBookedDate', existingBookedDate)

  if (error) {
    console.error('Error fetching existing booked date:', error)
  }
  if (existingBookedDate.length > 0) {
    Object.assign(query, { booked_id: existingBookedDate[0].id })

    return navigateTo({
      path: '/checkout',
      query,
    })
  }
  else {
    const deal = await apiRequest(`/ac/deals/${route.query.orderId}`)
    console.log('deal', deal)

    const { data: existingTravelDate } = await supabase
      .from('travel_dates')
      .select('*')
      .eq('departure_date', deal.departureDate)
      .eq('travel_slug', deal.slug)

    console.log('existingTravelDate', existingTravelDate)

    if (existingTravelDate.length > 0) {
      const addedBookedDate = await apiRequest(`/booking/${deal.slug}/date/${existingTravelDate[0].id}/assign-deal`, 'post', {
        dealId: route.query.orderId,
        booked_places: 0, // this value is update after a payment
      })
      console.log('addedBookedDate', addedBookedDate)
      Object.assign(query, { booked_id: addedBookedDate.id })
      return navigateTo({
        path: '/checkout',
        query,
      })
    }
    else {
      const newBooking = await apiRequest(`/booking/add-date`, 'post', {
        travel_slug: deal.slug,
        published: false,
        displayed_status: 'soon_confirmed',
        departure_date: deal.departureDate,
        return_date: deal.returnDate,
        starting_price: +deal.basePricePerTraveler / 100,
        max_travelers: 6,
        min_travelers: 1,
        early_bird: deal.gotEarlyBird === 'Oui',
        last_minute: deal.gotLastMinute === 'Oui',
        include_flight: deal.includedFlight === 'Oui',
        booked_seat: 0,
        flight_price: +deal.flightPrice / 100,
        badges: '',
      })
      console.log('newBooking', newBooking)
      const addedBookedDate = await apiRequest(`/booking/${deal.slug}/date/${newBooking.id}/assign-deal`, 'post', {
        dealId: route.query.orderId,
        booked_places: 0, // this value is update after a payment
      })
      Object.assign(query, { booked_id: addedBookedDate.id })
      return navigateTo({
        path: '/checkout',
        query,
      })
    }
  }
})
