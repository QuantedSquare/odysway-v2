import fs from 'node:fs'
import {log, error} from 'node:console'
import path, { basename } from 'node:path'
import process from 'node:process'
import {createId} from './utils/createId.js'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'

// Configuration: Set to either a specific file path or the voyages directory
const voyagesBasePath = '../content/voyages/Sur-mesure'

export default async function migrateVoyages(client) {
  // Create reporter
  const reporter = new MigrationReporter('voyages')

  // List all team members at the start
  log('\n📋 Listing all Team Members:')
  const teamMembers = await client.fetch('*[_type == "teamMember"]{_id, name, slug}')
  if (teamMembers.length === 0) {
    log('  ⚠️  No team members found in Sanity!')
  } else {
    teamMembers.forEach(member => {
      log(`  👤 ${member.name || 'No name'} -> slug: ${member.slug?.current || 'No slug'} (ID: ${member._id})`)
    })
  }
  log('')

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

  // Convert experience type to reference with validation
  let experienceTypeRef = null
  if (voyage.experienceType) {
    const experienceId = createId('experience', voyage.experienceType)

    // Check if experience exists
    const experienceExists = await client.fetch(
      '*[_type == "experience" && _id == $experienceId][0]',
      { experienceId }
    )

    if (experienceExists) {
      experienceTypeRef = {_type: 'reference', _ref: experienceId}
      log(`  🎯 Experience "${voyage.experienceType}" -> ${experienceId} ✅ EXISTS`)
    } else {
      experienceTypeRef = null
      log(`  ⚠️  Experience "${voyage.experienceType}" -> ${experienceId} ❌ NOT FOUND, skipping reference`)
    }
  }

  // Convert difficulty level to reference
  let difficultyLevelRef = null
  if (voyage.level) {
    // Extract numeric level from string (e.g., "Niveau 1" -> 1, "1" -> 1)
    const levelMatch = voyage.level.match(/\d+/)
    if (levelMatch) {
      const levelNumber = parseInt(levelMatch[0], 10)
      // Fetch difficulty level by level number
      const difficultyLevel = await client.fetch(
        '*[_type == "difficultyLevel" && level == $levelNumber][0]',
        { levelNumber }
      )
      if (difficultyLevel) {
        difficultyLevelRef = {
          _type: 'reference',
          _ref: difficultyLevel._id,
        }
        log(`  🎯 Difficulty level "${voyage.level}" -> Level ${levelNumber} -> ID: ${difficultyLevel._id} ✅ EXISTS`)
      } else {
        log(`  ⚠️  Difficulty level "${voyage.level}" -> Level ${levelNumber} -> ❌ NOT FOUND`)
      }
    }
  }

  // Convert author to team member reference with fallback to romain
  let authorRef = null
  if (voyage.authorNote?.author) {
    const authorSlug = voyage.authorNote.author.toLowerCase().replace(/\s+/g, '-')
    const authorId = createId('teamMember', authorSlug)

    // Check if team member exists
    const teamMemberExists = await client.fetch(
      '*[_type == "teamMember" && _id == $authorId][0]',
      { authorId }
    )

    if (teamMemberExists) {
      authorRef = {_type: 'reference', _ref: authorId}
      log(`  👤 Author "${voyage.authorNote.author}" -> ${authorSlug} ✅ EXISTS`)
    } else {
      // Fallback to romain
      authorRef = {_type: 'reference', _ref: 'teamMember-romain'}
      log(`  👤 Author "${voyage.authorNote.author}" -> ${authorSlug} ❌ NOT FOUND, using fallback: romain`)
    }
  }

  // Convert photos list images
  if (voyage.photosList && Array.isArray(voyage.photosList)) {
    photosListRefs = voyage.photosList.map((photo, index) => ({
      _key: `photo-${index}`,
      ...convertImageReference(basename(photo.src), assetMapping, photo.alt || '', reporter, voyageID),
    }))
  }

  // Convert programme block images and description to Portable Text
  let programmeBlockWithImages = []
  if (voyage.programmeBlock && Array.isArray(voyage.programmeBlock)) {
    for (let index = 0; index < voyage.programmeBlock.length; index++) {
      const day = voyage.programmeBlock[index]
      const descriptionPortableText = await convertMarkdownToPortableText(day.description || '', assetMapping)
      
      programmeBlockWithImages.push({
        _key: `programme-${index}`,
        ...day,
        description: descriptionPortableText,
        photo: day.photo
          ? convertImageReference(basename(day.photo), assetMapping, '', reporter, voyageID)
          : null,
      })
    }
  }

  // Convert housing block images and housingMood to Portable Text
  let housingBlockWithImages = []
  if (voyage.housingBlock && Array.isArray(voyage.housingBlock)) {
    for (let index = 0; index < voyage.housingBlock.length; index++) {
      const housing = voyage.housingBlock[index]
      const housingMoodPortableText = await convertMarkdownToPortableText(housing.housingMood || '', assetMapping)
      
      housingBlockWithImages.push({
        _key: `housing-${index}`,
        ...housing,
        housingMood: housingMoodPortableText,
        image:
          housing.image && Array.isArray(housing.image)
            ? housing.image.map((img, imgIndex) => ({
                _key: `housing-image-${index}-${imgIndex}`,
                ...convertImageReference(basename(img.src), assetMapping, img.alt || '', reporter, voyageID),
              }))
            : [],
      })
    }
  }

  // Convert accompanists images and description to Portable Text
  let accompanistsWithImages = []
  if (voyage.accompanistsList && Array.isArray(voyage.accompanistsList)) {
    for (let index = 0; index < voyage.accompanistsList.length; index++) {
      const accompanist = voyage.accompanistsList[index]
      const descriptionPortableText = await convertMarkdownToPortableText(accompanist.description || '', assetMapping)
      
      accompanistsWithImages.push({
        _key: `accompanist-${index}`,
        ...accompanist,
        description: descriptionPortableText,
        image: accompanist.image
          ? convertImageReference(basename(accompanist.image), assetMapping, '', reporter, voyageID)
          : null,
      })
    }
  }

  // Convert SEO fields to new format
  let seoFields = null
  if (voyage.seoSection) {
    seoFields = {
      metaTitle: voyage.seoSection.metaTitle || null,
      metaDescription: voyage.seoSection.metaDescription || voyage.seoSection.ogDescription || null,
      canonicalUrl: voyage.seoSection.canonicalUrl || null,
      focusKeyword: voyage.seoSection.focusKeyword || null,
      keywords: voyage.seoSection.keywords || [],
      robotsIndex: voyage.seoSection.robotsIndex !== undefined ? voyage.seoSection.robotsIndex : true,
      robotsFollow: voyage.seoSection.robotsFollow !== undefined ? voyage.seoSection.robotsFollow : true,
      ogTitle: voyage.seoSection.ogTitle || null,
      ogDescription: voyage.seoSection.ogDescription || null,
      ogImage: voyage.seoSection.ogImage?.src
        ? convertImageReference(
            basename(voyage.seoSection.ogImage.src),
            assetMapping,
            voyage.seoSection.ogImage.alt || '',
            reporter,
            voyageID,
          )
        : null,
    }
  }

  // Use draft prefix if not published
  const finalVoyageID = voyage.published === false ? `drafts.${voyageID}` : voyageID

  // Convert availability types from old boolean fields to new array format
  const availabilityTypes = []
  if (voyage.groupeAvailable) availabilityTypes.push('groupe')
  if (voyage.privatisationAvailable) availabilityTypes.push('privatisation')
  if (voyage.customAvailable) availabilityTypes.push('custom')

  // Convert monthlyAvailability from object to array
  const monthlyAvailabilityArray = []
  if (voyage.monthlyAvailability) {
    if (voyage.monthlyAvailability.toutePeriodes) monthlyAvailabilityArray.push('toutePeriodes')
    if (voyage.monthlyAvailability.janvier) monthlyAvailabilityArray.push('janvier')
    if (voyage.monthlyAvailability.fevrier) monthlyAvailabilityArray.push('fevrier')
    if (voyage.monthlyAvailability.mars) monthlyAvailabilityArray.push('mars')
    if (voyage.monthlyAvailability.avril) monthlyAvailabilityArray.push('avril')
    if (voyage.monthlyAvailability.mai) monthlyAvailabilityArray.push('mai')
    if (voyage.monthlyAvailability.juin) monthlyAvailabilityArray.push('juin')
    if (voyage.monthlyAvailability.juillet) monthlyAvailabilityArray.push('juillet')
    if (voyage.monthlyAvailability.aout) monthlyAvailabilityArray.push('aout')
    if (voyage.monthlyAvailability.septembre) monthlyAvailabilityArray.push('septembre')
    if (voyage.monthlyAvailability.octobre) monthlyAvailabilityArray.push('octobre')
    if (voyage.monthlyAvailability.novembre) monthlyAvailabilityArray.push('novembre')
    if (voyage.monthlyAvailability.decembre) monthlyAvailabilityArray.push('decembre')
  }

  // Prepare the voyage document for Sanity
  return {
    _id: finalVoyageID,
    _type: 'voyage',
    title: voyage.title || '',
    slug: {
      current: voyage.slug || voyageID.replace('voyage-', ''),
    },
    destinations: destinationsRefs,

    // New array-based availability types
    availabilityTypes: availabilityTypes,

    // Legacy fields (hidden in schema but kept for backward compatibility)
    groupeAvailable: voyage.groupeAvailable || false,
    privatisationAvailable: voyage.privatisationAvailable || false,
    customAvailable: voyage.customAvailable || false,

    experienceType: experienceTypeRef,

    // New difficultyLevel reference
    difficultyLevel: difficultyLevelRef,

    // Legacy level field (hidden in schema but kept for backward compatibility)
    level: voyage.level || '',

    categories: categoriesRefs,
    duration: voyage.duration || 0,
    nights: voyage.nights || 0,
    includeFlight: voyage.includeFlight || false,
    rating: voyage.rating || 0,
    comments: voyage.comments || 0,
    image: mainImageRef,
    imageSecondary: secondaryImageRef,
    authorNote: {
      text: await convertMarkdownToPortableText(voyage.authorNote?.text || '', assetMapping),
      author: authorRef,
      affixeAuthor: voyage.authorNote?.affixeAuthor || '',
    },
    experiencesBlock: await convertStringArrayToPortableText(voyage.experiencesBlock || [], assetMapping),
    description: voyage.description || '',
    emailDescription: voyage.emailDescription || '',

    // Note: Badges will need to be migrated separately using badge references
    // TODO: Implement badge migration after standard badges are created in Sanity
    badges: [],
    programmeBlock: programmeBlockWithImages,
    pricingDetailsBlock: {
      listInclude: await convertStringArrayToPortableText(voyage.pricingDetailsBlock?.include || [], assetMapping),
      listExclude: await convertStringArrayToPortableText(voyage.pricingDetailsBlock?.exclude || [], assetMapping),
    },
    pricing: {
      ...voyage.pricing,
      maxTravelers: voyage.pricing?.maxTravelers || 8,
      lastMinuteAvailable: voyage.pricing?.lastMinuteAvailable || false,
      lastMinuteReduction: voyage.pricing?.lastMinuteReduction || 0,
      earlyBirdAvailable: voyage.pricing?.earlyBirdAvailable || false,
      earlyBirdReduction: voyage.pricing?.earlyBirdReduction || 0,
      minTravelersToConfirm: voyage.pricing?.minTravelersToConfirm || 2,
      indivRoom: voyage.pricing?.indivRoom || false,
      forcedIndivRoom: voyage.pricing?.forcedIndivRoom || false,
      indivRoomPrice: voyage.pricing?.indivRoomPrice || 0,
      cseAvailable: voyage.pricing?.cseAvailable || false,
      cseReduction: voyage.pricing?.cseReduction || 0,
      childrenPromo: voyage.pricing?.childrenPromo || 0,
      childrenAge: voyage.pricing?.childrenAge || 12,
    },
    accompanistsDescription: await convertMarkdownToPortableText(voyage.accompanistsDescription || '', assetMapping),
    accompanistsList: accompanistsWithImages,
    housingBlock: housingBlockWithImages,
    photosList: photosListRefs,
    videoLinks: voyage.videoLinks || [],
    faqBlock: await convertFaqBlockToPortableText(voyage.faqBlock?.faqList || [], assetMapping),
    seo: seoFields,

    // Convert monthlyAvailability from object to array
    monthlyAvailability: monthlyAvailabilityArray,
  }
}

// Generic function to convert string arrays to Portable Text
async function convertStringArrayToPortableText(stringArray, assetMapping) {
  if (!stringArray || stringArray.length === 0) {
    return []
  }

  // Convert array of strings to markdown list format
  const markdownList = stringArray.map(item => `- ${item}`).join('\n')
  
  // Convert markdown to Portable Text
  return await convertMarkdownToPortableText(markdownList, assetMapping)
}

// Function to convert FAQ block to Portable Text
async function convertFaqBlockToPortableText(faqList, assetMapping) {
  if (!faqList || faqList.length === 0) {
    return []
  }

  const faqBlockWithPortableText = []
  for (let index = 0; index < faqList.length; index++) {
    const faq = faqList[index]
    const answerPortableText = await convertMarkdownToPortableText(faq.answer || '', assetMapping)
    
    faqBlockWithPortableText.push({
      _key: `faq-${index}`,
      ...faq,
      answer: answerPortableText,
    })
  }
  
  return faqBlockWithPortableText
}

