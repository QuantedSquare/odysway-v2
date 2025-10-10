import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const destinationsFolderPath = '../content/destinations'

export default async function migrateDestinations(client) {
  // Create reporter
  const reporter = new MigrationReporter('destinations')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting destinations migration...`)

    // Read all destination directories
    const destinationDirs = fs.readdirSync(destinationsFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    log(`Found ${destinationDirs.length} destination directories to migrate`)

    // Start a transaction for batch operations
    const tx = client.transaction()
    
    for (const dir of destinationDirs) {
      reporter.incrementTotal()

      try {
        // Look for JSON files in each directory
        const dirPath = path.join(destinationsFolderPath, dir);
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
        const baseID = createId('destination', data.title)
        // Use draft prefix if not published
        const destinationID = data.published === false ? `drafts.${baseID}` : baseID

      // Process regions array to create proper references
      const processedRegions = data.regions ? data.regions.map((region, index) => ({
        _key: `region-${index}`,
        _type: 'reference',
        _ref: createId('region', region.nom)
      })) : []

      // Prepare the destination document for Sanity
      const destinationDoc = {
        _id: destinationID,
        _type: 'destination',
        title: data.title,
        slug: {
          current: data.slug
        },
        chapka: data.chapka,
        iso: data.iso,
        interjection: data.interjection,
        metaDescription: data.metaDescription,
        showOnHome: data.showOnHome,
        regions: processedRegions,
        isTopDestination: data.isTopDestination,
      }
      
      // Handle image if it exists and has a src
      if (data?.image?.src && data.image.src.trim() !== '') {
        const imageRef = convertImageReference(
          data.image.src,
          assetMapping,
          data.image.alt || data.title,
          reporter,
          destinationID
        )

        if (imageRef) {
          destinationDoc.image = imageRef
          log(`  📷 Image: ${data.image.src} -> ${imageRef.asset._ref}`)
        } else {
          log(`  ⚠️  Image not found in assets: ${data.image.src}`)
        }
      } else if (!data?.image || !data.image.src) {
        reporter.recordWarning(destinationID, 'No image provided')
      }

      // Add to transaction
      tx.createOrReplace(destinationDoc)
      reporter.recordSuccess()
      log(`✅ Prepared destination: ${data.title} (ID: ${destinationID})`)
      log(`  📋 Regions: ${processedRegions.length} references`)

      } catch (err) {
        reporter.recordFailure(dir, err.message)
        error(`❌ Failed to process ${dir}:`, err.message)
      }
    }
    
    // Commit the transaction
    await tx.commit()
    log(`✅ Successfully migrated ${destinationDirs.length} destinations to Sanity!`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during migration:', err.message);
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

