import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import fs from 'node:fs'
import {log, error} from 'node:console'
import process from 'node:process'
import {basename} from 'node:path'

const entrepriseFilePath = '../content/entreprise.md'

export default async function migrateEntreprise(client) {
  const reporter = new MigrationReporter('entreprise')

  try {
    log(`🔄 Migrating entreprise page from: ${entrepriseFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(entrepriseFilePath, 'utf8')

    const slug = 'entreprise'

    // Extract hero section
    const heroSection = await extractHeroSection(markdownContent, assetMapping, reporter)

    // Extract content blocks
    const contentBlock1 = await extractContentBlock1(markdownContent, assetMapping, reporter)
    const contentBlock2 = await extractContentBlock2(markdownContent, assetMapping, reporter)
    const contentBlock3 = await extractContentBlock3(markdownContent, assetMapping, reporter)
    const contentBlock4 = await extractContentBlock4(markdownContent, assetMapping, reporter)
    const contentBlock5 = await extractContentBlock5(markdownContent, assetMapping, reporter)

    // Extract CTA button (single, since all are the same)
    const ctaButton = await extractCTAButton(markdownContent)

    const entrepriseID = createId('entreprise', slug)
    const entrepriseDoc = {
      _id: entrepriseID,
      _type: 'entreprise',
      heroSection: heroSection,
      contentBlock1: contentBlock1,
      contentBlock2: contentBlock2,
      contentBlock3: contentBlock3,
      contentBlock4: contentBlock4,
      contentBlock5: contentBlock5,
      ctaButton: ctaButton,
    }

    reporter.incrementTotal()
    await client.createOrReplace(entrepriseDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated entreprise: ${heroSection.title} (ID: ${entrepriseID})`)

    reporter.finish()
  } catch (err) {
    error('❌ Error during entreprise page migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

async function extractHeroSection(markdownContent, assetMapping, reporter) {
  const heroSectionMatch = markdownContent.match(/::hero-section\n---\nimage-src:\s*([^\n]+)\n---\n#title\n([^\n]+)\n::/)
  
  if (heroSectionMatch) {
    const [, imageSrc, title] = heroSectionMatch
    const heroImageRef = convertImageReference(
      basename(imageSrc),
      assetMapping,
      title.trim(),
      reporter,
      'entreprise-hero',
    )

    return {
      image: heroImageRef,
      title: title.trim(),
    }
  } else {
    reporter.recordWarning('hero-section', 'Hero section not found')
    return {
      title: 'Tribus par Odysway',
    }
  }
}

async function extractContentBlock1(markdownContent, assetMapping, reporter) {
  const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)\n::/)
  if (!contentMatch) {
    reporter.recordWarning('content', 'Section container not found')
    return []
  }

  const content = contentMatch[1]
  
  // Block 1: "Des expériences uniques pour votre entreprise"
  const block1Match = content.match(/\*\*Des expériences uniques pour votre entreprise : découvrez nos séminaires et voyages Tribus\*\*\n\n([\s\S]*?)(?=\*\*Séminaires d'entreprise sur mesure)/)
  if (block1Match) {
    const title = '**Des expériences uniques pour votre entreprise : découvrez nos séminaires et voyages Tribus**'
    const blockContent = block1Match[1].trim()
    // Remove CTA button from content
    const cleanContent = blockContent.replace(/:::cta-button[\s\S]*?:::/g, '').trim()
    const fullContent = `${title}\n\n${cleanContent}`
    return await convertMarkdownToPortableText(fullContent, assetMapping)
  }
  
  return []
}

async function extractContentBlock2(markdownContent, assetMapping, reporter) {
  const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)\n::/)
  if (!contentMatch) {
    return []
  }

  const content = contentMatch[1]
  
  // Block 2: "Séminaires d'entreprise sur mesure"
  const block2Match = content.match(/\*\*Séminaires d'entreprise sur mesure : Renforcez votre équipe et développez vos compétences !\*\*\n\n([\s\S]*?)(?=\*\*Voyages d'entreprise exclusifs)/)
  if (block2Match) {
    const title = '**Séminaires d\'entreprise sur mesure : Renforcez votre équipe et développez vos compétences !**'
    const blockContent = block2Match[1].trim()
    // Remove CTA button from content but keep images
    const cleanContent = blockContent.replace(/:::cta-button[\s\S]*?:::/g, '').trim()
    const fullContent = `${title}\n\n${cleanContent}`
    return await convertMarkdownToPortableText(fullContent, assetMapping)
  }
  
  return []
}

async function extractContentBlock3(markdownContent, assetMapping, reporter) {
  const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)\n::/)
  if (!contentMatch) {
    return []
  }

  const content = contentMatch[1]
  
  // Block 3: "Voyages d'entreprise exclusifs"
  const block3Match = content.match(/\*\*Voyages d'entreprise exclusifs : Explorez la France et l'Europe tout en renforçant vos liens professionnels !\*\*\n\n([\s\S]*?)(?=\*\*Une offre d'évènements)/)
  if (block3Match) {
    const title = '**Voyages d\'entreprise exclusifs : Explorez la France et l\'Europe tout en renforçant vos liens professionnels !**'
    const blockContent = block3Match[1].trim()
    // Remove CTA button from content
    const cleanContent = blockContent.replace(/:::cta-button[\s\S]*?:::/g, '').trim()
    const fullContent = `${title}\n\n${cleanContent}`
    return await convertMarkdownToPortableText(fullContent, assetMapping)
  }
  
  return []
}

async function extractContentBlock4(markdownContent, assetMapping, reporter) {
  const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)\n::/)
  if (!contentMatch) {
    return []
  }

  const content = contentMatch[1]
  
  // Block 4: "Une offre d'évènements et de voyages responsables"
  const block4Match = content.match(/\*\*Une offre d'évènements et de voyages responsables pour votre entreprise\*\*\n\n([\s\S]*?)(?=\*\*Des clients satisfaits)/)
  if (block4Match) {
    const title = '**Une offre d\'évènements et de voyages responsables pour votre entreprise**'
    const blockContent = block4Match[1].trim()
    // Remove CTA button from content but keep images
    const cleanContent = blockContent.replace(/:::cta-button[\s\S]*?:::/g, '').trim()
    const fullContent = `${title}\n\n${cleanContent}`
    return await convertMarkdownToPortableText(fullContent, assetMapping)
  }
  
  return []
}

