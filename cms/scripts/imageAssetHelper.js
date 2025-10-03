/* eslint-env node */
import {log, error} from 'node:console'

/**
 * Fetch all image assets from Sanity and create a path-to-ID mapping
 * @param {import('@sanity/client').SanityClient} client
 * @returns {Promise<Map<string, string>>} Map of image path -> asset ID
 */
export async function buildImageAssetMapping(client) {
  try {
    // Check total count
    const count = await client.fetch(`count(*[_type == "sanity.imageAsset"])`)
    log(`📊 Found ${count} image assets in Sanity`)

    if (count === 0) {
      error('⚠️  No image assets found. Did you run upload-images.mjs first?')
      return new Map()
    }

    // Fetch all assets (with pagination if needed)
    let allAssets = []

    if (count > 10000) {
      log('📄 Large number of assets detected, using pagination...')
      let offset = 0
      const limit = 10000

      while (offset < count) {
        const batch = await client.fetch(
          `*[_type == "sanity.imageAsset"] | order(_id) [${offset}...${offset + limit}] { _id, "path": source.id }`,
        )
        allAssets = allAssets.concat(batch)
        offset += limit
        log(`   Fetched ${allAssets.length}/${count} assets...`)
      }
    } else {
      // Fetch all at once
      allAssets = await client.fetch(
        `*[_type == "sanity.imageAsset"]{ _id, "path": source.id }`,
      )
    }

    // Build the mapping
    const mapping = new Map()
    let assetsWithPath = 0
    let assetsWithoutPath = 0

    for (const asset of allAssets) {
      if (asset.path) {
        mapping.set(asset.path, asset._id)
        assetsWithPath++
      } else {
        assetsWithoutPath++
      }
    }

    log(`✅ Built mapping for ${assetsWithPath} assets`)
    if (assetsWithoutPath > 0) {
      log(`⚠️  ${assetsWithoutPath} assets have no source.id path (likely not from migration)`)
    }

    return mapping
  } catch (err) {
    error('❌ Failed to build image asset mapping:', err.message)
    throw err
  }
}

/**
 * Convert an image path to a Sanity image reference object
 * @param {string} imagePath - The image path from JSON (e.g., "/images/destinations/file.jpg")
 * @param {Map<string, string>} assetMapping - The path-to-ID mapping
 * @param {string} [alt] - Optional alt text for the image
 * @param {object} [reporter] - Optional MigrationReporter instance
 * @param {string} [documentId] - Optional document ID for tracking
 * @returns {object|null} Sanity image object or null if not found
 */
export function convertImageReference(imagePath, assetMapping, alt = '', reporter = null, documentId = null) {
  if (!imagePath) {
    return null
  }

  const assetId = assetMapping.get(imagePath)

  if (!assetId) {
    error(`⚠️  Image not found in assets: ${imagePath}`)

    // Track missing image in reporter
    if (reporter && documentId) {
      reporter.recordMissingImage(imagePath, documentId)
    }

    return null
  }

  // Track successful image reference
  if (reporter) {
    reporter.recordImageReference(imagePath)
  }

  const imageObj = {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
  }

  if (alt) {
    imageObj.alt = alt
  }

  return imageObj
}

/**
 * Convert an array of image paths to Sanity image reference objects
 * @param {string[]} imagePaths - Array of image paths
 * @param {Map<string, string>} assetMapping - The path-to-ID mapping
 * @param {object} [reporter] - Optional MigrationReporter instance
 * @param {string} [documentId] - Optional document ID for tracking
 * @returns {object[]} Array of Sanity image objects (skips not found)
 */
export function convertImageArray(imagePaths, assetMapping, reporter = null, documentId = null) {
  if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
    return []
  }

  return imagePaths
    .map((path) => convertImageReference(path, assetMapping, '', reporter, documentId))
    .filter((img) => img !== null)
}

/**
 * Find orphaned assets (assets that exist but are not referenced)
 * @param {Map<string, string>} assetMapping - The path-to-ID mapping
 * @param {Set<string>} referencedPaths - Set of image paths that were referenced
 * @returns {string[]} Array of orphaned asset paths
 */
export function findOrphanedAssets(assetMapping, referencedPaths) {
  const allAssetPaths = Array.from(assetMapping.keys())
  return allAssetPaths.filter((path) => !referencedPaths.has(path))
}
