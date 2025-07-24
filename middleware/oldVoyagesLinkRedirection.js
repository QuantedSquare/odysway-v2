export default defineNuxtRouteMiddleware(async (to) => {
  // Extract slug from the path (last segment)
  const pathSegments = to.path.split('/')
  const voyageSlug = pathSegments[pathSegments.length - 1]

  const { data: voyage } = await useAsyncData('voyage', () =>
    queryCollection('voyages').where('slug', '=', voyageSlug).where('published', '=', true).first(),
  )

  if (voyage.value) {
    return navigateTo(`/voyages/${voyageSlug}`)
  }
  else {
    return navigateTo('/search')
  }
})
