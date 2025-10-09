import fs from 'node:fs'
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import {createId} from './utils/createId.js'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {MigrationReporter} from './migrationReporter.js'

const categoriesFolderPath = '../content/categories'

export default async function migrateCategories(client) {
  // Create reporter
  const reporter = new MigrationReporter('categories')
  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting categories migration...`)

    // Read all category directories
    const categoryDirs = fs
      .readdirSync(categoriesFolderPath, {withFileTypes: true})
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    log(`Found ${categoryDirs.length} category directories to migrate`)

    // Start a transaction for batch operations
    const tx = client.transaction()

    for (const dir of categoryDirs) {
      reporter.incrementTotal()

      try {
        // Look for JSON file in the directory
        const dirPath = path.join(categoriesFolderPath, dir)
        const jsonFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.json'))

        if (jsonFiles.length === 0) {
          reporter.recordWarning(dir, 'No JSON file found in directory')
          log(`⚠️  No JSON file found in ${dir}`)
          continue
        }

        // Process the first JSON file found (assuming one per directory)
        const jsonFile = jsonFiles[0]
        const jsonPath = path.join(dirPath, jsonFile)
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

        // Generate a unique ID from the title
        const categoryID = createId('category', data.title)

        log(`\n📁 ${data.title}`)

        // Prepare the category document for Sanity (only JSON fields)
        const categoryDoc = {
          _id: categoryID,
          _type: 'category',
          title: data.title,
          slug: {
            current: data.slug,
          },
          discoveryTitle: data.discoveryTitle,
          seoTitle: data.seoTitle,
          showOnHome: data.showOnHome || false,
        }

        // Handle image from JSON
        if (data?.image?.src && data.image.src.trim() !== '') {
          const imageRef = convertImageReference(
            data.image.src,
            assetMapping,
            data.image.alt || data.title,
            reporter,
            categoryID
          )

          if (imageRef) {
            categoryDoc.image = imageRef
            log(`  ✓ Image: ${data.image.src}`)
          } else {
            reporter.recordWarning(categoryID, `Image not found in assets: ${data.image.src}`)
            log(`  ⚠️  Image not found: ${data.image.src}`)
          }
        } else {
          reporter.recordWarning(categoryID, 'No image provided')
        }

        // Add to transaction
        tx.createOrReplace(categoryDoc)
        reporter.recordSuccess()
        log(`  ✅ Category prepared`)
      } catch (err) {
        reporter.recordFailure(dir, err.message)
        error(`❌ Failed to process ${dir}:`, err.message)
      }
    }

    // Commit the transaction
    log(`\n⏳ Committing all categories to Sanity...`)
    await tx.commit()
    log(`✅ Successfully migrated ${categoryDirs.length} categories to Sanity!`)

    // Generate and save report
    reporter.finish()
  } catch (err) {
    error('Error during migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
