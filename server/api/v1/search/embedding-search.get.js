import { getQuery, eventHandler } from 'h3'
import { createClient } from '@sanity/client'
import { algoliasearch } from 'algoliasearch'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()

  const userAgent = event.node.req.headers['user-agent'] || 'unknown'
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[search voyages] user-agent', userAgent)
  }

  // Initialize Algolia client
  const algoliaClient = algoliasearch(config.public.algolia.applicationId, config.public.algolia.apiKey)

  // Initialize Sanity client for relationship expansion only
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: 'vX',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })

  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()

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
          clickAnalytics: true,
        },
      ],
    })

    const hits = results[0]?.hits || []
    const queryID = results[0]?.queryID

    if (hits.length === 0) {
      return []
    }

    // Transform Algolia hits to frontend format
    const allResults = hits.map(hit => ({
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
      queryID: queryID
    }))

    // RELATIONSHIP EXPANSION: If regions were found, expand to include related destinations and voyages
    const regionHits = hits.filter(hit => hit.type === 'region')

    if (regionHits.length > 0) {
      // Get region IDs by querying Sanity with slugs
      const regionSlugs = regionHits.map(r => r.slug)
      const regionIdsQuery = `*[_type == "region" && slug.current in $regionSlugs]._id`
      const regionIds = await sanityClient.fetch(regionIdsQuery, { regionSlugs })

      if (regionIds.length > 0) {
        // Find all destinations that belong to these regions
        const expansionQuery = `
        {
          "destinations": *[_type == "destination" && references(*[_type == "region" && _id in $regionIds]._id)]{
            _id,
            title,
            "slug": slug.current,
            "image": image.asset->url,
            metaDescription
          },
          "voyages": *[_type == "voyage" && references(*[_type == "destination" && references(*[_type == "region" && _id in $regionIds]._id)]._id) && (
            !('custom' in availabilityTypes) ||
            (count(availabilityTypes) > 1)
          )]{
            _id,
            title,
            "slug": slug.current,
            "image": image.asset->url,
            description,
            availabilityTypes,
            "difficulty": difficultyLevel->title
          }
        }
        `

        const expandedResults = await sanityClient.fetch(expansionQuery, { regionIds })

        // Add expanded destinations with reduced score
        if (expandedResults.destinations) {
          expandedResults.destinations.forEach(d => {
            const alreadyExists = allResults.some(r => r.slug === d.slug && r.dataSource === 'destinations')
            if (!alreadyExists) {
              const maxRegionScore = Math.max(...regionHits.map(r => r._score || 1))
              allResults.push({
                title: d.title,
                slug: d.slug,
                dataSource: 'destinations',
                image: d.image,
                description: d.metaDescription,
                score: maxRegionScore * 0.95
              })
            }
          })
        }

        // Add expanded voyages with further reduced score
        if (expandedResults.voyages) {
          expandedResults.voyages.forEach(v => {
            const alreadyExists = allResults.some(r => r.slug === v.slug && r.dataSource === 'voyages')
            if (!alreadyExists) {
              const maxRegionScore = Math.max(...regionHits.map(r => r._score || 1))
              allResults.push({
                title: v.title,
                slug: v.slug,
                dataSource: 'voyages',
                image: v.image,
                description: v.description,
                availabilityTypes: v.availabilityTypes,
                difficulty: v.difficulty,
                score: maxRegionScore * 0.9
              })
            }
          })
        }
      }
    }

    // Sort by score (descending)
    const sortedResults = allResults.sort((a, b) => (b.score || 0) - (a.score || 0))

    return sortedResults
  } catch (error) {
    console.error('Error getting search results from Algolia:', error)
    return []
  }
})
