import supabase from '~/server/utils/supabase'

export default defineNuxtRouteMiddleware(async () => {
  const route = useRoute()
  let query = buildQuery(route)

  // Try to find an existing booked date
  const { data: existingBookedDate, error: bookedDateError } = await supabase
    .from('booked_dates')
    .select('*')
    .eq('deal_id', route.query.orderId)

  if (bookedDateError) {
    console.error('Error fetching existing booked date:', bookedDateError)
    return // Optionally, redirect to an error page
  }

  if (existingBookedDate && existingBookedDate.length > 0) {
    query.booked_id = existingBookedDate[0].id
    return redirectToCheckout(query)
  }

  // No existing booked date, fetch deal
  const deal = await apiRequest(`/ac/deals/${route.query.orderId}`)
  if (!deal) {
    console.error('Forbidden')
    return // Optionally, redirect to an error page
  }

  // Try to find an existing travel date
  const { data: existingTravelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('departure_date', deal.departureDate)
    .eq('travel_slug', deal.slug)

  if (travelDateError) {
    console.error('Error fetching travel date:', travelDateError)
    return // Optionally, redirect to an error page
  }

  if (existingTravelDate && existingTravelDate.length > 0) {
    // Assign deal to existing travel date
    const addedBookedDate = await assignDealToDate(deal.slug, existingTravelDate[0].id, route.query.orderId)
    if (!addedBookedDate) return
    query.booked_id = addedBookedDate.id
    return redirectToCheckout(query)
  }

  // No travel date found, create a new one
  const newBooking = await createNewBooking(deal)
  if (!newBooking) return
  const addedBookedDate = await assignDealToDate(deal.slug, newBooking.id, route.query.orderId)
  if (!addedBookedDate) return
  query.booked_id = addedBookedDate.id
  return redirectToCheckout(query)
})

// --- Helper Functions ---

function buildQuery(route) {
  const query = { step: 1 }
  if (route.query.isSold === 'true') {
    query.type = 'balance'
  }
  else if (route.query.acompte === 'true') {
    query.type = 'deposit'
  }
  else {
    query.type = 'custom'
    query.amount = route.query.amount
  }
  return query
}

async function assignDealToDate(slug, dateId, orderId) {
  try {
    const addedBookedDate = await apiRequest(`/booking/${slug}/date/${dateId}/assign-deal`, 'post', {
      dealId: orderId,
      booked_places: 0, // this value is updated after a payment
    })
    return addedBookedDate
  }
  catch (err) {
    console.error('Error assigning deal to date:', err)
    return null
  }
}

async function createNewBooking(deal) {
  try {
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
    return newBooking
  }
  catch (err) {
    console.error('Error creating new booking:', err)
    return null
  }
}

function redirectToCheckout(query) {
  return navigateTo({
    path: '/checkout',
    query,
  })
}
