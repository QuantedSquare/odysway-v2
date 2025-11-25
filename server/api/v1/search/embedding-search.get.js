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
    apiVersion: 'vX',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,

  })

  const query = getQuery(event)
  const searchTerm = query.keyword?.trim()
  const indexName = 'all-document-index'
  const dataset = config.public.sanity.dataset

  try {

  const response = await sanityClient.request({
    url: `/embeddings-index/query/${dataset}/${indexName}`,
    method: 'POST',
    body: {
      query: searchTerm,  
      maxResults: 15,
      filter: {
        type: ["voyage","destination","region"]
      }
    }
  })
console.log('response', response)
  if (!response || !Array.isArray(response) || response.length === 0) {
    return []
  }

  // Create a map to preserve scores and documentIds by type
  const scoreMap = new Map()
  const byType = {
    voyage: [],
    destination: [],
    region: []
  }
  
  response.forEach(item => {
    const docId = item.value?.documentId
    const type = item.value?.type
    if (docId && type && byType[type]) {
      byType[type].push(docId)
      // Store score with both documentId formats (as-is and normalized)
      scoreMap.set(docId, item.score)
    }
  })

  // Build GROQ query to fetch all documents
  // Match by _id or slug.current (handles both UUIDs and slug-based IDs)
  const groqQuery = `
    {
      "voyages": *[_type == "voyage" && (
        _id in $voyageIds || 
        slug.current in $voyageIds
      ) && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      )]{
        _id,
        title,
        "slug": slug.current
      },
      "destinations": *[_type == "destination" && (
        _id in $destinationIds || 
        slug.current in $destinationIds
      )]{
        _id,
        title,
        "slug": slug.current
      },
      "regions": *[_type == "region" && (
        _id in $regionIds || 
        slug.current in $regionIds
      )]{
        _id,
        nom,
        "slug": slug.current
      }
    }
  `

  const queryParams = {
    voyageIds: byType.voyage,
    destinationIds: byType.destination,
    regionIds: byType.region
  }

  const results = await sanityClient.fetch(groqQuery, queryParams)
console.log('results', results)
  // Flatten and merge results, preserving order by score
  const allResults = []
  
  // Process voyages
  if (results.voyages) {
    results.voyages.forEach(v => {
      const score = scoreMap.get(v._id) || scoreMap.get(v.slug) || 0
      allResults.push({
        title: v.title,
        slug: v.slug,
        dataSource: 'voyages',
        score
      })
    })
  }
  
  // Process destinations
  if (results.destinations) {
    results.destinations.forEach(d => {
      const score = scoreMap.get(d._id) || scoreMap.get(d.slug) || 0
      allResults.push({
        title: d.title,
        slug: d.slug,
        dataSource: 'destinations',
        score
      })
    })
  }
  
  // Process regions
  if (results.regions) {
    results.regions.forEach(r => {
      const score = scoreMap.get(r._id) || scoreMap.get(r.slug) || 0
      allResults.push({
        title: r.nom,
        slug: r.slug,
        dataSource: 'regions',
        score
      })
    })
  }

  // Sort by score (descending) and remove score from final output
  const sortedResults = allResults
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map(({ score, ...rest }) => rest)

  return sortedResults
  } catch (error) {
    console.error('Error getting search results:', error)
    return []
  }
})
