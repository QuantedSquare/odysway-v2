import { algoliasearch } from 'algoliasearch'
import { createClient, type SanityClient } from '@sanity/client'

type AlgoliaClient = {
  saveObjects: (args: { indexName: string, objects: unknown[] }) => Promise<unknown>
  deleteObjects: (args: { indexName: string, objectIDs: string[] }) => Promise<unknown>
}

type Slug = { current?: string }

type RegionRef = {
  _id: string
  nom?: string
  slug?: Slug
}

type DestinationRef = {
  _id: string
  title?: string
  slug?: Slug
  regions?: RegionRef[]
}

type RegionDoc = {
  _id: string
  nom?: string
  slug?: Slug
  meta_description?: string
  interjection?: string
  image?: string
  destinations?: Array<{ title?: string, slug?: Slug }>
  voyageCount?: number
}

type DestinationDoc = {
  _id: string
  title?: string
  slug?: Slug
  metaDescription?: string
  interjection?: string
  image?: string
  regions?: RegionRef[]
  voyageCount?: number
}

type VoyageDoc = {
  _id: string
  title?: string
  slug?: Slug
  availabilityTypes?: string[]
  monthlyAvailability?: unknown[]
  difficulty?: string
  image?: string
  destinations?: DestinationRef[]
}

/**
 * Update Algolia index with fresh data from Sanity
 */
export async function updateAlgoliaIndex() {
  const config = useRuntimeConfig()
  // Initialize clients
  const algoliaClient = algoliasearch(
    config.public.algolia.applicationId,
    process.env.ALGOLIA_API_WRITE || config.public.algolia.apiKey,
  ) as unknown as AlgoliaClient

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: '2025-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  }) as SanityClient

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
    const { records, deleteObjectIDs } = transformToAlgoliaRecords(regions, destinations, voyages)
    console.log(`✅ [Algolia] Created ${records.length} records`)
    if (deleteObjectIDs.length > 0) {
      console.log(`🧹 [Algolia] Will delete ${deleteObjectIDs.length} stale voyage records`)
    }

    // Index to Algolia
    console.log('📤 [Algolia] Indexing to Algolia...')
    await algoliaClient.saveObjects({
      indexName: 'odysway',
      objects: records,
    })

    if (deleteObjectIDs.length > 0) {
      console.log('🗑️ [Algolia] Deleting stale voyage records...')
      await algoliaClient.deleteObjects({
        indexName: 'odysway',
        objectIDs: deleteObjectIDs,
      })
    }

    console.log('✅ [Algolia] Successfully indexed all records!')
    return { success: true, count: records.length }
  }
  catch (error) {
    console.error('❌ [Algolia] Error processing records:', error)
    throw error
  }
}

async function fetchRegions(client: SanityClient): Promise<RegionDoc[]> {
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

async function fetchDestinations(client: SanityClient): Promise<DestinationDoc[]> {
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

async function fetchVoyages(client: SanityClient): Promise<VoyageDoc[]> {
  // Fetch ALL voyages (including drafts). Filtering/cleanup is handled at indexing time.
  const query = `*[_type == "voyage"] {
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

function transformToAlgoliaRecords(regions: RegionDoc[], destinations: DestinationDoc[], voyages: VoyageDoc[]) {
  const records: Array<Record<string, unknown>> = []
  const deleteObjectIDs = new Set<string>()

  // Add region records
  regions.forEach((region) => {
    const destinationNames = region.destinations?.map(d => d.title).filter(Boolean) || []
    const destinationSlugs = region.destinations?.map(d => d.slug?.current).filter(Boolean) || []

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
  destinations.forEach((destination) => {
    const regionNames = destination.regions?.map(r => r.nom).filter(Boolean) || []
    const regionSlugs = destination.regions?.map(r => r.slug?.current).filter(Boolean) || []

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

  // If a voyage is in draft, remove the published version from Algolia.
  // In Sanity, drafts have ids like "drafts.<publishedId>".
  const draftBaseIds = new Set<string>()
  voyages.forEach((voyage) => {
    if (typeof voyage?._id === 'string' && voyage._id.startsWith('drafts.')) {
      draftBaseIds.add(voyage._id.replace(/^drafts\./, ''))
    }
  })
  draftBaseIds.forEach(baseId => deleteObjectIDs.add(`voyage_${baseId}`))

  // Add voyage records
  voyages.forEach((voyage) => {
    if (typeof voyage?._id !== 'string') return

    const isDraft = voyage._id.startsWith('drafts.')
    const baseId = voyage._id.replace(/^drafts\./, '')

    // Never index drafts; instead remove the published record from Algolia.
    if (isDraft) return
    if (draftBaseIds.has(baseId)) return

    // If availabilityTypes is exactly ["custom"], remove it from Algolia (and do not index it).
    const availabilityTypes: string[] = Array.isArray(voyage.availabilityTypes)
      ? voyage.availabilityTypes.filter(x => typeof x === 'string')
      : []
    const isCustomOnly = availabilityTypes.length === 1 && availabilityTypes[0] === 'custom'
    if (isCustomOnly) {
      deleteObjectIDs.add(`voyage_${baseId}`)
      return
    }

    const destinationNames = voyage.destinations?.map(d => d.title).filter(Boolean) || []
    const destinationSlugs = voyage.destinations?.map(d => d.slug?.current).filter(Boolean) || []

    // Collect all regions from destinations
    const allRegions = new Set()
    const allRegionSlugs = new Set()

    voyage.destinations?.forEach((dest) => {
      dest.regions?.forEach((region) => {
        if (region.nom) allRegions.add(region.nom)
        if (region.slug?.current) allRegionSlugs.add(region.slug.current)
      })
    })

    const regionNames = Array.from(allRegions)
    const regionSlugs = Array.from(allRegionSlugs)

    records.push({
      objectID: `voyage_${baseId}`,
      type: 'voyage',
      name: voyage.title,
      slug: voyage.slug?.current,
      title: voyage.title,
      image: voyage.image,
      availabilityTypes,
      monthlyAvailability: voyage.monthlyAvailability || [],
      difficulty: voyage.difficulty,
      destinations: destinationNames,
      destinationSlugs: destinationSlugs,
      regions: regionNames,
      regionSlugs: regionSlugs,
      searchableText: `${voyage.title} ${destinationNames.join(' ')} ${regionNames.join(' ')} ${voyage.difficulty || ''}`,
    })
  })

  return { records, deleteObjectIDs: Array.from(deleteObjectIDs) }
}
