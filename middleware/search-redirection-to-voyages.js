export default defineNuxtRouteMiddleware((to) => {
  // Build the target URL by keeping all existing query parameters
  const queryString = Object.keys(to.query).length
    ? '?' + new URLSearchParams(to.query).toString()
    : ''
  return navigateTo(`/voyages${queryString}`)
})
