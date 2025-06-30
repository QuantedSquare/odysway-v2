export default defineNuxtRouteMiddleware((from, to) => {
  if (import.meta.client) {
    const booking_details = JSON.parse(localStorage.getItem(from.query.date_id))
    let targetQuery
    if (from.query.date_id && booking_details) {
      targetQuery = { booked_id: booking_details.booked_id, type: from.query.type, step: 1 }
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
