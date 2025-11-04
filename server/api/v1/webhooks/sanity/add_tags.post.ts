import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { createClient } from '@sanity/client'

type ImageReference = {
  assetRef: string
  alt?: string
  path: string[]
}

function toTitleCase(input: string): string {
  return input
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function normalizeTagCandidate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  // Keep it human friendly; allow letters, numbers, spaces, accents, dashes
  const sanitized = trimmed.replace(/[^\p{L}\p{N} \-']/gu, '')
  if (!sanitized) return null
  return sanitized
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

// Heuristic: derive human-usable tag names from a document
// - Prefer explicit slug.current when present
// - Fall back to common title-like fields: title, nom, name
// - Include a readable document type tag
// - Add a couple of type-specific variants for common types
function deriveSuggestedTags(doc: any): string[] {
  if (!doc || typeof doc !== 'object') return []

  const typeName: string | undefined = typeof doc._type === 'string' ? doc._type : undefined
  const slugCurrent: string | undefined = typeof doc?.slug?.current === 'string' ? doc.slug.current : undefined

  const byType = (): string | null => {
    switch (typeName) {
      case 'avisVoyageurs':
        return 'avis voyageur'
      case 'badge':
        return 'badge'
      case 'blog': {
        // handled as [slug, 'blog'] below
        return null
      }
      case 'category':
        // handled as [slug, 'categorie'] below
        return null
      case 'checkout':
        return 'checkout'
      case 'chequesVacances':
        return 'cheque vacances'
      case 'ctas':
        return 'ctas'
      case 'destination':
        // handled as [slug, 'destination'] below
        return null
      case 'entreprise':
        return 'page entreprise'
      case 'experience':
        // handled as [slug, 'experience'] below
        return null
      case 'faq':
        return 'faq'
      case 'footer':
        return 'footer'
      case 'header':
        return 'header'
      case 'homePage':
        return "Page d'accueil"
      case 'offreCadeau':
        return 'Offre cadeau'
      case 'page_voyage':
        return 'Text page voyage'
      case 'recruitment':
        return 'Page recrutement'
      case 'region':
        // handled as [slug, 'region'] below
        return null
      case 'review':
        return 'avatar review'
      case 'surMesure':
        return 'page sur-mesure'
      case 'teamMember':
        return 'team'
      case 'visionVoyageOdysway':
        return 'page vision'
      case 'voyage':
        // handled as [slug, 'voyage'] below
        return null
      default:
        return null
    }
  }

  const chosen = byType()
  if (chosen) {
    const tag = normalizeTagCandidate(chosen) ?? chosen
    return [tag].filter((t) => t && t.length <= 80)
  }

  // Multi-tag cases (slug + type label) or slug-only
  const pairs: Record<string, string> = {
    blog: 'blog',
    category: 'categorie',
    destination: 'destination',
    experience: 'experience',
    region: 'region',
    voyage: 'voyage',
  }

  if (typeName && Object.prototype.hasOwnProperty.call(pairs, typeName)) {
    const arr: string[] = []
    if (slugCurrent) arr.push(normalizeTagCandidate(slugCurrent) || slugCurrent)
    const label = (pairs as any)[typeName]
    if (label) arr.push(label)
    const cleaned = unique(arr.filter((t) => t && t.length <= 80))
    if (cleaned.length > 0) return cleaned
  }

  // Generic fallbacks
  if (slugCurrent) return [normalizeTagCandidate(slugCurrent) || slugCurrent]
  if (typeName) return [toTitleCase(typeName)]
  return []
}

function collectImageReferences(node: unknown, path: string[] = [], acc: ImageReference[] = []): ImageReference[] {
  if (Array.isArray(node)) {
    node.forEach((child, index) => collectImageReferences(child, [...path, String(index)], acc))
    return acc
  }

  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>

    // If this node is an image field with an asset reference, record it
    if ((obj._type === 'image') && obj.asset && typeof obj.asset === 'object') {
      const assetRef = (obj.asset as Record<string, unknown>)._ref
      if (typeof assetRef === 'string' && assetRef) {
        acc.push({
          assetRef,
          alt: typeof obj.alt === 'string' ? obj.alt : undefined,
          path,
        })
      }
    }

    // Recurse into object properties
    for (const [key, value] of Object.entries(obj)) {
      collectImageReferences(value, [...path, key], acc)
    }
  }

  return acc
} 

export default defineEventHandler(async (event) => {
  // Verify webhook secret for security
  const secret = getHeader(event, 'x-sanity-webhook-secret')
  const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  try {
    const body = await readBody(event)

    const images = collectImageReferences(body)
    console.log(`✓ Found ${images.length} image reference(s) in updated content`, images)

    const suggestedTags = deriveSuggestedTags(body)
    console.log('✓ Suggested tags from document:', suggestedTags)

    // If there are image asset refs, fetch their tags from Sanity
    let assetsWithTags: Array<{
      _id: string
      originalFilename?: string
      url?: string
      // Raw tags as stored by the Media plugin (may be strings or references)
      tagsRaw?: unknown
      // Tag references if they exist
      tagRefs?: string[]
    }> = []

    if (images.length > 0) {
      const config = useRuntimeConfig()
      const sanity = createClient({
        projectId: config.public.sanity.projectId,
        dataset: config.public.sanity.dataset,
        apiVersion: config.public.sanity.apiVersion,
        useCdn: false,
        token: config.public.sanity.token,
      })

      const assetIds = Array.from(new Set(images.map((i) => i.assetRef)))

      const query = `*[_type == "sanity.imageAsset" && _id in $ids]{
        _id,
        originalFilename,
        url,
        // Raw tags as stored by the Media plugin (may be strings or references)
        "tagsRaw": opt.media.tags,
        // Extract tag references if they exist
        "tagRefs": opt.media.tags[]._ref
      }`

      try {
        assetsWithTags = await sanity.fetch(query, { ids: assetIds })
        console.log('✓ Retrieved tags for assets:', assetsWithTags)
        // no verbose per-tag logs here; we'll summarize with diffs below
      }
      catch (err) {
        console.error('Failed to fetch tags for assets', err)
      }
    }

    // Build a per-asset diff between suggestedTags and existing tags
    type TagsDiff = {
      assetId: string
      existingTagNames: string[]
      existingTagRefs: Array<{ _type: 'reference'; _ref: string; _weak: true }>
      suggestedTags: string[]
      alreadyPresent: string[]
      missingTags: string[]
    }

    const tagsDiffByAsset: TagsDiff[] = (assetsWithTags || []).map((asset) => {
      // Extract existing tag names and references from tagsRaw
      // tagsRaw can be: array of strings, array of references, or mixed
      const existingNames: string[] = []
      const existingRefs: Array<{ _type: 'reference'; _ref: string; _weak: true }> = []
      
      if (Array.isArray(asset.tagsRaw)) {
        asset.tagsRaw.forEach((tag) => {
          if (typeof tag === 'string') {
            existingNames.push(tag)
          }
          else if (tag && typeof tag === 'object' && '_ref' in tag) {
            // Preserve existing references with _weak: true
            existingRefs.push({
              _type: 'reference',
              _ref: tag._ref as string,
              _weak: true,
            })
          }
        })
      }
      
      // Also check tagRefs array if available
      if (Array.isArray(asset.tagRefs)) {
        asset.tagRefs.forEach((ref) => {
          if (typeof ref === 'string') {
            existingRefs.push({ _type: 'reference', _ref: ref, _weak: true })
          }
        })
      }

      const toKey = (s: string) => s.trim().toLocaleLowerCase()

      const existingSet = new Set(existingNames.map(toKey))
      const suggestedSet = new Set((suggestedTags || []).map(toKey))

      const alreadyPresent = Array.from(suggestedSet).filter((s) => existingSet.has(s))
      const missingTags = Array.from(suggestedSet).filter((s) => !existingSet.has(s))

      // Return human facing values for readability (original casing from suggestedTags)
      const humanAlready = (suggestedTags || []).filter((t) => alreadyPresent.includes(toKey(t)))
      const humanMissing = (suggestedTags || []).filter((t) => missingTags.includes(toKey(t)))

      // Deduplicate existing refs by _ref
      const uniqueExistingRefs = Array.from(
        new Map(existingRefs.map((ref) => [ref._ref, ref])).values(),
      )

      return {
        assetId: asset._id,
        existingTagNames: unique(existingNames),
        existingTagRefs: uniqueExistingRefs,
        suggestedTags: unique(suggestedTags || []),
        alreadyPresent: unique(humanAlready),
        missingTags: unique(humanMissing),
      }
    })

    if (tagsDiffByAsset.length > 0) {
      console.log('✓ Tags diff by asset summary:', tagsDiffByAsset)

      // Collect all unique tag names (existing + suggested) that need to be referenced
      const allTagNames = unique(
        tagsDiffByAsset.flatMap((tagDiff) => [
          ...(tagDiff.existingTagNames || []),
          ...(tagDiff.suggestedTags || []),
        ]),
      ).filter(Boolean)

      const config = useRuntimeConfig()
      const sanity = createClient({
        projectId: config.public.sanity.projectId,
        dataset: config.public.sanity.dataset,
        apiVersion: config.public.sanity.apiVersion,
        useCdn: false,
        token: SANITY_WRITE_TOKEN,
      })

      // Find or create media.tag documents for each tag name
      const tagNameToRef = new Map<string, string>()

      if (allTagNames.length > 0) {
        try {
          // Query existing media.tag documents by name
          const tagQuery = `*[_type == "media.tag"]{
            _id,
            name,
            slug
          }`
          const existingTags = await sanity.fetch(tagQuery)

          // Build map of tag name (lowercase) -> tag document _id
          existingTags.forEach((tagDoc: any) => {
            const name = tagDoc.name?.current || tagDoc.slug?.current || tagDoc.name || tagDoc.slug
            if (name) {
              tagNameToRef.set(name.toLowerCase().trim(), tagDoc._id)
            }
          })

          // Create missing tag documents
          const tagsToCreate = allTagNames.filter(
            (name) => !tagNameToRef.has(name.toLowerCase().trim()),
          )

          for (const tagName of tagsToCreate) {
            try {
              const tagDoc = {
                _type: 'media.tag',
                name: {
                  _type: 'slug',
                  current: tagName,
                },
              }
              const created = await sanity.create(tagDoc)
              tagNameToRef.set(tagName.toLowerCase().trim(), created._id)
              console.log(`✓ Created media.tag document for "${tagName}": ${created._id}`)
            }
            catch (err) {
              console.error(`Failed to create tag "${tagName}":`, err)
            }
          }
        }
        catch (err) {
          console.error('Error finding/creating tag documents:', err)
        }
      }

      // Build mutations with tag references
      const mutations = tagsDiffByAsset
        .map((tagDiff) => {
          if (!tagDiff.missingTags || tagDiff.missingTags.length === 0) return null

          // Start with existing tag references (already in correct format)
          const mergedRefs = [...(tagDiff.existingTagRefs || [])]

          // Merge existing and suggested tag names, then convert to references
          const mergedTagNames = unique([
            ...(tagDiff.existingTagNames || []),
            ...(tagDiff.suggestedTags || []),
          ])

          // Convert tag names to references and add to merged refs
          // Note: Tags are stored as weak references per plugin specification
          mergedTagNames.forEach((name) => {
            const tagId = tagNameToRef.get(name.toLowerCase().trim())
            if (tagId) {
              mergedRefs.push({ _type: 'reference', _ref: tagId, _weak: true })
            }
          })

          // Remove duplicate references by _ref
          const uniqueRefs = Array.from(
            new Map(mergedRefs.map((ref) => [ref._ref, ref])).values(),
          )

          return {
            patch: {
              id: tagDiff.assetId,
              setIfMissing: { opt: { media: {} } },
              set: {
                'opt.media.tags': uniqueRefs,
              },
            },
          }
        })
        .filter(Boolean)

      if (mutations.length > 0) {
        console.log('✓ Mutations (with tag references):', mutations.length)
        try {
          const result = await sanity.mutate(mutations as any)
          console.log('✓ Mutations applied (tag references):', result)
        }
        catch (error) {
          console.error('Error applying mutations:', error)
        }
      }
    }

    return {
      ok: true,
      documentId: typeof body?._id === 'string' ? body._id : undefined,
      documentType: typeof body?._type === 'string' ? body._type : undefined,
      slug: typeof body?.slug?.current === 'string' ? body.slug.current : undefined,
      imagesCount: images.length,
    }
  }
  catch (error) {
    console.error('Error adding tags:', error)
    throw createError({
      statusCode: 500,
      message: 'Error adding tags',
    })
  }
})