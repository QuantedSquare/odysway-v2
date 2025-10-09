import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import fs from 'node:fs'
import {log} from 'node:console'
import process from 'node:process'

const confirmationFilePath = '../content/confirmation.md'

export default async function migrateConfirmation(client) {
  const reporter = new MigrationReporter('confirmation')

  try {
    log(`🔄 Migrating confirmation from: ${confirmationFilePath}`)

    const markdownContent = fs.readFileSync(confirmationFilePath, 'utf8')

    // Extract content from confirmation-container
    const containerMatch = markdownContent.match(/::confirmation-container\n([\s\S]*?)::/)
    
    if (!containerMatch) {
      throw new Error('No confirmation-container found in markdown')
    }

    const containerContent = containerMatch[1]
    // Extract title_option
    const titleOptionMatch = containerContent.match(/#title_option\n# ([^\n]+)/)
    const titleOption = titleOptionMatch ? titleOptionMatch[1] : ''

    // Extract title_default
    const titleDefaultMatch = containerContent.match(/#title_default\n# ([^\n]+)/)
    const titleDefault = titleDefaultMatch ? titleDefaultMatch[1] : ''

    // Extract error title and message
    const errorTitleMatch = containerContent.match(/#error\n# ([^\n]+)/)
    const errorTitle = errorTitleMatch ? errorTitleMatch[1] : ''
    
    const errorMessageMatch = containerContent.match(/#error\n# [^\n]+\n\n([^#]+)/)
    const errorMessage = errorMessageMatch ? errorMessageMatch[1].trim() : ''

    // Extract accroche_option
    const accrocheOptionMatch = containerContent.match(/#accroche_option\n([^\n]+)/)
    const accrocheOption = accrocheOptionMatch ? accrocheOptionMatch[1] : ''

    // Extract accroche_default
    const accrocheDefaultMatch = containerContent.match(/#accroche_default\n([^\n]+)/)
    const accrocheDefault = accrocheDefaultMatch ? accrocheDefaultMatch[1] : ''

    // Extract accroche_devis
    const accrocheDevisMatch = containerContent.match(/#accroche_devis\n([^\n]+)/)
    const accrocheDevis = accrocheDevisMatch ? accrocheDevisMatch[1] : ''

    const title = 'Page de confirmation'
    const slug = 'confirmation'
    
    const confirmationID = createId('confirmation', slug)
    const confirmationDoc = {
      _id: confirmationID,
      _type: 'confirmation',
      title: title,
      slug: {
        current: slug
      },
      titleOption: titleOption,
      titleDefault: titleDefault,
      titleError: errorTitle,
      errorMessage: errorMessage,
      accrocheOption: accrocheOption,
      accrocheDefault: accrocheDefault,
      accrocheDevis: accrocheDevis,
    }

    reporter.incrementTotal()
    await client.createOrReplace(confirmationDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated confirmation: ${title} (ID: ${confirmationID})`)

    reporter.finish()
  } catch (err) {
    log('❌ Error during confirmation migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
