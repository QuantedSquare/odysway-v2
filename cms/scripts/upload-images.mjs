/* eslint-env node */
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import process from 'node:process'
import {log, error} from 'node:console'
import {readFileSync, readdirSync, statSync} from 'node:fs'
import {join, extname, basename, relative} from 'node:path'
dotenv.config()

const projectId = process.env.SANITY_PROJECT_ID || 'nu6yntji'
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  error('Missing SANITY_WRITE_TOKEN environment variable. Create a token with write access in the Sanity project settings and set it before running the upload.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
})

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

/**
 * Recursively get all image files from a directory
 */
function getImageFiles(dir, fileList = []) {
  const files = readdirSync(dir)

  files.forEach((file) => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      getImageFiles(filePath, fileList)
    } else {
      const ext = extname(file).toLowerCase()
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath)
      }
    }
  })

  return fileList
}

/**
 * Upload a single image to Sanity
 */
async function uploadImage(filePath, publicDir, existingAssets) {
  try {
    // Generate the path as it appears in your JSON files (e.g., /images/destinations/file.jpg)
    const relativePath = '/' + relative(publicDir, filePath).replace(/\\/g, '/')

    // Check if already uploaded by checking the source.id field
    const existing = existingAssets.find((asset) => asset.source?.id === relativePath)
    if (existing) {
      log(`⏭️  Skipped (already exists): ${relativePath} -> ${existing._id}`)
      return {success: true, filePath, relativePath, assetId: existing._id, skipped: true}
    }

    const fileBuffer = readFileSync(filePath)
    const fileName = basename(filePath)
    const ext = extname(filePath).toLowerCase()

    // Determine content type
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }
    const contentType = contentTypeMap[ext] || 'application/octet-stream'

    // Upload the image with the relative path stored in metadata
    const asset = await client.assets.upload('image', fileBuffer, {
      filename: fileName,
      contentType,
      source: {
        name: 'migration',
        id: relativePath, // Store the path exactly as it appears in your JSON
      },
    })

    // CRITICAL: Wait for Sanity to persist the upload
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Verify it was actually saved
    const verification = await client.fetch(
      `*[_type == "sanity.imageAsset" && _id == $id][0]._id`,
      {id: asset._id}
    )

    if (verification) {
      log(`✅ Uploaded: ${relativePath} -> ${asset._id}`)
      return {success: true, filePath, relativePath, assetId: asset._id, skipped: false}
    } else {
      error(`⚠️ Uploaded but NOT verified: ${relativePath}`)
      return {success: false, filePath, relativePath, error: 'Upload not verified'}
    }
  } catch (err) {
    error(`❌ Failed to upload ${filePath}:`, err.message)
    return {success: false, filePath, error: err.message}
  }
}

async function run() {
  const publicDir = join(process.cwd(), '..', 'public')
  const imagesDir = join(publicDir, 'images')

  // TODO: Remove this filter after testing - only upload destinations for now
  const testSubfolder = null // Set to null to upload all images
  const scanDir = testSubfolder ? join(imagesDir, testSubfolder) : imagesDir

  log(`📁 Scanning for images in: ${scanDir}`)
  const imageFiles = getImageFiles(scanDir)

  log(`🖼️  Found ${imageFiles.length} images to upload`)

  // Fetch existing assets to avoid duplicates
  log('🔍 Fetching existing assets...')
  const existingAssets = await client.fetch('*[_type == "sanity.imageAsset"]{ _id, source }')
  log(`📦 Found ${existingAssets.length} existing assets`)

  const results = []
  const totalImages = imageFiles.length
  let uploadedCount = 0
  let skippedCount = 0

  // Upload images sequentially to avoid rate limiting
  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i]
    log(`\n[${i + 1}/${totalImages}] (✅ ${uploadedCount} uploaded | ⏭️  ${skippedCount} skipped) Processing: ${relative(publicDir, filePath)}`)

    const result = await uploadImage(filePath, publicDir, existingAssets)
    results.push(result)

    // Update counters
    if (result.success && result.skipped) {
      skippedCount++
    } else if (result.success) {
      uploadedCount++
    }

    // Add a small delay between uploads
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Summary
  const successful = results.filter((r) => r.success && !r.skipped).length
  const skipped = results.filter((r) => r.success && r.skipped).length
  const failed = results.filter((r) => !r.success).length

  log('\n📊 Upload Summary:')
  log(`   ✅ Uploaded: ${successful}`)
  log(`   ⏭️  Skipped: ${skipped}`)
  log(`   ❌ Failed: ${failed}`)
  log(`   📝 Total: ${results.length}`)

  if (failed > 0) {
    log('\n❌ Failed uploads:')
    results.filter((r) => !r.success).forEach((r) => {
      log(`   - ${r.filePath}: ${r.error}`)
    })
  }

  log('\n💡 Note: Image paths are stored in asset metadata (source.id)')
  log('   Use imageAssetHelper.js in migration scripts to map paths to asset IDs')
}

run().catch((e) => {
  error(e)
  process.exit(1)
})
