import { getQuery, eventHandler } from 'h3'
import { createClient } from '@sanity/client'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()

  // if (searchTerm && searchTerm.length > 0) {
  //   const lowerCaseSearchTerm = searchTerm.toLowerCase()

  //   const voyages = await
  //   sanityClient.fetch(`*[_type == "voyage" && (
  //       !('custom' in availabilityTypes) ||
  //       (count(availabilityTypes) > 1)
  //     )]{
  //       title,
  //       description,
  //       "slug": slug.current,
  //       experienceType->{
  //        badgeTitle,
  //       }
  //     }`)

  //   function filterAndMapData(data, dataSource) {
  //     const searchKeywords = lowerCaseSearchTerm.split(/\s+/).filter(k => k.length > 0)

  //     return data
  //       .filter((item) => {
  //         const fetchedText = (item.title || item.nom).toLowerCase() + item.description?.toLowerCase()
  //         console.log('fetched text ', fetchedText)
  //         const itemSlug = item.slug.toLowerCase()

  //         return searchKeywords.some((keyword) => {
  //           return fetchedText.includes(keyword) || itemSlug.includes(keyword)
  //         })
  //       })
  //       .map(item => ({
  //         title: item.title || item.nom,
  //         slug: item.slug,
  //         dataSource,
  //       }))
  //   }

  //   const searchResults = [
  //     ...filterAndMapData(voyages, 'voyages'),
  //   ]

  //   return searchResults
  // }
  if (searchTerm && searchTerm.length > 0) {
    // Escape special characters to prevent injection issues and ensure the query is valid.
    const cleanSearchTerm = searchTerm.replace(/["']/g, '\\$&')

    const searchFilter = `[title, description, slug.current, destinations, experienceType, categories, authorNote ] match "*${cleanSearchTerm}*"`

    const voyages = await sanityClient.fetch(`
      *[_type == "voyage" && (${searchFilter}) && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      )]{
        title,
        "slug": slug.current,
      }
    `)

    const searchResults = voyages.map(item => ({
      title: item.title,
      slug: item.slug,
      dataSource: 'voyages',
    }))

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
