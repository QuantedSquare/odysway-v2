import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'

const topsFolderPath = '../content/tops'

export default async function migrateTops(client) {
  
  try {
    log(`Starting tops migration...`)
    
    // Read all tops files
    const folderContent = fs.readdirSync(topsFolderPath);
    
    log(`Found ${folderContent.length} tops files to migrate`)
    
    // Start a transaction for batch operations
    const tx = client.transaction()
    
    for (const file of folderContent) {
      const filePath = path.join(topsFolderPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Generate a unique ID from the filename (without extension)
      const topID = `tops-${data.title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      
      // Process contenuOnglet
      const processedContenuOnglet = data.contenuOnglet.map((tab, index) => {
        const processedOnglet = {
          _key: `tab-${index}`,
          title: tab.title || '',
          linksList: tab.linksList.map((link, linkIndex) => ({
            _key: `link-${index}-${linkIndex}`,
            title: link.title,
            slug: link.slug
          }))
        }
        return processedOnglet
      })

      // Prepare the tops document for Sanity
      const topsDoc = {
        _id: topID,
        _type: 'tops',
        title: data.title,
        description: data.description,
        contenuOnglet: processedContenuOnglet,
      }
      
      
      // Add to transaction
      tx.createOrReplace(topsDoc)
      log(`${ '✅ Prepared'} top: ${data.title} (ID: ${topID})`)
      log(`  📋 Processed ContenuOnglet: ${JSON.stringify(processedContenuOnglet, null, 2)}`)
    }
    
    // Commit the transaction
    await tx.commit()
      log(`✅ Successfully migrated ${folderContent.length} tops to Sanity!`)
    
  } catch (err) {
    error('Error during migration:', err.message);
    process.exit(1)
  }
}
