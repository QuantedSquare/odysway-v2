import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import {basename} from 'node:path'
import fs from 'node:fs'
import {log} from 'node:console'
import process from 'node:process'

const surMesureFilePath = '../content/sur-mesure.md'

export default async function migrateSurMesure(client) {
  const reporter = new MigrationReporter('sur-mesure')

  try {
    log(`🔄 Migrating sur mesure from: ${surMesureFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(surMesureFilePath, 'utf8')

    const title = 'Un voyage sur mesure, au rythme de vos envies'
    const slug = 'sur-mesure'

    // Extract hero section
    const heroMatch = markdownContent.match(
      /::hero-section\n---\nimageSrc: ([^\n]+)\n---\n#title\n([^\n]+)\n::/s,
    )
    let heroImageRef = null

    if (heroMatch) {
      const [, heroImageSrc, heroTitle] = heroMatch
      
      if (heroImageSrc) {
        heroImageRef = convertImageReference(
          basename(heroImageSrc),
          assetMapping,
          heroTitle,
          reporter,
          'sur-mesure-hero',
        )
      }
    } else {
      reporter.recordWarning('hero-section', 'Hero section not found or malformed.')
    }

    // Extract content between section-container and end
    const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)\n::\s*$/)
    let contentMarkdown = ''

    if (contentMatch) {
      contentMarkdown = contentMatch[1].trim()
    }

    // Extract CTA button using the same pattern as other migrations
    const ctaButtonMatch = contentMarkdown.match(/:::cta-button[\s\S]*?external:\s*([^\n]+)[\s\S]*?link:\s*([^\n]+)[\s\S]*?#text\s*\n([^\n]+)[\s\S]*?:::/)
    let ctaButton = null

    if (ctaButtonMatch) {
      const [, external, link, text] = ctaButtonMatch
      ctaButton = {
        text: text ? text.trim() : '',
        link: link ? link.trim() : '',
        external: external ? external.trim() === 'true' : false,
      }
      log(`📋 Extracted CTA button: "${text ? text.trim() : ''}"`)
    } else {
      reporter.recordWarning('cta-button', 'CTA button not found or malformed.')
    }

    // Remove CTA button from content before processing
    const cleanContent = contentMarkdown.replace(/:::cta-button[\s\S]*?:::/g, '').trim()

    // Process content using the existing markdown to portable text converter
    const content = await convertMarkdownToPortableText(cleanContent, assetMapping)

    if (!content || content.length === 0) {
      reporter.recordWarning('content-conversion', 'No content blocks generated from markdown')
      log(`⚠️  No content blocks generated from markdown`)
    } else {
      const surMesureID = createId('surMesure', slug)
      const surMesureDoc = {
        _id: surMesureID,
        _type: 'surMesure',
        title: title,
        slug: {
          current: slug,
        },
        heroImage: heroImageRef,
        content: content,
        ctaButton: ctaButton,
      }

      reporter.incrementTotal()
      await client.createOrReplace(surMesureDoc)
      reporter.recordSuccess()
      log(`✅ Successfully migrated sur mesure: ${title} (ID: ${surMesureID})`)
    }

    reporter.finish()
  } catch (err) {
    log('❌ Error during sur mesure migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}
