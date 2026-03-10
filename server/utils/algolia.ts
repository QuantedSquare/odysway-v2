import { algoliasearch } from 'algoliasearch'
import { createClient, type SanityClient } from '@sanity/client'

type AlgoliaClient = {
  saveObjects: (args: { indexName: string, objects: unknown[] }) => Promise<unknown>
  deleteObjects: (args: { indexName: string, objectIDs: string[] }) => Promise<unknown>
  // algoliasearch v5 supports browseObjects; we keep this optional to avoid hard coupling to typings
  browseObjects?: (args: unknown) => Promise<unknown>
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
    const { records, deleteObjectIDs, indexedObjectIDsByType } = transformToAlgoliaRecords(regions, destinations, voyages)
    console.log(`✅ [Algolia] Created ${records.length} records`)

    // Compute stale deletions for deleted docs (present in Algolia but no longer present/indexable in Sanity)
    const staleObjectIDs = await findStaleObjectIDsInAlgolia(algoliaClient, indexedObjectIDsByType)
    const allDeleteObjectIDs = new Set<string>([...deleteObjectIDs, ...staleObjectIDs])
    if (allDeleteObjectIDs.size > 0) {
      console.log(`🧹 [Algolia] Will delete ${allDeleteObjectIDs.size} stale records (draft/deleted/unindexable)`)
    }

    // Index to Algolia
    console.log('📤 [Algolia] Indexing to Algolia...')
    await algoliaClient.saveObjects({
      indexName: 'odysway',
      objects: records,
    })

    if (allDeleteObjectIDs.size > 0) {
      console.log('🗑️ [Algolia] Deleting stale voyage records...')
      await algoliaClient.deleteObjects({
        indexName: 'odysway',
        objectIDs: Array.from(allDeleteObjectIDs),
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
  // Fetch ALL regions (including drafts). Filtering/cleanup is handled at indexing time.
  const query = `*[_type == "region"] {
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
  // Fetch ALL destinations (including drafts). Filtering/cleanup is handled at indexing time.
  const query = `*[_type == "destination"] {
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
  const indexedObjectIDsByType = {
    region: new Set<string>(),
    destination: new Set<string>(),
    voyage: new Set<string>(),
  }

  const regionIds = new Set(regions.map(r => r._id))
  const regionDraftOnlyBaseIds = new Set<string>()
  regions.forEach((region) => {
    if (region._id.startsWith('drafts.')) {
      const baseId = region._id.replace(/^drafts\./, '')
      // Only mark for deletion if there's no published version
      if (!regionIds.has(baseId)) regionDraftOnlyBaseIds.add(baseId)
    }
  })
  regionDraftOnlyBaseIds.forEach(baseId => deleteObjectIDs.add(`region_${baseId}`))

  const destinationIds = new Set(destinations.map(d => d._id))
  const destinationDraftOnlyBaseIds = new Set<string>()
  destinations.forEach((destination) => {
    if (destination._id.startsWith('drafts.')) {
      const baseId = destination._id.replace(/^drafts\./, '')
      // Only mark for deletion if there's no published version
      if (!destinationIds.has(baseId)) destinationDraftOnlyBaseIds.add(baseId)
    }
  })
  destinationDraftOnlyBaseIds.forEach(baseId => deleteObjectIDs.add(`destination_${baseId}`))

  // Add region records
  regions.forEach((region) => {
    const isDraft = region._id.startsWith('drafts.')
    const baseId = region._id.replace(/^drafts\./, '')
    if (isDraft) return
    if (regionDraftOnlyBaseIds.has(baseId)) return

    const destinationNames = region.destinations?.map(d => d.title).filter(Boolean) || []
    const destinationSlugs = region.destinations?.map(d => d.slug?.current).filter(Boolean) || []

    records.push({
      objectID: `region_${baseId}`,
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
    indexedObjectIDsByType.region.add(`region_${baseId}`)
  })

  // Add destination records
  destinations.forEach((destination) => {
    const isDraft = destination._id.startsWith('drafts.')
    const baseId = destination._id.replace(/^drafts\./, '')
    if (isDraft) return
    if (destinationDraftOnlyBaseIds.has(baseId)) return

    const regionNames = destination.regions?.map(r => r.nom).filter(Boolean) || []
    const regionSlugs = destination.regions?.map(r => r.slug?.current).filter(Boolean) || []

    records.push({
      objectID: `destination_${baseId}`,
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
    indexedObjectIDsByType.destination.add(`destination_${baseId}`)
  })

  // If a voyage is draft-only (no published version), remove it from Algolia.
  // If a draft exists alongside a published version, keep the published record.
  const voyageIds = new Set(voyages.map(v => v._id).filter((id): id is string => typeof id === 'string'))
  const voyageDraftOnlyBaseIds = new Set<string>()
  voyages.forEach((voyage) => {
    if (typeof voyage?._id === 'string' && voyage._id.startsWith('drafts.')) {
      const baseId = voyage._id.replace(/^drafts\./, '')
      // Only mark for deletion if there's no published version
      if (!voyageIds.has(baseId)) voyageDraftOnlyBaseIds.add(baseId)
    }
  })
  voyageDraftOnlyBaseIds.forEach(baseId => deleteObjectIDs.add(`voyage_${baseId}`))

  // Add voyage records
  voyages.forEach((voyage) => {
    if (typeof voyage?._id !== 'string') return

    const isDraft = voyage._id.startsWith('drafts.')
    const baseId = voyage._id.replace(/^drafts\./, '')

    // Never index drafts; keep the published version even if a draft exists.
    if (isDraft) return
    if (voyageDraftOnlyBaseIds.has(baseId)) return

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
    indexedObjectIDsByType.voyage.add(`voyage_${baseId}`)
  })

  return {
    records,
    deleteObjectIDs: Array.from(deleteObjectIDs),
    indexedObjectIDsByType,
  }
}

async function browseObjectIDsByType(
  algoliaClient: AlgoliaClient,
  type: 'region' | 'destination' | 'voyage',
): Promise<string[]> {
  if (typeof algoliaClient.browseObjects !== 'function') return []

  const objectIDs: string[] = []

  // algoliasearch v5: browseObjects({ indexName, browseParams, batch })
  const args = {
    indexName: 'odysway',
    browseParams: {
      query: '',
      filters: `type:${type}`,
      attributesToRetrieve: ['objectID'],
    },
    batch: (batch: { hits?: Array<{ objectID?: string }> }) => {
      const hits = batch?.hits || []
      for (const hit of hits) {
        if (typeof hit.objectID === 'string') objectIDs.push(hit.objectID)
      }
    },
  }

  await (algoliaClient.browseObjects as (a: unknown) => Promise<unknown>)(args)
  return objectIDs
}

async function findStaleObjectIDsInAlgolia(
  algoliaClient: AlgoliaClient,
  indexedObjectIDsByType: {
    region: Set<string>
    destination: Set<string>
    voyage: Set<string>
  },
): Promise<string[]> {
  try {
    const stale = new Set<string>()
    const [existingRegions, existingDestinations, existingVoyages] = await Promise.all([
      browseObjectIDsByType(algoliaClient, 'region'),
      browseObjectIDsByType(algoliaClient, 'destination'),
      browseObjectIDsByType(algoliaClient, 'voyage'),
    ])

    for (const id of existingRegions) {
      if (!indexedObjectIDsByType.region.has(id)) stale.add(id)
    }
    for (const id of existingDestinations) {
      if (!indexedObjectIDsByType.destination.has(id)) stale.add(id)
    }
    for (const id of existingVoyages) {
      if (!indexedObjectIDsByType.voyage.has(id)) stale.add(id)
    }

    return Array.from(stale)
  }
  catch (err) {
    console.warn('⚠️ [Algolia] Could not browse Algolia index for stale cleanup:', err)
    return []
  }
}
