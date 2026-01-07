import { getQuery, eventHandler } from 'h3'
import { algoliasearch } from 'algoliasearch'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()

  const userAgent = event.node.req.headers['user-agent'] || 'unknown'
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[search voyages] user-agent', userAgent)
  }

  // Initialize Algolia client
  const algoliaClient = algoliasearch(config.public.algolia.applicationId, process.env.ALGOLIA_API_READ_ID || config.public.algolia.apiKey)

  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()
  const optout = query.optout === 'true' ? true : false

  if (!searchTerm) {
    return []
  }

  try {
    // Search Algolia index
    const { results } = await algoliaClient.search({
      requests: [
        {
          indexName: 'odysway',
          query: searchTerm,
          hitsPerPage: 50,
          clickAnalytics: !optout,
          analytics: !optout,
        },
      ],
    })

    const hits = results[0]?.hits || []
    const queryID = results[0]?.queryID

    if (hits.length === 0) {
      return []
    }

    // Transform Algolia hits to frontend format
    const allResults = hits.filter((hit) => {
      if (hit.type === 'voyage') {
        console.log('=======hit=========', hit)
        return (hit.availabilityTypes?.includes('groupe') || hit.availabilityTypes?.includes('privatisation'))
      }
      return true
    }).map(hit => ({
      title: hit.title || hit.name,
      slug: hit.slug,
      dataSource: hit.type === 'voyage' ? 'voyages' : hit.type === 'destination' ? 'destinations' : 'regions',
      image: hit.image,
      description: hit.description,
      availabilityTypes: hit.availabilityTypes,
      difficulty: hit.difficulty,
      voyageCount: hit.voyageCount,
      score: hit._score || 1,
      objectID: hit.objectID,
      queryID: queryID,
    }))
    // console.log('=======allResults=========', allResults)

    // Sort by score (descending)
    const sortedResults = allResults.sort((a, b) => (b.score || 0) - (a.score || 0))

    return sortedResults
  }
  catch (error) {
    console.error('Error getting search results from Algolia:', error)
    return []
  }
})
