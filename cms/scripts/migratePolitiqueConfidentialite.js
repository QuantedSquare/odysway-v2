import fs from 'node:fs'
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import {createId} from './utils/createId.js'
import {buildImageAssetMapping} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'

const politiqueFilePath = '../content/politique-de-confidentialite.md'

export default async function migratePolitiqueConfidentialite(client) {
  const reporter = new MigrationReporter('privacy-policy')

  try {
    log(`🔄 Migrating politique de confidentialité from: ${politiqueFilePath}`)

    // Build image asset mapping (even though privacy policy might not have images)
    const assetMapping = await buildImageAssetMapping(client)

    // Read the markdown file
    const markdownContent = fs.readFileSync(politiqueFilePath, 'utf8')

    // Extract title from markdown content (e.g., [Politique de confidentialité]{style="font-weight: bold"})
    const title = 'Politique de confidentialité'

    const slug = path.basename(politiqueFilePath, '.md')
    
    // Convert markdown to portable text
    log(`📝 Converting markdown to portable text...`)
    const body = await convertMarkdownToPortableText(markdownContent, assetMapping)
    
    // Add a bold title as the first block if we have content
    if (body && body.length > 0) {
      // Create a bold title block
      const titleBlock = {
        _type: 'block',
        _key: `title-${Date.now()}`,
        style: 'h1',
        children: [
          {
            _type: 'span',
            marks: ['strong'],
            text: title
          }
        ],
        markDefs: []
      }
      
      // Insert the title block at the beginning
      body.unshift(titleBlock)
      log(`✅ Added bold title block: "${title}"`)
    }
    
    if (!body || body.length === 0) {
      reporter.recordWarning('content-conversion', 'No content blocks generated from markdown')
      log(`⚠️  No content blocks generated from markdown`)
    } else {
      log(`✅ Converted ${body.length} content blocks`)
    }
    
    // Create the privacy policy document
    const privacyPolicyID = createId('privacyPolicy', slug)
    const privacyPolicyDoc = {
      _id: privacyPolicyID,
      _type: 'privacyPolicy',
      title: title,
      slug: {
        current: slug
      },
      body: body || []
    }
    
    reporter.incrementTotal()
    await client.createOrReplace(privacyPolicyDoc)
    reporter.recordSuccess()
    
    log(`✅ Successfully migrated politique de confidentialité: ${title} (ID: ${privacyPolicyID})`)
    
    // Generate and save report
    reporter.finish()
    
  } catch (err) {
    error('❌ Error migrating politique de confidentialité:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
