import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import {basename} from 'node:path'
import fs from 'node:fs'
import {log} from 'node:console'
import process from 'node:process'

const offreCadeauFilePath = '../content/offre-cadeau.md'

export default async function migrateOffreCadeau(client) {
  const reporter = new MigrationReporter('offre-cadeau')

  try {
    log(`🔄 Migrating offre cadeau from: ${offreCadeauFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(offreCadeauFilePath, 'utf8')

    const title = 'Offrez le plus beau des cadeaux avec la carte cadeau Odysway !'
    const slug = 'offre-cadeau'

    // Extract hero section
    const heroMatch = markdownContent.match(
      /::fixed-img-hero-section\n---\nimg-src: ([^\n]+)\nimg-src-mobile: ([^\n]+)\n---\n::/s,
    )
    let heroImageRef = null
    let heroImageMobileRef = null

    if (heroMatch) {
      const [, heroImageSrc, heroImageMobileSrc] = heroMatch
      
      if (heroImageSrc) {
        heroImageRef = convertImageReference(
          basename(heroImageSrc),
          assetMapping,
          'Hero image desktop',
          reporter,
          'offre-cadeau-hero',
        )
      }
      
      if (heroImageMobileSrc) {
        heroImageMobileRef = convertImageReference(
          basename(heroImageMobileSrc),
          assetMapping,
          'Hero image mobile',
          reporter,
          'offre-cadeau-hero-mobile',
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

    // Extract main content (everything before the first :::picto-col)
    const mainContentMatch = contentMarkdown.match(/^([\s\S]*?)(?=:::picto-col)/)
    let mainContentMarkdown = mainContentMatch ? mainContentMatch[1].trim() : contentMarkdown

    // Extract "Comment ça marche ?" title and remove it from main content
    const howItWorksTitle = 'Comment ça marche ?'
    const howItWorksRegex = /^# Comment ça marche \?\s*\n/
    if (howItWorksRegex.test(mainContentMarkdown)) {
      mainContentMarkdown = mainContentMarkdown.replace(howItWorksRegex, '')
    }

    // Extract all picto-col elements
    const pictoCols = await extractPictoCols(contentMarkdown, assetMapping, reporter)

    // Process main content as markdown
    const mainContent = await convertMarkdownToPortableText(mainContentMarkdown, assetMapping)

    if (!mainContent || mainContent.length === 0) {
      reporter.recordWarning('content-conversion', 'No main content blocks generated from markdown')
      log(`⚠️  No main content blocks generated from markdown`)
    } else {
      const offreCadeauID = createId('offreCadeau', slug)
      const offreCadeauDoc = {
        _id: offreCadeauID,
        _type: 'offreCadeau',
        title: title,
        slug: {
          current: slug,
        },
        heroImage: heroImageRef,
        heroImageMobile: heroImageMobileRef,
        mainContent: mainContent,
        howItWorksTitle: howItWorksTitle,
        pictoCols: pictoCols,
      }

      reporter.incrementTotal()
      await client.createOrReplace(offreCadeauDoc)
      reporter.recordSuccess()
      log(`✅ Successfully migrated offre cadeau: ${title} (ID: ${offreCadeauID})`)
    }

    reporter.finish()
  } catch (err) {
    log('❌ Error during offre cadeau migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

async function extractPictoCols(content, assetMapping, reporter) {
  const pictoCols = []
  
  log(`📋 Extracting picto-cols from content with length: ${content.length}`)
  
  // Find all :::picto-col blocks
  const pictoRegex = /:::picto-col\s*\n---\s*\nimg-src:\s*([^\n]+)\s*\n---\s*\n#text\s*\n([^\n]+)\s*\n:::/g
  let match
  
  while ((match = pictoRegex.exec(content)) !== null) {
    const [, imageSrc, text] = match
    log(`📋 Picto match found - imageSrc: "${imageSrc}", text: "${text}"`)
    
    const imageRef = convertImageReference(
      basename(imageSrc),
      assetMapping,
      text,
      reporter,
      'offre-cadeau-picto',
    )
    
    if (imageRef) {
      pictoCols.push({
        _type: 'pictoCol',
        _key: `picto-${Math.random().toString(36).substr(2, 9)}`,
        image: imageRef,
        text: text ? text.trim() : '',
      })
      log(`📋 Added picto-col: "${text ? text.trim() : ''}"`)
    } else {
      log(`📋 Image reference was null, skipping picto-col`)
    }
  }
  
  log(`📋 Extracted ${pictoCols.length} picto-cols`)
  return pictoCols
}
