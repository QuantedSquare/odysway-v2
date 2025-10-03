import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {MigrationReporter} from './migrationReporter.js'

const continentsFolderPath = '../content/continents'

export default async function migrateRegions(client) {
  // Create reporter
  const reporter = new MigrationReporter('regions')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)
  
  try {
    log(`Starting region migration...`)
    
    // Read all continent files
    const folderContent = fs.readdirSync(continentsFolderPath);
    const jsonFiles = folderContent.filter(file => file.endsWith('.json'))
    
    log(`Found ${jsonFiles.length} region files to migrate`)
    
    // Start a transaction for batch operations
    const tx =  client.transaction()
    
    for (const file of jsonFiles) {
      reporter.incrementTotal()

      try {
        const filePath = path.join(continentsFolderPath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Generate a unique ID from the filename (without extension)
        const regionId = `region-${data.nom.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

        // Prepare the region document for Sanity
        const regionDoc = {
          _id: regionId,
          _type: 'region',
          nom: data.nom,
          meta_description: data.meta_description,
          slug: {
            current: data.slug
          },
          interjection: data.interjection,
        }

        // Handle image if it exists and has a src
        if (data.image && data.image.src && data.image.src.trim() !== '') {
          const imageRef = convertImageReference(
            data.image.src,
            assetMapping,
            data.image.alt || data.nom,
            reporter,
            regionId
          )

          if (imageRef) {
            regionDoc.image = imageRef
            log(`  📷 Image: ${data.image.src} -> ${imageRef.asset._ref}`)
          } else {
            log(`  ⚠️  Image not found in assets: ${data.image.src}`)
          }
        } else if (!data.image || !data.image.src) {
          reporter.recordWarning(regionId, 'No image provided')
        }

        // Add to transaction
        tx.createOrReplace(regionDoc)
        reporter.recordSuccess()
        log(`${ '✅ Prepared'} region: ${data.nom} (ID: ${regionId})`)
      } catch (err) {
        reporter.recordFailure(file, err.message)
        error(`❌ Failed to process ${file}:`, err.message)
      }
    }
    
    // Commit the transaction
    await tx.commit()
    log(`✅ Successfully migrated ${jsonFiles.length} regions to Sanity!`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during migration:', err.message);
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

