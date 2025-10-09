import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const experiencesFolderPath = '../content/experiences'

export default async function migrateExperiences(client) {
  // Create reporter
  const reporter = new MigrationReporter('experiences')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting experiences migration...`)

    // Read all experience directories
    const experiencesDirs = fs.readdirSync(experiencesFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    log(`Found ${experiencesDirs.length} experience directories to migrate`)

    // Start a transaction for batch operations
    const tx = client.transaction()
    
    for (const dir of experiencesDirs) {
      reporter.incrementTotal()

      try {
        // Look for JSON files in each directory
        const dirPath = path.join(experiencesFolderPath, dir);
        const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

        if (files.length === 0) {
          reporter.recordWarning(dir, 'No JSON files found in directory')
          log(`⚠️  No JSON files found in ${dir}`)
          continue;
        }

        // Process the first JSON file found (assuming one per directory)
        const jsonFile = files[0];
        const filePath = path.join(dirPath, jsonFile);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Generate a unique ID from the slug
        const experienceID = createId('experience', data.title)
      log('slug', data.slug)
      // Prepare the experience document for Sanity
      const experienceDoc = {
        _id: experienceID,
        _type: 'experience',
        title: data.title,
        badgeTitle: data.badgeTitle,
        slug: {
          current: data.slug
        },
        discoveryTitle: data.discoveryTitle,
        seoTitle: data.seoTitle,
        showOnHome: data.showOnHome,
      }
      
      // Handle image if it exists and has a src
      if (data?.image?.src && data.image.src.trim() !== '') {
        const imageRef = convertImageReference(
          data.image.src,
          assetMapping,
          data.image.alt || data.title,
          reporter,
          experienceID
        )

        if (imageRef) {
          experienceDoc.image = imageRef
          log(`  📷 Image: ${data.image.src} -> ${imageRef.asset._ref}`)
        } else {
          log(`  ⚠️  Image not found in assets: ${data.image.src}`)
        }
      } else if (!data?.image || !data.image.src) {
        reporter.recordWarning(experienceID, 'No image provided')
      }

      // Add to transaction
      tx.createOrReplace(experienceDoc)
      reporter.recordSuccess()
      log(`✅ Prepared experience: ${data.title} (ID: ${experienceID})`)

      } catch (err) {
        reporter.recordFailure(dir, err.message)
        error(`❌ Failed to process ${dir}:`, err.message)
      }
    }
    
    // Commit the transaction 
    await tx.commit()
    log(`✅ Successfully migrated ${experiencesDirs.length} experiences to Sanity!`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
