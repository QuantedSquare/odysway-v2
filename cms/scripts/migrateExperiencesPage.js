import fs from 'node:fs';
import {log, error} from 'node:console'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { MigrationReporter } from './migrationReporter.js'

const experiencesFilePath = '../content/textes/fr/experiences.json'

export default async function migrateExperiencesPage(client) {
  // Create reporter
  const reporter = new MigrationReporter('experiences-page')

  try {
    log(`Starting experiences page migration...`)

    // Read experiences JSON file
    const data = JSON.parse(fs.readFileSync(experiencesFilePath, 'utf8'));
    reporter.incrementTotal()

    // Generate a unique ID for the experiences document
    const experiencesID = createId('experiences', 'page')
  
    // Prepare the experiences document for Sanity
    const experiencesDoc = {
      _id: experiencesID,
      _type: 'page_experiences',
      index: {
        pageTitle: data.index.pageTitle,
        metaDescription: data.index.metaDescription
      },
      slug: {
        noVoyagesFound: data.slug.noVoyagesFound,
        modifySearchCriteria: data.slug.modifySearchCriteria
      },
      common: {
        expandButton: {
          showMore: data.common.expandButton.showMore,
          showLess: data.common.expandButton.showLess
        }
      }
    }

    // Create the document in Sanity
    await client.createOrReplace(experiencesDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated experiences page configuration (ID: ${experiencesID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during experiences page migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
