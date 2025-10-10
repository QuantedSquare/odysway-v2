import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import fs from 'node:fs'
import {log, error} from 'node:console'
import process from 'node:process'
import {basename} from 'node:path'

const faqFilePath = '../content/faq.md'

export default async function migrateFaq(client) {
  const reporter = new MigrationReporter('faq')

  try {
    log(`🔄 Migrating FAQ page from: ${faqFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(faqFilePath, 'utf8')

    const slug = 'faq'

    // Extract title and background image
    const title = await extractTitle(markdownContent)
    const backgroundImage = await extractBackgroundImage(markdownContent, assetMapping, reporter)

    // Extract FAQ items
    const faqItems = await extractFaqItems(markdownContent, assetMapping, reporter)

    const faqID = createId('faq', slug)
    const faqDoc = {
      _id: faqID,
      _type: 'faq',
      title: title,
      backgroundImage: backgroundImage,
      faqItems: faqItems,
    }

    reporter.incrementTotal()
    await client.createOrReplace(faqDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated FAQ: ${title} (ID: ${faqID})`)

    reporter.finish()
  } catch (err) {
    error('❌ Error during FAQ page migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

async function extractTitle(markdownContent) {
  // Extract title from title-container-h1
  const titleMatch = markdownContent.match(/#section-title\s*:::title-container-h1\s*#title\s*([^\n]+)/)
  return titleMatch ? titleMatch[1].trim() : 'Questions fréquentes'
}

async function extractBackgroundImage(markdownContent, assetMapping, reporter) {
  // Extract background image from faq-container
  const backgroundImageMatch = markdownContent.match(/::faq-container\s*---\s*backgroundImage:\s*([^\n]+)/)
  
  if (backgroundImageMatch) {
    const imageSrc = backgroundImageMatch[1].trim()
    return convertImageReference(
      basename(imageSrc),
      assetMapping,
      'FAQ Background',
      reporter,
      'faq-background',
    )
  }
  
  return null
}

async function extractFaqItems(markdownContent, assetMapping, reporter) {
  const faqItems = []
  
  // Extract all question-panel blocks
  const questionPanelRegex = /:::question-panel\s*---\s*hide:\s*([^\n]+)\s*---\s*#question\s*([\s\S]*?)\s*#answer\s*([\s\S]*?)\s*:::/g
  
  let match
  let index = 0
  
  while ((match = questionPanelRegex.exec(markdownContent)) !== null) {
    const [, hideStr, question, answer] = match
    const hide = hideStr.trim() === 'true'
    
    // Convert answer to Portable Text
    const answerPortableText = await convertMarkdownToPortableText(answer.trim(), assetMapping)
    
    faqItems.push({
      _key: `faq-item-${index}`,
      question: question.trim(),
      answer: answerPortableText,
      hide: hide,
    })
    
    index++
  }
  
  log(`📋 Extracted ${faqItems.length} FAQ items`)
  return faqItems
}
