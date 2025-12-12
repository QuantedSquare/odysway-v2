import { algoliasearch } from 'algoliasearch'
import { createClient } from '@sanity/client'

/**
 * Update Algolia index with fresh data from Sanity
 */
export async function updateAlgoliaIndex() {
  const config = useRuntimeConfig()
  // Initialize clients
  const algoliaClient = algoliasearch(
    config.public.algolia.applicationId,
    process.env.ALGOLIA_API_WRITE || config.public.algolia.apiKey,
  )

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: '2025-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })

  try {
    console.log('🔍 [Algolia] Fetching data from Sanity...')

    // Fetch all data in parallel
    const [regions, destinations, voyages] = await Promise.all([
      fetchRegions(sanityClient),
      fetchDestinations(sanityClient),
      fetchVoyages(sanityClient),
    ])

    console.log(`✅ [Algolia] Fetched ${regions.length} regions`)
    console.log(`✅ [Algolia] Fetched ${destinations.length} destinations`)
    console.log(`✅ [Algolia] Fetched ${voyages.length} voyages`)

    // Transform data into Algolia records
    console.log('🔄 [Algolia] Transforming data into records...')
    const records = transformToAlgoliaRecords(regions, destinations, voyages)
    console.log(`✅ [Algolia] Created ${records.length} records`)

    // Index to Algolia
    console.log('📤 [Algolia] Indexing to Algolia...')
    await algoliaClient.saveObjects({
      indexName: 'odysway',
      objects: records,
    })

    console.log('✅ [Algolia] Successfully indexed all records!')
    return { success: true, count: records.length }
  }
  catch (error) {
    console.error('❌ [Algolia] Error processing records:', error)
    throw error
  }
}

async function fetchRegions(client: any) {
  const query = `*[_type == "region" && !(_id in path('drafts.**'))] {
    _id,
    nom,
    slug,
    meta_description,
    interjection,
    "image": image.asset->url,
    "destinations": *[_type == "destination" && references(^._id)] {
      title,
      slug
    },
    "voyageCount": count(*[_type == "voyage" && references(*[_type == "destination" && references(^._id)]._id) && (
      !('custom' in availabilityTypes) ||
      (count(availabilityTypes) > 1)
    )])
  }`

  return await client.fetch(query)
}

async function fetchDestinations(client: any) {
  const query = `*[_type == "destination" && !(_id in path('drafts.**'))] {
    _id,
    title,
    slug,
    metaDescription,
    interjection,
    "image": image.asset->url,
    "regions": regions[]-> {
      _id,
      nom,
      slug
    },
    "voyageCount": count(*[_type == "voyage" && references(^._id) && (
      !('custom' in availabilityTypes) ||
      (count(availabilityTypes) > 1)
    )])
  }`

  return await client.fetch(query)
}

async function fetchVoyages(client: any) {
  const query = `*[_type == "voyage" && !(_id in path('drafts.**')) && (
    !('custom' in availabilityTypes) ||
    (count(availabilityTypes) > 1)
  )] {
    _id,
    title,
    slug,
    availabilityTypes,
    monthlyAvailability,
    "difficulty": difficultyLevel->title,
    "image": image.asset->url,
    "destinations": destinations[]-> {
      _id,
      title,
      slug,
      "regions": regions[]-> {
        _id,
        nom,
        slug
      }
    }
  }`

  return await client.fetch(query)
}

function transformToAlgoliaRecords(regions: any[], destinations: any[], voyages: any[]) {
  const records: any[] = []

  // Add region records
  regions.forEach((region: any) => {
    const destinationNames = region.destinations?.map((d: any) => d.title).filter(Boolean) || []
    const destinationSlugs = region.destinations?.map((d: any) => d.slug?.current).filter(Boolean) || []

    records.push({
      objectID: `region_${region._id}`,
      type: 'region',
      name: region.nom,
      slug: region.slug?.current,
      title: region.nom,
      interjection: region.interjection,
      image: region.image,
      voyageCount: region.voyageCount || 0,
      destinations: destinationNames,
      destinationSlugs: destinationSlugs,
    })
  })

  // Add destination records
  destinations.forEach((destination: any) => {
    const regionNames = destination.regions?.map((r: any) => r.nom).filter(Boolean) || []
    const regionSlugs = destination.regions?.map((r: any) => r.slug?.current).filter(Boolean) || []

    records.push({
      objectID: `destination_${destination._id}`,
      type: 'destination',
      name: destination.title,
      slug: destination.slug?.current,
      title: destination.title,
      interjection: destination.interjection,
      image: destination.image,
      voyageCount: destination.voyageCount || 0,
      regions: regionNames,
      regionSlugs: regionSlugs,
    })
  })

  // Add voyage records
  voyages.forEach((voyage: any) => {
    const destinationNames = voyage.destinations?.map((d: any) => d.title).filter(Boolean) || []
    const destinationSlugs = voyage.destinations?.map((d: any) => d.slug?.current).filter(Boolean) || []

    // Collect all regions from destinations
    const allRegions = new Set()
    const allRegionSlugs = new Set()

    voyage.destinations?.forEach((dest: any) => {
      dest.regions?.forEach((region: any) => {
        if (region.nom) allRegions.add(region.nom)
        if (region.slug?.current) allRegionSlugs.add(region.slug.current)
      })
    })

    const regionNames = Array.from(allRegions)
    const regionSlugs = Array.from(allRegionSlugs)

    records.push({
      objectID: `voyage_${voyage._id}`,
      type: 'voyage',
      name: voyage.title,
      slug: voyage.slug?.current,
      title: voyage.title,
      image: voyage.image,
      availabilityTypes: voyage.availabilityTypes || [],
      monthlyAvailability: voyage.monthlyAvailability || [],
      difficulty: voyage.difficulty,
      destinations: destinationNames,
      destinationSlugs: destinationSlugs,
      regions: regionNames,
      regionSlugs: regionSlugs,
      searchableText: `${voyage.title} ${destinationNames.join(' ')} ${regionNames.join(' ')} ${voyage.difficulty || ''}`,
    })
  })

  return records
}
