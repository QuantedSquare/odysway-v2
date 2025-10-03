import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'

const destinationsFolderPath = '../content/destinations'

export default async function migrateDestinations(client) {
  
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
      // Look for JSON files in each directory
      const dirPath = path.join(destinationsFolderPath, dir);
      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
      
      if (files.length === 0) {
        log(`⚠️  No JSON files found in ${dir}`)
        continue;
      }
      
      // Process the first JSON file found (assuming one per directory)
      const jsonFile = files[0];
      const filePath = path.join(dirPath, jsonFile);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Generate a unique ID from the slug
      const destinationID = createId('destination', data.title)
      
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
        published: data.published,
        showOnHome: data.showOnHome,
        regions: processedRegions,
        isTopDestination: data.isTopDestination,
      }
      
      // Handle image if it exists and has a src
      if (data?.image?.src && data.image.src.trim() !== '') {
        destinationDoc.image = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: data.image.src
          },
          alt: data.image.alt || data.title
        }
        log(`  📷 Image: ${data.image.src}`)
      } else if (data?.image?.alt) {
        // Store alt text even if no image src
        destinationDoc.image = {
          _type: 'image',
          alt: data.image.alt
        }
        log(`  📷 Alt text only: ${data.image.alt}`)
      }
      
      // Add to transaction
      tx.createOrReplace(destinationDoc)
      log(`✅ Prepared destination: ${data.title} (ID: ${destinationID})`)
      log(`  📋 Regions: ${processedRegions.length} references`)
    }
    
    // Commit the transaction
    await tx.commit()
    log(`✅ Successfully migrated ${destinationDirs.length} destinations to Sanity!`)
    
  } catch (err) {
    error('Error during migration:', err.message);
    process.exit(1)
  }
}

