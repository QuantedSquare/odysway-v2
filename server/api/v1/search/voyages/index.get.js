import { getQuery, eventHandler } from 'h3'
import { createClient } from '@sanity/client'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()

  const userAgent = event.node.req.headers['user-agent'] || 'unknown'
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[search voyages] user-agent', userAgent)
  }

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()

  if (searchTerm && searchTerm.length > 0) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()

    const [destinations, regions, voyages] = await Promise.all([
      sanityClient.fetch(`*[_type == "destination"]{
        title,
        "slug": slug.current
      }`),
      sanityClient.fetch(`*[_type == "region"]{
        nom,
        "slug": slug.current
      }`),
      sanityClient.fetch(`*[_type == "voyage" && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      )]{
        title,
        "slug": slug.current
      }`),
    ])

    function filterAndMapData(data, dataSource) {
      return data
        .filter((item) => {
          const name = item.title || item.nom
          return name.toLowerCase().includes(lowerCaseSearchTerm) || item.slug.includes(lowerCaseSearchTerm)
        })
        .map(item => ({
          title: item.title || item.nom,
          slug: item.slug,
          dataSource,
        }))
    }

    const searchResults = [
      ...filterAndMapData(destinations, 'destinations'),
      ...filterAndMapData(regions, 'regions'),
      ...filterAndMapData(voyages, 'voyages'),
    ]

    return searchResults
  }
  else {
    const [destinations, regions] = await Promise.all([
      sanityClient.fetch(`*[_type == "destination"]{
        title,
        "slug": slug.current,
        isTopDestination
      }`),
      sanityClient.fetch(`*[_type == "region"]{
        nom,
        "slug": slug.current
      }`),
    ])

    const topDestinations = destinations
      .filter(destination => destination.isTopDestination)
      .map(destination => ({
        title: destination.title,
        slug: destination.slug,
        dataSource: 'destinations',
      }))

    const regionsMap = regions.map(region => ({
      title: region.nom,
      slug: region.slug,
      dataSource: 'regions',
    }))

    return [...topDestinations, ...regionsMap]
  }
})
