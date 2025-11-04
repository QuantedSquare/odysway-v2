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
  const tags: string[] = []

  if (!doc || typeof doc !== 'object') return tags

  const docType: string | undefined = typeof doc._type === 'string' ? doc._type : undefined
  const slugCurrent: string | undefined = typeof doc?.slug?.current === 'string' ? doc.slug.current : undefined

  if (docType) {
    // Generic type tag (Title-cased)
    tags.push(toTitleCase(docType))
  }

  if (slugCurrent) {
    // Add both raw slug and a human version
    tags.push(slugCurrent)
    tags.push(toTitleCase(slugCurrent))
  }

  const titleLikeFields = ['title', 'nom', 'name', 'heading', 'label']
  for (const key of titleLikeFields) {
    const value = (doc as any)[key]
    if (typeof value === 'string') {
      const normalized = normalizeTagCandidate(value)
      if (normalized) tags.push(normalized, toTitleCase(normalized))
    }
    else if (value && typeof value === 'object' && typeof value.current === 'string') {
      const normalized = normalizeTagCandidate(value.current)
      if (normalized) tags.push(normalizeTagCandidate(value.current)!, toTitleCase(value.current))
    }
  }

  // Type-specific heuristics
  switch (docType) {
    case 'voyage': {
      // Voyage commonly tied to a destination/region via slugs or refs.
      // If we have explicit fields, incorporate them when available.
      const voyageName = slugCurrent || (typeof doc.title === 'string' ? doc.title : undefined)
      if (voyageName) tags.push(`Voyage ${toTitleCase(voyageName)}`)
      // If destination slug present
      const destinationSlug = typeof doc?.destinationSlug === 'string' ? doc.destinationSlug : (typeof doc?.destination?.slug?.current === 'string' ? doc.destination.slug.current : undefined)
      if (destinationSlug) tags.push(`Destination ${toTitleCase(destinationSlug)}`)
      break
    }
    case 'destination': {
      const destName = slugCurrent || (typeof doc.title === 'string' ? doc.title : undefined)
      if (destName) tags.push(`Destination ${toTitleCase(destName)}`)
      break
    }
    case 'region': {
      const regionName = slugCurrent || (typeof doc.nom === 'string' ? doc.nom : undefined)
      if (regionName) tags.push(`Region ${toTitleCase(regionName)}`)
      break
    }
    case 'blog':
    case 'post':
    case 'pageBlog': {
      const blogName = slugCurrent || (typeof doc.title === 'string' ? doc.title : undefined)
      if (blogName) tags.push(`Blog ${toTitleCase(blogName)}`)
      break
    }
    case 'experience': {
      const expName = slugCurrent || (typeof doc.title === 'string' ? doc.title : undefined)
      if (expName) tags.push(`Experience ${toTitleCase(expName)}`)
      break
    }
    case 'category': {
      const catName = slugCurrent || (typeof doc.title === 'string' ? doc.title : undefined)
      if (catName) tags.push(`Category ${toTitleCase(catName)}`)
      break
    }
    default: {
      // No special handling
    }
  }

  // Remove falsy and duplicates; keep short list
  return unique(tags.filter(Boolean).map((t) => t.trim()).filter((t) => t.length > 0 && t.length <= 80))
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
      // Raw tags field as stored by the Media plugin (may be array of strings or refs)
      tagsRaw?: unknown
      // Resolved tags if they are references
      tags?: Array<{ _id: string; name?: string; slug?: string }>
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
        // Raw tags as stored by the Media plugin (keep for debugging)
        "tagsRaw": opt.media.tags,
        // Attempt to resolve tag refs if present (common in Media plugin)
        "tags": coalesce(opt.media.tags[]->{
          _id,
          name,
          ...,
          // tags often have slug or value; project both safely
          "slug": select(defined(slug.current) => slug.current, slug)
        }, [])
      }`

      try {
        assetsWithTags = await sanity.fetch(query, { ids: assetIds })
        console.log('✓ Retrieved tags for assets:', assetsWithTags)
        if (assetsWithTags.length > 0) {
          for (const asset of assetsWithTags) {
            console.log('✓ Asset:', asset.tags)
            for (const tag of asset.tags || []) {
              console.log('✓ Tag:', tag)
            }
          }
        }
      }
      catch (err) {
        console.error('Failed to fetch tags for assets', err)
      }
    }

    return {
      ok: true,
      documentId: typeof body?._id === 'string' ? body._id : undefined,
      documentType: typeof body?._type === 'string' ? body._type : undefined,
      slug: typeof body?.slug?.current === 'string' ? body.slug.current : undefined,
      imagesCount: images.length,
      images,
      assetsWithTags,
      suggestedTags,
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