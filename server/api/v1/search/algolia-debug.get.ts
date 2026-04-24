import { defineEventHandler, getQuery } from 'h3'
import { algoliasearch } from 'algoliasearch'
import { createClient } from '@sanity/client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const slugToInspect = (query.slug as string) || null

  const pub = config.public as any
  const appId = pub.algolia.applicationId
  const writeKey = process.env.ALGOLIA_API_WRITE || pub.algolia.apiKey
  const projectId = pub.sanity.projectId
  const dataset = pub.sanity.dataset

  const logs: string[] = []
  const log = (msg: string) => {
    console.log(msg)
    logs.push(msg)
  }

  const algoliaClient = algoliasearch(appId, writeKey) as any

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })

  // --- Inspect a specific slug ---
  if (slugToInspect) {
    log(`[INSPECT] Slug: ${slugToInspect}`)

    // 1. Find in Sanity (published + drafts)
    const sanityDocs = await sanity.fetch(
      `*[_type == "voyage" && slug.current == $slug] { _id, title, slug, availabilityTypes, _updatedAt }`,
      { slug: slugToInspect },
    )
    log(`[SANITY] Docs with this slug: ${JSON.stringify(sanityDocs)}`)

    const publishedDoc = sanityDocs.find((d: any) => !d._id.startsWith('drafts.'))
    const draftDoc = sanityDocs.find((d: any) => d._id.startsWith('drafts.'))
    log(`[SANITY] Published: ${publishedDoc ? publishedDoc._id : 'NONE'}`)
    log(`[SANITY] Draft: ${draftDoc ? draftDoc._id : 'NONE'}`)

    // 2. Derive expected objectID
    const baseId = publishedDoc?._id ?? draftDoc?._id?.replace('drafts.', '')
    const expectedObjectID = baseId ? `voyage_${baseId}` : null
    log(`[ALGOLIA] Expected objectID: ${expectedObjectID}`)

    // 3. Check if it exists in Algolia
    let algoliaRecord: unknown = null
    let algoliaFetchError: string | null = null
    if (expectedObjectID) {
      try {
        algoliaRecord = await algoliaClient.getObject({
          indexName: 'odysway',
          objectID: expectedObjectID,
        })
        log(`[ALGOLIA] Record EXISTS in index: ${JSON.stringify(algoliaRecord)}`)
      }
      catch (err: any) {
        algoliaFetchError = err?.message ?? String(err)
        if (err?.status === 404) {
          log(`[ALGOLIA] Record NOT found in index (404) — already deleted or never indexed`)
        }
        else {
          log(`[ALGOLIA] Error fetching record: ${algoliaFetchError}`)
        }
      }
    }

    // 4. Explain what SHOULD happen
    let expectedAction = ''
    if (!publishedDoc && !draftDoc) {
      expectedAction = 'Document absent de Sanity → devrait être supprimé par findStaleObjectIDsInAlgolia'
    }
    else if (!publishedDoc && draftDoc) {
      expectedAction = 'Draft-only → devrait être dans deleteObjectIDs (voyageDraftOnlyBaseIds)'
    }
    else if (publishedDoc) {
      const types: string[] = publishedDoc.availabilityTypes || []
      if (types.length === 1 && types[0] === 'custom') {
        expectedAction = 'availabilityTypes=["custom"] seul → devrait être dans deleteObjectIDs (isCustomOnly)'
      }
      else {
        expectedAction = `Document publié avec availabilityTypes=${JSON.stringify(types)} → devrait RESTER indexé`
      }
    }
    log(`[LOGIC] ${expectedAction}`)

    // 5. Manually delete if it exists and shouldn't be there
    const shouldDelete = !publishedDoc || (publishedDoc?.availabilityTypes?.length === 1 && publishedDoc?.availabilityTypes?.[0] === 'custom')
    let manualDeleteResult: unknown = null
    if (shouldDelete && algoliaRecord && expectedObjectID) {
      try {
        manualDeleteResult = await algoliaClient.deleteObject({
          indexName: 'odysway',
          objectID: expectedObjectID,
        })
        log(`[ALGOLIA] Manually deleted ${expectedObjectID}: ${JSON.stringify(manualDeleteResult)}`)
      }
      catch (err: any) {
        log(`[ALGOLIA] Manual delete failed: ${err?.message}`)
      }
    }

    return {
      slug: slugToInspect,
      sanity: {
        published: publishedDoc ?? null,
        draft: draftDoc ?? null,
      },
      algolia: {
        expectedObjectID,
        recordFound: !!algoliaRecord,
        record: algoliaRecord,
        error: algoliaFetchError,
      },
      logic: {
        expectedAction,
        shouldDelete,
        manuallyDeleted: !!manualDeleteResult,
      },
      logs,
    }
  }

  // --- Default: connectivity + full reindex ---
  log(`[CONFIG] Algolia appId: ${appId ? appId.slice(0, 6) + '...' : 'MISSING'}`)
  log(`[CONFIG] Algolia writeKey source: ${process.env.ALGOLIA_API_WRITE ? 'env ALGOLIA_API_WRITE' : 'public apiKey (likely READ-ONLY!)'}`)

  let algoliaConnectOk = false
  let algoliaConnectError: string | null = null
  try {
    const indices = await algoliaClient.listIndices()
    algoliaConnectOk = true
    log(`[ALGOLIA] Connection OK — indices: ${JSON.stringify(indices?.items?.map((i: any) => i.name) ?? indices)}`)
  }
  catch (err: any) {
    algoliaConnectError = err?.message ?? String(err)
    log(`[ALGOLIA] Connection FAILED: ${algoliaConnectError}`)
  }

  let saveTestOk = false
  let saveTestError: string | null = null
  try {
    await algoliaClient.saveObjects({ indexName: 'odysway', objects: [{ objectID: '__debug_test__', type: 'debug' }] })
    await algoliaClient.deleteObjects({ indexName: 'odysway', objectIDs: ['__debug_test__'] })
    saveTestOk = true
    log(`[ALGOLIA] Write test OK`)
  }
  catch (err: any) {
    saveTestError = err?.message ?? String(err)
    log(`[ALGOLIA] Write test FAILED: ${saveTestError}`)
  }

  // --- Browse test: see what objectIDs Algolia actually returns for voyages ---
  const browseResult: { objectIDs: string[], batchCallCount: number, rawBatchSample: unknown[] } = {
    objectIDs: [],
    batchCallCount: 0,
    rawBatchSample: [],
  }
  try {
    if (typeof algoliaClient.browseObjects === 'function') {
      await (algoliaClient.browseObjects as (a: unknown) => Promise<unknown>)({
        indexName: 'odysway',
        browseParams: { query: '', filters: 'type:voyage', attributesToRetrieve: ['objectID'] },
        batch: (batch: unknown) => {
          browseResult.batchCallCount++
          // Capture raw shape for first batch to diagnose format
          if (browseResult.batchCallCount === 1) browseResult.rawBatchSample = Array.isArray(batch) ? (batch as unknown[]).slice(0, 3) : [batch]
          const hits = Array.isArray(batch) ? batch as Array<{ objectID?: string }> : ((batch as any)?.hits || [])
          for (const hit of hits) {
            if (typeof hit?.objectID === 'string') browseResult.objectIDs.push(hit.objectID)
          }
        },
      })
      log(`[BROWSE] batchCallCount=${browseResult.batchCallCount}, total objectIDs=${browseResult.objectIDs.length}`)
      log(`[BROWSE] First 5 objectIDs: ${JSON.stringify(browseResult.objectIDs.slice(0, 5))}`)
    }
    else {
      log(`[BROWSE] browseObjects not available on this client`)
    }
  }
  catch (err: any) {
    log(`[BROWSE] Error: ${err?.message}`)
  }

  // UUID pattern = old format that should be cleaned up
  const uuidPattern = /^(voyage|region|destination)_[0-9a-f]{8}-[0-9a-f]{4}-/i
  const oldFormatIDs = browseResult.objectIDs.filter(id => uuidPattern.test(id))
  log(`[BROWSE] Old UUID-based IDs found: ${oldFormatIDs.length} — ${JSON.stringify(oldFormatIDs.slice(0, 5))}`)

  // Force-delete old UUID-based records if any
  let forcedDeleteResult: unknown = null
  if (oldFormatIDs.length > 0) {
    try {
      forcedDeleteResult = await algoliaClient.deleteObjects({ indexName: 'odysway', objectIDs: oldFormatIDs })
      log(`[CLEANUP] Force-deleted ${oldFormatIDs.length} old UUID-based records`)
    }
    catch (err: any) {
      log(`[CLEANUP] Delete failed: ${err?.message}`)
    }
  }

  let fullIndexResult: unknown = null
  let fullIndexError: string | null = null
  try {
    fullIndexResult = await updateAlgoliaIndex()
    log(`[FULL] Result: ${JSON.stringify(fullIndexResult)}`)
  }
  catch (err: any) {
    fullIndexError = err?.message ?? String(err)
    log(`[FULL] Error: ${fullIndexError}`)
  }

  return {
    ok: saveTestOk && algoliaConnectOk,
    hint: 'Add ?slug=your-voyage-slug to inspect a specific record',
    browse: {
      batchCallCount: browseResult.batchCallCount,
      totalObjectIDs: browseResult.objectIDs.length,
      rawBatchSample: browseResult.rawBatchSample,
      oldUUIDFormatCount: oldFormatIDs.length,
      oldUUIDFormatIDs: oldFormatIDs,
      forcedDeleted: !!forcedDeleteResult,
    },
    steps: {
      algoliaConnect: { ok: algoliaConnectOk, error: algoliaConnectError },
      algoliaWriteTest: { ok: saveTestOk, error: saveTestError },
      fullIndex: { ok: !!fullIndexResult && !fullIndexError, error: fullIndexError, result: fullIndexResult },
    },
    logs,
  }
})
