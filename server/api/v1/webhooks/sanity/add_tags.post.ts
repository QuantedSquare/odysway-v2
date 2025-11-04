import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { createClient } from '@sanity/client'

type ImageReference = {
  assetRef: string
  alt?: string
  path: string[]
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