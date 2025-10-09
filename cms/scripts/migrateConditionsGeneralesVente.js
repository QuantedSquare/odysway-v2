import {buildImageAssetMapping} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import fs from 'node:fs'
import {log} from 'node:console'
import process from 'node:process'

const conditionsGeneralesVenteFilePath = '../content/conditions-generales-de-vente.md'

export default async function migrateConditionsGeneralesVente(client) {
  const reporter = new MigrationReporter('conditions-generales-vente')

  try {
    log(`🔄 Migrating conditions générales de vente from: ${conditionsGeneralesVenteFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(conditionsGeneralesVenteFilePath, 'utf8')

    // Extract title from policies-container
    const titleMatch = markdownContent.match(/::policies-container\n#title\n\[([^\]]+)\]\{style="font-weight: bold"\}\n::/)
    const title = titleMatch ? titleMatch[1] : 'Conditions générales de vente'

    const slug = 'conditions-generales-de-vente'
    
    // Extract content between section-container and end
    const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)(?=::|$)/)
    let contentMarkdown = ''
    
    if (contentMatch) {
      contentMarkdown = contentMatch[1].trim()
    }

    // Convert markdown to portable text
    log(`📝 Converting markdown to portable text...`)
    const body = await convertMarkdownToPortableText(contentMarkdown, assetMapping)
    
    if (!body || body.length === 0) {
      reporter.recordWarning('content-conversion', 'No content blocks generated from markdown')
      log(`⚠️  No content blocks generated from markdown`)
    } else {
      const conditionsGeneralesVenteID = createId('conditionsGeneralesVente', slug)
      const conditionsGeneralesVenteDoc = {
        _id: conditionsGeneralesVenteID,
        _type: 'conditionsGeneralesVente',
        title: title,
        slug: {
          current: slug
        },
        body: body,
      }

      reporter.incrementTotal()
      await client.createOrReplace(conditionsGeneralesVenteDoc)
      reporter.recordSuccess()
      log(`✅ Successfully migrated conditions générales de vente: ${title} (ID: ${conditionsGeneralesVenteID})`)
    }

    reporter.finish()
  } catch (err) {
    log('❌ Error during conditions générales de vente migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
