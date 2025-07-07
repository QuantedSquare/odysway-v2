export default defineNuxtRouteMiddleware(async (from, to) => {
  if (import.meta.client) {
    const booking_details = JSON.parse(localStorage.getItem(from.query.date_id))
    let targetQuery
    if (from.query.date_id && booking_details) {
      targetQuery = { booked_id: booking_details.booked_id, type: from.query.type, step: 1 }
      try {
        const isBookingExisting = await apiRequest(`/booking/booking-exists?booked_id=${booking_details.booked_id}`)
        if (!isBookingExisting) {
          console.log('navigate to checkout', from.query.date_id)
          localStorage.removeItem(from.query.date_id)
          return navigateTo({
            path: '/checkout',
            query: { date_id: from.query.date_id, type: from.query.type, step: 1 },
          })
        }
      }
      catch (error) {
        console.log('error', error)
      }
    }
    else {
      targetQuery = from.query
    }
    // Only redirect if the query is different
    if (
      from.path !== '/checkout'
      || JSON.stringify(from.query) !== JSON.stringify(targetQuery)
    ) {
      return navigateTo({
        path: '/checkout',
        query: targetQuery,
      })
    }
  }
})
