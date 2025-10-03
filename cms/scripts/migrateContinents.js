import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'

const continentsFolderPath = '../content/continents'

export default async function migrateRegions(client) {
  
  try {
    log(`Starting region migration...`)
    
    // Read all continent files
    const folderContent = fs.readdirSync(continentsFolderPath);
    const jsonFiles = folderContent.filter(file => file.endsWith('.json'))
    
    log(`Found ${jsonFiles.length} region files to migrate`)
    
    // Start a transaction for batch operations
    const tx =  client.transaction()
    
    for (const file of jsonFiles) {
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
        regionDoc.image = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: data.image.src
          },
          alt: data.image.alt || data.nom
        }
        log(`  📷 Image: ${data.image.src}`)
      } else if (data.image && data.image.alt) {
        // Store alt text even if no image src
        regionDoc.image = {
          _type: 'image',
          alt: data.image.alt
        }
        log(`  📷 Alt text only: ${data.image.alt}`)
      }
      
      // Add to transaction
        tx.createOrReplace(regionDoc)
      log(`${ '✅ Prepared'} region: ${data.nom} (ID: ${regionId})`)
    }
    
    // Commit the transaction
      await tx.commit()
      log(`✅ Successfully migrated ${jsonFiles.length} regions to Sanity!`)
    
  } catch (err) {
    error('Error during migration:', err.message);
    process.exit(1)
  }
}

