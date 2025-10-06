import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const teamFolderPath = '../content/team'

export default async function migrateTeam(client) {
  // Create reporter
  const reporter = new MigrationReporter('team')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting team migration...`)

    // Read all team JSON files
    const teamFiles = fs.readdirSync(teamFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
      .map(dirent => dirent.name);

    log(`Found ${teamFiles.length} team member files to migrate`)

    // Start a transaction for batch operations
    const tx = client.transaction()
    
    for (const file of teamFiles) {
      reporter.incrementTotal()

      try {
        const filePath = path.join(teamFolderPath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Generate a unique ID from the slug
        const teamMemberID = createId('teamMember', data.slug)
      
        // Prepare the team member document for Sanity
        const teamMemberDoc = {
          _id: teamMemberID,
          _type: 'teamMember',
          slug: {
            current: data.slug
          },
          name: data.name,
          description: data.description || '',
          linkedin: data.linkedin || '',
          position: data.position || '',
        }
        
        // Handle image if it exists and has a src
        if (data?.image && data.image.trim() !== '') {
          const imageRef = convertImageReference(
            data.image,
            assetMapping,
            data.name || data.slug,
            reporter,
            teamMemberID
          )

          if (imageRef) {
            teamMemberDoc.image = imageRef
            log(`  📷 Image: ${data.image} -> ${imageRef.asset._ref}`)
          } else {
            log(`  ⚠️  Image not found in assets: ${data.image}`)
          }
        } else {
          reporter.recordWarning(teamMemberID, 'No image provided')
        }

        // Add to transaction
        tx.createOrReplace(teamMemberDoc)
        reporter.recordSuccess()
        log(`✅ Prepared team member: ${data.name} (ID: ${teamMemberID})`)

      } catch (err) {
        reporter.recordFailure(file, err.message)
        error(`❌ Failed to process ${file}:`, err.message)
      }
    }
    
    // Commit the transaction 
    await tx.commit()
    log(`✅ Successfully migrated ${teamFiles.length} team members to Sanity!`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
