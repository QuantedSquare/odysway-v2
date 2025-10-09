import fs from 'node:fs'
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import dayjs from 'dayjs'
import {createId} from './utils/createId.js'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {MigrationReporter} from './migrationReporter.js'

// Configuration: Path to the reviews directory containing JSON files
const reviewsBasePath = '../content/avis'

export default async function migrateReviews(client) {
  // Create reporter
  const reporter = new MigrationReporter('reviews')

  // Clean existing reviews before migration
  await cleanExistingReviews(client)

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting reviews migration from directory: ${reviewsBasePath}`)
    await processReviewsDirectory(reviewsBasePath, client, assetMapping, reporter)

    // Generate and save report
    reporter.finish()
  } catch (err) {
    error('Error during reviews migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

// Function to clean existing reviews before migration
async function cleanExistingReviews(client) {
  try {
    log('🧹 Cleaning existing reviews...')
    
    // Fetch all existing review documents
    const existingReviews = await client.fetch('*[_type == "review"]{_id}')
    
    if (existingReviews.length === 0) {
      log('✅ No existing reviews found to clean')
      return
    }
    
    log(`🗑️  Found ${existingReviews.length} existing reviews to delete`)
    
    // Delete all existing reviews
    const transaction = client.transaction()
    existingReviews.forEach(review => {
      transaction.delete(review._id)
    })
    
    await transaction.commit()
    log(`✅ Successfully deleted ${existingReviews.length} existing reviews`)
    
  } catch (err) {
    error('❌ Error cleaning existing reviews:', err.message)
    throw err
  }
}

// Function to process all reviews in a directory
async function processReviewsDirectory(basePath, client, assetMapping, reporter) {
  // Get all JSON files directly in the directory
  const jsonFiles = fs
    .readdirSync(basePath)
    .filter((file) => file.endsWith('.json'))

  log(`Found ${jsonFiles.length} JSON files in ${basePath}`)

  // Process each JSON file
  for (const jsonFile of jsonFiles) {
    try {
      const filePath = path.join(basePath, jsonFile)
      const review = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      // Filter out reviews without voyageTitle
      if (!review.voyageTitle || review.voyageTitle.trim() === '') {
        log(`⚠️  Skipping review ${jsonFile}: missing voyageTitle`)
        continue
      }
      
      reporter.incrementTotal()

      const reviewID = createId('review', jsonFile.replace('.json', ''))
      const reviewDoc = await prepareReviewDocument(review, reviewID, assetMapping, client)

      await client.createOrReplace(reviewDoc)
      reporter.recordSuccess()
      log(`✅ Successfully migrated review: ${review.author} (ID: ${reviewID})`)
    } catch (fileErr) {
      error(`Error processing file ${jsonFile}:`, fileErr.message)
      reporter.recordFailure('file_processing', fileErr.message)
    }
  }
}

// Function to prepare review document with image conversion
async function prepareReviewDocument(review, reviewID, assetMapping, client) {
  // Convert photo reference if exists
  let photoRef = null
  if (review.photo && review.photo.trim() !== '') {
    photoRef = convertImageReference(review.photo, assetMapping, '', null, reviewID)
  }

  // Create voyage reference using voyageSlug
  let voyageRef = null
  if (review.voyageSlug) {
    // First, try to find the voyage by slug
    const existingVoyages = await client.fetch('*[_type == "voyage"]{_id, slug}')
    const matchingVoyage = existingVoyages.find(v => v.slug?.current === review.voyageSlug)
    
    if (matchingVoyage) {
      voyageRef = {
        _type: 'reference',
        _ref: matchingVoyage._id,
      }
      log(`  🎯 Voyage reference found: ${review.voyageSlug} -> ${matchingVoyage._id}`)
    } else {
      log(`  ⚠️  Voyage not found for slug: ${review.voyageSlug}`)
    }
  }

  // Format date to YYYY-MM-DD format using dayjs
  let formattedDate = dayjs().format('YYYY-MM-DD') 
  if (review.date) {
    const parsedDate = dayjs(review.date)
    if (parsedDate.isValid()) {
      formattedDate = parsedDate.format('YYYY-MM-DD')
    } else {
      log(`⚠️  Invalid date format in review ${reviewID}: ${review.date}`)
    }
  }

  // Prepare the review document for Sanity
  const reviewDoc = {
    _id: reviewID,
    _type: 'review',
    author: review.author || '',
    authorAge: review.authorAge || '',
    date: formattedDate,
    rating: review.rating || 0,
    text: review.text || '',
    voyage: voyageRef,
    voyageTitle: review.voyageTitle || '',
    isOnHome: review.isOnHome || false,
  }

  // Only add photo field if it exists
  if (photoRef) {
    reviewDoc.photo = photoRef
  }

  return reviewDoc
}
