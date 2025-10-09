import {buildImageAssetMapping} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import {basename} from 'node:path'
import fs from 'node:fs'
import {log} from 'node:console'
import {convertImageReference} from './imageAssetHelper.js'
import process from 'node:process'

const chequesVacancesFilePath = '../content/cheques-vacances.md'

export default async function migrateChequesVacances(client) {
  const reporter = new MigrationReporter('cheques-vacances')

  try {
    log(`🔄 Migrating chèques-vacances from: ${chequesVacancesFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(chequesVacancesFilePath, 'utf8')

    // Extract hero section
    const heroMatch = markdownContent.match(/::hero-section\n---\nimageSrc: ([^\n]+)\n---\n#title\n([^\n]+)\n::/s)
    let heroImageRef = null
    let heroTitle = null

    if (heroMatch) {
      const [, heroImageSrc, title] = heroMatch
      heroTitle = title.trim()
      
      if (heroImageSrc) {
        heroImageRef = convertImageReference(
          basename(heroImageSrc),
          assetMapping,
          heroTitle,
          reporter,
          'cheques-vacances-hero'
        )
      }
    }

    // Extract CTA button
    const ctaMatch = markdownContent.match(/::cta-button\n---\nlink: ([^\n]+)\n---\n#text\n([^\n]+)\n::/s)
    let ctaButton = null
    
    if (ctaMatch) {
      const [, link, text] = ctaMatch
      ctaButton = {
        text: text.trim(),
        link: `https://odysway.com/${link.trim()}`
      }
    }

    // Extract content between section-container and cta-button
    const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)(?=::cta-button|$)/)
    let contentMarkdown = ''
    
    if (contentMatch) {
      contentMarkdown = contentMatch[1].trim()
    }

    const title = 'Réservez votre voyage avec vos Chèques-Vacances'
    const slug = 'cheques-vacances'
    
    // Convert markdown to portable text
    log(`📝 Converting markdown to portable text...`)
    const body = await convertMarkdownToPortableText(contentMarkdown, assetMapping)
    
    if (!body || body.length === 0) {
      reporter.recordWarning('content-conversion', 'No content blocks generated from markdown')
      log(`⚠️  No content blocks generated from markdown`)
    } else {
      const chequesVacancesID = createId('chequesVacances', slug)
      const chequesVacancesDoc = {
        _id: chequesVacancesID,
        _type: 'chequesVacances',
        title: title,
        slug: {
          current: slug
        },
        heroImage: heroImageRef,
        content: body,
        ctaButton: ctaButton,
      }

      reporter.incrementTotal()
      await client.createOrReplace(chequesVacancesDoc)
      reporter.recordSuccess()
      log(`✅ Successfully migrated chèques-vacances: ${title} (ID: ${chequesVacancesID})`)
    }

    reporter.finish()
  } catch (err) {
    log('❌ Error during chèques-vacances migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
