import { algoliasearch } from 'algoliasearch'
import { createClient, type SanityClient } from '@sanity/client'

type AlgoliaClient = {
  saveObjects: (args: { indexName: string, objects: unknown[] }) => Promise<unknown>
  deleteObjects: (args: { indexName: string, objectIDs: string[] }) => Promise<unknown>
  replaceAllObjects: (args: { indexName: string, objects: unknown[] }) => Promise<unknown>
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
    // Drafts, custom-only voyages, and deleted docs are excluded — replaceAllObjects
    // atomically replaces the entire index so nothing stale can remain.
    console.log('🔄 [Algolia] Transforming data into records...')
    const { records } = transformToAlgoliaRecords(regions, destinations, voyages)
    console.log(`✅ [Algolia] Created ${records.length} records`)

    // Atomically replace the full index — eliminates stale/deleted/draft records without needing browseObjects
    console.log('📤 [Algolia] Replacing index...')
    await algoliaClient.replaceAllObjects({
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
  const regionSlugByBaseId = new Map<string, string>()
  regions.forEach((r) => {
    const baseId = r._id.replace(/^drafts\./, '')
    if (r.slug?.current && !regionSlugByBaseId.has(baseId)) regionSlugByBaseId.set(baseId, r.slug.current)
  })
  const regionDraftOnlyBaseIds = new Set<string>()
  regions.forEach((region) => {
    if (region._id.startsWith('drafts.')) {
      const baseId = region._id.replace(/^drafts\./, '')
      if (!regionIds.has(baseId)) regionDraftOnlyBaseIds.add(baseId)
    }
  })
  regionDraftOnlyBaseIds.forEach((baseId) => {
    const slug = regionSlugByBaseId.get(baseId)
    deleteObjectIDs.add(slug ? `region_${slug}` : `region_${baseId}`)
  })

  const destinationIds = new Set(destinations.map(d => d._id))
  const destinationSlugByBaseId = new Map<string, string>()
  destinations.forEach((d) => {
    const baseId = d._id.replace(/^drafts\./, '')
    if (d.slug?.current && !destinationSlugByBaseId.has(baseId)) destinationSlugByBaseId.set(baseId, d.slug.current)
  })
  const destinationDraftOnlyBaseIds = new Set<string>()
  destinations.forEach((destination) => {
    if (destination._id.startsWith('drafts.')) {
      const baseId = destination._id.replace(/^drafts\./, '')
      if (!destinationIds.has(baseId)) destinationDraftOnlyBaseIds.add(baseId)
    }
  })
  destinationDraftOnlyBaseIds.forEach((baseId) => {
    const slug = destinationSlugByBaseId.get(baseId)
    deleteObjectIDs.add(slug ? `destination_${slug}` : `destination_${baseId}`)
  })

  // Add region records
  regions.forEach((region) => {
    const isDraft = region._id.startsWith('drafts.')
    const baseId = region._id.replace(/^drafts\./, '')
    if (isDraft) return
    if (regionDraftOnlyBaseIds.has(baseId)) return

    const destinationNames = region.destinations?.map(d => d.title).filter(Boolean) || []
    const destinationSlugs = region.destinations?.map(d => d.slug?.current).filter(Boolean) || []

    const regionObjectID = region.slug?.current ? `region_${region.slug.current}` : `region_${baseId}`
    records.push({
      objectID: regionObjectID,
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
    indexedObjectIDsByType.region.add(regionObjectID)
  })

  // Add destination records
  destinations.forEach((destination) => {
    const isDraft = destination._id.startsWith('drafts.')
    const baseId = destination._id.replace(/^drafts\./, '')
    if (isDraft) return
    if (destinationDraftOnlyBaseIds.has(baseId)) return

    const regionNames = destination.regions?.map(r => r.nom).filter(Boolean) || []
    const regionSlugs = destination.regions?.map(r => r.slug?.current).filter(Boolean) || []

    const destinationObjectID = destination.slug?.current ? `destination_${destination.slug.current}` : `destination_${baseId}`
    records.push({
      objectID: destinationObjectID,
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
    indexedObjectIDsByType.destination.add(destinationObjectID)
  })

  // Build a baseId -> slug map from all voyages (published + drafts) so we can use
  // slug-based objectIDs everywhere, matching what was previously indexed in Algolia.
  const voyageIds = new Set(voyages.map(v => v._id).filter((id): id is string => typeof id === 'string'))
  const voyageSlugByBaseId = new Map<string, string>()
  voyages.forEach((voyage) => {
    if (typeof voyage?._id !== 'string') return
    const baseId = voyage._id.replace(/^drafts\./, '')
    if (voyage.slug?.current && !voyageSlugByBaseId.has(baseId)) {
      voyageSlugByBaseId.set(baseId, voyage.slug.current)
    }
  })

  // If a voyage is draft-only (no published version), remove it from Algolia.
  // If a draft exists alongside a published version, keep the published record.
  const voyageDraftOnlyBaseIds = new Set<string>()
  voyages.forEach((voyage) => {
    if (typeof voyage?._id === 'string' && voyage._id.startsWith('drafts.')) {
      const baseId = voyage._id.replace(/^drafts\./, '')
      if (!voyageIds.has(baseId)) voyageDraftOnlyBaseIds.add(baseId)
    }
  })
  voyageDraftOnlyBaseIds.forEach((baseId) => {
    const slug = voyageSlugByBaseId.get(baseId)
    deleteObjectIDs.add(slug ? `voyage_${slug}` : `voyage_${baseId}`)
  })

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
      const slug = voyage.slug?.current
      deleteObjectIDs.add(slug ? `voyage_${slug}` : `voyage_${baseId}`)
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

    const voyageObjectID = voyage.slug?.current ? `voyage_${voyage.slug.current}` : `voyage_${baseId}`
    records.push({
      objectID: voyageObjectID,
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
    indexedObjectIDsByType.voyage.add(voyageObjectID)
  })

  return {
    records,
    deleteObjectIDs: Array.from(deleteObjectIDs),
    indexedObjectIDsByType,
  }
}
