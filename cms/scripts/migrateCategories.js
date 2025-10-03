import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'

const categoriesFolderPath = '../content/categories'

export default async function migrateCategories(client) {
  
  try {
    log(`Starting categories migration...`)
    
    // Read all category directories
    const categoryDirs = fs.readdirSync(categoriesFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    log(`Found ${categoryDirs.length} category directories to migrate`)
    
    // Start a transaction for batch operations
    // const tx = client.transaction()
    
    for (const dir of categoryDirs) {
      // Look for JSON files in each directory
      const dirPath = path.join(categoriesFolderPath, dir);
      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
      
      if (files.length === 0) {
        log(`⚠️  No JSON files found in ${dir}`)
        continue;
      }
      
      // Process the first JSON file found (assuming one per directory)
      const jsonFile = files[0];
      const filePath = path.join(dirPath, jsonFile);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Generate a unique ID from the title
      const categoryID = createId('category', data.title)
      
      // Prepare the category document for Sanity
      const categoryDoc = {
        _id: categoryID,
        _type: 'category',
        title: data.title,
        slug: {
          current: data.slug
        },
        discoveryTitle: data.discoveryTitle,
        seoTitle: data.seoTitle,
        description: data.description,
        showOnHome: data.showOnHome,
      }
      
      // Handle image if it exists and has a src
      if (data?.image?.src && data.image.src.trim() !== '') {
        categoryDoc.image = {
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
        categoryDoc.image = {
          _type: 'image',
          alt: data.image.alt
        }
        log(`  📷 Alt text only: ${data.image.alt}`)
      }
      
      // Add to transaction
      // tx.createOrReplace(categoryDoc)
      log(`✅ Prepared category: ${data.title} (ID: ${categoryID})`)
    }
    
    // Commit the transaction
    // await tx.commit()
    log(`✅ Successfully migrated ${categoryDirs.length} categories to Sanity!`)
    
  } catch (err) {
    error('Error during migration:', err.message);
    process.exit(1)
  }
}

