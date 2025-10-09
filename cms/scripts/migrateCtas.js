import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const ctasFilePath = '../content/textes/fr/ctas.json'

export default async function migrateCtas(client) {
  // Create reporter
  const reporter = new MigrationReporter('ctas')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting CTAs migration...`)

    // Read CTAs JSON file
    const data = JSON.parse(fs.readFileSync(ctasFilePath, 'utf8'));
    reporter.incrementTotal()

    // Generate a unique ID for the CTAs document
    const ctasID = createId('ctas', 'configuration')
  
    // Prepare the CTAs document for Sanity
    const ctasDoc = {
      _id: ctasID,
      _type: 'ctas',
      faqSection: {
        ctaCard: {
          title: data.faqSection.ctaCard.title,
          subtitle: data.faqSection.ctaCard.subtitle,
          button: {
            text: data.faqSection.ctaCard.button.text,
            to: data.faqSection.ctaCard.button.to
          }
        },
        faqHomeSubText: {
          question: data.faqSection.faqHomeSubText.question,
          text: data.faqSection.faqHomeSubText.text,
          linkOnText: data.faqSection.faqHomeSubText.linkOnText,
          subtitle: data.faqSection.faqHomeSubText.subtitle,
          text2: data.faqSection.faqHomeSubText.text2,
          linkOnText2: data.faqSection.faqHomeSubText.linkOnText2
        }
      },
      partenairesSection: {
        title: data.partenairesSection.title,
        subtitle: data.partenairesSection.subtitle
      },
      layoutInfoContainer: {
        title: data.layoutInfoContainer.title,
        subtitle: data.layoutInfoContainer.subtitle
      }
    }
    
    // Handle avatar image
    if (data?.faqSection?.ctaCard?.avatar && data.faqSection.ctaCard.avatar.trim() !== '') {
      const avatarImageRef = convertImageReference(
        data.faqSection.ctaCard.avatar,
        assetMapping,
        'Team Avatar',
        reporter,
        ctasID
      )

      if (avatarImageRef) {
        ctasDoc.faqSection.ctaCard.avatar = avatarImageRef
        log(`  📷 Avatar Image: ${data.faqSection.ctaCard.avatar} -> ${avatarImageRef.asset._ref}`)
      } else {
        log(`  ⚠️  Avatar image not found in assets: ${data.faqSection.ctaCard.avatar}`)
      }
    } else {
      reporter.recordWarning(ctasID, 'No avatar image provided')
    }

    // Create the document in Sanity
    await client.createOrReplace(ctasDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated CTAs configuration (ID: ${ctasID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during CTAs migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
