import fs from 'node:fs'
import {log, error} from 'node:console'
import path, { basename } from 'node:path'
import process from 'node:process'
import {createId} from './utils/createId.js'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {MigrationReporter} from './migrationReporter.js'

// Configuration: Set to either a specific file path or the voyages directory
const voyagesBasePath = '../content/voyages/1. France'

export default async function migrateVoyages(client) {
  // Create reporter
  const reporter = new MigrationReporter('voyages')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    // Check if the path is a file or directory
    const isFile = voyagesBasePath.endsWith('.json')

    if (isFile) {
      log(`Starting single voyage migration: ${path.basename(voyagesBasePath)}`)
      await processSingleVoyageFile(voyagesBasePath, client, assetMapping, reporter)
    } else {
      log(`Starting full voyages migration from directory: ${voyagesBasePath}`)
      await processVoyagesDirectory(voyagesBasePath, client, assetMapping, reporter)
    }

    // Generate and save report
    reporter.finish()
  } catch (err) {
    error('Error during voyages migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

// Function to process a single voyage file
async function processSingleVoyageFile(filePath, client, assetMapping, reporter) {
  try {
    const voyage = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    reporter.incrementTotal()

    const voyageID = createId('voyage', voyage.slug || path.basename(filePath, '.json'))
    const voyageDoc = await prepareVoyageDocument(voyage, voyageID, assetMapping, client)

    await client.createOrReplace(voyageDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated voyage: ${voyage.title} (ID: ${voyageID})`)
  } catch (fileErr) {
    error(`Error processing file ${path.basename(filePath)}:`, fileErr.message)
    reporter.recordFailure('file_processing', fileErr.message)
  }
}

// Function to process all voyages in a directory
async function processVoyagesDirectory(basePath, client, assetMapping, reporter) {
  // Get all JSON files directly in the directory (excluding .md files)
  const jsonFiles = fs
    .readdirSync(basePath)
    .filter((file) => file.endsWith('.json'))

  log(`Found ${jsonFiles.length} JSON files in ${basePath}: ${jsonFiles.join(', ')}`)

  // Process each JSON file
  for (const jsonFile of jsonFiles) {
    try {
      const filePath = path.join(basePath, jsonFile)
      const voyage = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      reporter.incrementTotal()

      const voyageID = createId('voyage', voyage.slug || jsonFile.replace('.json', ''))
      const voyageDoc = await prepareVoyageDocument(voyage, voyageID, assetMapping, client)

      await client.createOrReplace(voyageDoc)
      reporter.recordSuccess()
      log(`✅ Successfully migrated voyage: ${voyage.title} (ID: ${voyageID})`)
    } catch (fileErr) {
      error(`Error processing file ${jsonFile}:`, fileErr.message)
      reporter.recordFailure('file_processing', fileErr.message)
    }
  }
}

// Helper function to create document reference
function createDocumentReference(type, identifier) {
  return {
    _type: 'reference',
    _ref: createId(type, identifier),
  }
}

// Function to prepare voyage document with image conversion
async function prepareVoyageDocument(voyage, voyageID, assetMapping, client, reporter) {
  // Convert image references
  let mainImageRef = null
  let secondaryImageRef = null
  let photosListRefs = []

  if (voyage.image?.src) {
    mainImageRef = convertImageReference(
      basename(voyage.image.src),
      assetMapping,
      voyage.image.alt || '',
      reporter,
      voyageID,
    )
  }
  if (voyage.imageSecondary?.src) {
    secondaryImageRef = convertImageReference(
      basename(voyage.imageSecondary.src),
      assetMapping,
      voyage.imageSecondary.alt || '',
      reporter,
      voyageID,
    )
  }

  // Convert destinations to references
  let destinationsRefs = []
  if (voyage.destinations && Array.isArray(voyage.destinations)) {
    // Fetch existing destinations
    const existingDestinations = await client.fetch('*[_type == "destination"]{_id, title, name}')
    destinationsRefs = voyage.destinations.map((dest, index) => {
      const destId = createId('destination', dest.name)
      const existingDest = existingDestinations.find((d) => d._id === destId)
      log(
        `  🎯 Destination "${dest.name}" -> ID: ${destId} ${existingDest ? '✅ EXISTS' : '❌ NOT FOUND'}`,
      )
      return {
        _key: `destination-${index}`,
        _type: 'reference',
        _ref: destId,
      }
    })
  }

  // Convert categories to references
  let categoriesRefs = []
  if (voyage.categories && Array.isArray(voyage.categories)) {
    // Fetch existing categories
    const existingCategories = await client.fetch('*[_type == "category"]{_id, title, slug}')
    categoriesRefs = voyage.categories.map((cat, index) => {
      const existingCat = existingCategories.find((c) => c.slug.current === cat.name)
      log(
        `  🎯 Category "${cat.name}" -> ID: ${existingCat._id} ${existingCat ? '✅ EXISTS' : '❌ NOT FOUND'}`,
      )
      return {
        _key: `category-${index}`,
        _type: 'reference',
        _ref: existingCat._id,
      }
    })
  }

  // Convert experience type to reference
  let experienceTypeRef = null
  if (voyage.experienceType) {
    experienceTypeRef = createDocumentReference('experience', voyage.experienceType)
  }

  // Convert author to team member reference
  let authorRef = null
  if (voyage.authorNote?.author) {
    const authorSlug = voyage.authorNote.author.toLowerCase().replace(/\s+/g, '-')
    authorRef = createDocumentReference('teamMember', authorSlug)
  }

  // Convert photos list images
  if (voyage.photosList && Array.isArray(voyage.photosList)) {
    photosListRefs = voyage.photosList.map((photo, index) => ({
      _key: `photo-${index}`,
      ...convertImageReference(basename(photo.src), assetMapping, photo.alt || '', reporter, voyageID),
    }))
  }

  // Convert programme block images
  let programmeBlockWithImages = []
  if (voyage.programmeBlock && Array.isArray(voyage.programmeBlock)) {
    programmeBlockWithImages = voyage.programmeBlock.map((day, index) => ({
      _key: `programme-${index}`,
      ...day,
      photo: day.photo
        ? convertImageReference(basename(day.photo), assetMapping, '', reporter, voyageID)
        : null,
    }))
  }

  // Convert housing block images
  let housingBlockWithImages = []
  if (voyage.housingBlock && Array.isArray(voyage.housingBlock)) {
    housingBlockWithImages = voyage.housingBlock.map((housing, index) => ({
      _key: `housing-${index}`,
      ...housing,
      image:
        housing.image && Array.isArray(housing.image)
          ? housing.image.map((img, imgIndex) => ({
              _key: `housing-image-${index}-${imgIndex}`,
              ...convertImageReference(basename(img.src), assetMapping, img.alt || '', reporter, voyageID),
            }))
          : [],
    }))
  }

  // Convert accompanists images
  let accompanistsWithImages = []
  if (voyage.accompanistsList && Array.isArray(voyage.accompanistsList)) {
    accompanistsWithImages = voyage.accompanistsList.map((accompanist, index) => ({
      _key: `accompanist-${index}`,
      ...accompanist,
      image: accompanist.image
        ? convertImageReference(basename(accompanist.image), assetMapping, '', reporter, voyageID)
        : null,
    }))
  }

  // Convert SEO images
  let seoSectionWithImages = voyage.seoSection
  if (voyage.seoSection) {
    seoSectionWithImages = {
      ...voyage.seoSection,
      ogImage: voyage.seoSection.ogImage?.src
        ? convertImageReference(
            basename(voyage.seoSection.ogImage.src),
            assetMapping,
            voyage.seoSection.ogImage.alt || '',
            reporter,
            voyageID,
          )
        : voyage.seoSection.ogImage,
      twitterImage: voyage.seoSection.twitterImage?.src
        ? convertImageReference(
            basename(voyage.seoSection.twitterImage.src),
            assetMapping,
            voyage.seoSection.twitterImage.alt || '',
            reporter,
            voyageID,
          )
        : voyage.seoSection.twitterImage,
    }
  }

  // Prepare the voyage document for Sanity
  return {
    _id: voyageID,
    _type: 'voyage',
    published: voyage.published || false,
    title: voyage.title || '',
    slug: {
      current: voyage.slug || voyageID.replace('voyage-', ''),
    },
    destinations: destinationsRefs,
    groupeAvailable: voyage.groupeAvailable || false,
    privatisationAvailable: voyage.privatisationAvailable || false,
    customAvailable: voyage.customAvailable || false,
    experienceType: experienceTypeRef,
    level: voyage.level || '',
    categories: categoriesRefs,
    duration: voyage.duration || 0,
    nights: voyage.nights || 0,
    includeFlight: voyage.includeFlight || false,
    housingType: voyage.housingType || '',
    minAge: voyage.minAge || 0,
    rating: voyage.rating || 0,
    comments: voyage.comments || 0,
    miniatureDisplay: voyage.miniatureDisplay || '',
    authorNote: {
      text: voyage.authorNote?.text || '',
      author: authorRef,
      affixeAuthor: voyage.authorNote?.affixeAuthor || '',
    },
    experiencesBlock: voyage.experiencesBlock || [],
    description: voyage.description || '',
    emailDescription: voyage.emailDescription || '',
    metaDescription: voyage.metaDescription || '',
    badgeSection: voyage.badgeSection || {},
    programmeBlock: programmeBlockWithImages,
    pricingDetailsBlock: voyage.pricingDetailsBlock || {},
    pricing: voyage.pricing || {},
    accompanistsDescription: voyage.accompanistsDescription || '',
    accompanistsList: accompanistsWithImages,
    housingBlock: housingBlockWithImages,
    image: mainImageRef,
    imageSecondary: secondaryImageRef,
    photosList: photosListRefs,
    videoLinks: voyage.videoLinks || [],
    faqBlock: voyage.faqBlock?.faqList
      ? voyage.faqBlock.faqList.map((faq, index) => ({
          _key: `faq-${index}`,
          ...faq,
        }))
      : [],
    seoSection: seoSectionWithImages,
    idealPeriods: voyage.idealPeriods || {},
    monthlyAvailability: voyage.monthlyAvailability || {},
  }
}
