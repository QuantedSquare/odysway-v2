import fs from 'node:fs'
import {log, error} from 'node:console'
import process from 'node:process'
import {createId} from './utils/createId.js'
import {buildImageAssetMapping} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'

const legalMentionsFilePath = '../content/mentions-legales.md'

export default async function migrateLegalMentions(client) {
  const reporter = new MigrationReporter('legal-mentions')

  try {
    log(`🔄 Migrating legal mentions from: ${legalMentionsFilePath}`)

    // Build image asset mapping (even though legal mentions might not have images)
    const assetMapping = await buildImageAssetMapping(client)

    // Read the markdown file
    const markdownContent = fs.readFileSync(legalMentionsFilePath, 'utf8')

    // Extract title from markdown content
    const title = 'Mentions légales'

    const slug = 'mentions-legales'
    
    // Convert markdown to portable text
    log(`📝 Converting markdown to portable text...`)
    const body = await convertMarkdownToPortableText(markdownContent, assetMapping)
    
    if (!body || body.length === 0) {
      reporter.recordWarning('content-conversion', 'No content blocks generated from markdown')
      log(`⚠️  No content blocks generated from markdown`)
    } else {
      // Create the legal mentions document
      const legalMentionsID = createId('legalMentions', slug)
      const legalMentionsDoc = {
        _id: legalMentionsID,
        _type: 'legalMentions',
        title: title,
        slug: {
          current: slug
        },
        body: body,
      }
      
      reporter.incrementTotal()
      await client.createOrReplace(legalMentionsDoc)
      reporter.recordSuccess()
      
      log(`✅ Successfully migrated legal mentions: ${title} (ID: ${legalMentionsID})`)
      log(`‼️ update manually the bullet points in the legal mentions page`)
    }
    
    // Generate and save report
    reporter.finish()
    
  } catch (err) {
    error('❌ Error migrating legal mentions:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