async function extractContentBlock5(markdownContent, assetMapping, reporter) {
  const contentMatch = markdownContent.match(/::section-container\n#content\n([\s\S]*?)\n::/)
  if (!contentMatch) {
    return []
  }

  const content = contentMatch[1]
  
  // Block 5: "Des clients satisfaits témoignent"
  const block5Match = content.match(/\*\*Des clients satisfaits témoignent de leur expérience avec Tribus : Découvrez leurs événements\*\*\n\n([\s\S]*?)(?=:::cta-button|$)/)
  if (block5Match) {
    const title = '**Des clients satisfaits témoignent de leur expérience avec Tribus : Découvrez leurs événements**'
    const blockContent = block5Match[1].trim()
    // Remove CTA button from content
    const cleanContent = blockContent.replace(/:::cta-button[\s\S]*?:::/g, '').trim()
    const fullContent = `${title}\n\n${cleanContent}`
    return await convertMarkdownToPortableText(fullContent, assetMapping)
  }
  
  return []
}

async function extractCTAButton(markdownContent) {
  // Find the first CTA button (since all are the same)
  const ctaButtonMatch = markdownContent.match(/:::cta-button\s*\n---\s*\nexternal:\s*([^\n]+)\s*\nlink:\s*([^\n]+)\s*\n---\s*\n#text\s*\n([^\n]+)\s*\n:::/)
  
  if (ctaButtonMatch) {
    const [, external, link, text] = ctaButtonMatch
    return {
      text: text.trim(),
      link: link.trim(),
      external: external.trim() === 'true',
    }
  }
  
  // Default CTA button
  return {
    text: 'Découvrir Tribus',
    link: 'https://tribus-seminaires.com/',
    external: true,
  }
}
