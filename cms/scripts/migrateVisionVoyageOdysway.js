import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import fs from 'node:fs'
import {log, error} from 'node:console'
import process from 'node:process'
import {basename} from 'node:path'
import yaml from 'js-yaml'

const visionVoyageOdyswayFilePath = '../content/vision-voyage-odysway.md'

export default async function migrateVisionVoyageOdysway(client) {
  const reporter = new MigrationReporter('vision-voyage-odysway')

  try {
    log(`🔄 Migrating vision voyage odysway page from: ${visionVoyageOdyswayFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(visionVoyageOdyswayFilePath, 'utf8')

    const slug = 'vision-voyage-odysway'

    // 1. Extract page settings from frontmatter
    const pageSettings = await extractPageSettings(markdownContent, assetMapping, reporter)

    // 2. Extract hero section
    const heroSection = await extractHeroSection(markdownContent, assetMapping, reporter)

    // 3. Extract "Prise de conscience" section
    const priseDeConscience = await extractPriseDeConscience(markdownContent, assetMapping, reporter)

    // 4. Extract founder section
    const founderSection = await extractFounderSection(markdownContent, assetMapping, reporter)

    // 5. Extract "Ce que l'on défend" section
    const ceQueOnDefend = await extractCeQueOnDefend(markdownContent, assetMapping, reporter)

    // 6. Extract team section (everything from "Une équipe à taille humaine" onwards)
    const teamSection = await extractTeamSection(markdownContent, assetMapping, reporter)

    const visionVoyageOdyswayID = createId('visionVoyageOdysway', slug)
    const visionVoyageOdyswayDoc = {
      _id: visionVoyageOdyswayID,
      _type: 'visionVoyageOdysway',
      pageSettings: pageSettings,
      heroSection: heroSection,
      priseDeConscience: priseDeConscience,
      founderSection: founderSection,
      ceQueOnDefend: ceQueOnDefend,
      teamSection: teamSection,
    }

    reporter.incrementTotal()
    await client.createOrReplace(visionVoyageOdyswayDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated vision voyage odysway: ${pageSettings.title} (ID: ${visionVoyageOdyswayID})`)

    reporter.finish()
  } catch (err) {
    error('❌ Error during vision voyage odysway page migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

async function extractPageSettings(markdownContent, assetMapping, reporter) {
  const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---\n/)
  let pageSettings = {
    title: 'Notre vision du voyage',
    description: '',
    seo: {
      title: 'Vision d\'Odysway',
      description: '',
      robots: 'index, follow',
    },
    sitemap: {},
    ogImage: {},
    head: {
      htmlAttrs: { lang: 'fr' },
      script: [],
    },
  }

  if (frontmatterMatch) {
    try {
      const frontmatter = yaml.load(frontmatterMatch[1])
      
      // Basic page info
      pageSettings.title = frontmatter.title || 'Notre vision du voyage'
      pageSettings.description = frontmatter.description || ''

      // SEO settings
      if (frontmatter.seo) {
        pageSettings.seo = {
          title: frontmatter.seo.title || frontmatter.title || 'Vision d\'Odysway',
          description: frontmatter.seo.description || frontmatter.description || '',
          robots: frontmatter.robots || 'index, follow',
        }
      }


      // Sitemap settings
      if (frontmatter.sitemap) {
        pageSettings.sitemap = {
          lastmod: frontmatter.sitemap.lastmod || '',
          videos: frontmatter.sitemap.videos || [],
          images: frontmatter.sitemap.images || [],
        }
      }

      // OG Image settings
      if (frontmatter.ogImage) {
        let ogImageRef = null
        if (frontmatter.ogImage.props?.image) {
          ogImageRef = convertImageReference(
            basename(frontmatter.ogImage.props.image),
            assetMapping,
            frontmatter.ogImage.props.title || 'OG Image',
            reporter,
            'vision-og-image',
          )
        }
        
        pageSettings.ogImage = {
          component: frontmatter.ogImage.component || 'default',
          props: {
            title: frontmatter.ogImage.props?.title || '',
            description: frontmatter.ogImage.props?.description || '',
            image: ogImageRef,
          },
        }
      }

      // Head settings
      if (frontmatter.head) {
        pageSettings.head = {
          htmlAttrs: frontmatter.head.htmlAttrs || { lang: 'fr' },
          script: frontmatter.head.script || [],
        }
      }

    } catch (err) {
      reporter.recordWarning('frontmatter', 'Error parsing frontmatter: ' + err.message)
    }
  } else {
    reporter.recordWarning('frontmatter', 'Frontmatter not found')
  }

  return pageSettings
}

async function extractHeroSection(markdownContent, assetMapping, reporter) {
  const heroSectionMatch = markdownContent.match(/::simple-hero-section\n---\ndisplayed-img:\s*([^\n]+)\ntitle-color:\s*([^\n]+)\n---\n#title\n([^\n]+)\n::/)
  
  if (heroSectionMatch) {
    const [, imageSrc, titleColor, title] = heroSectionMatch
    const heroImageRef = convertImageReference(
      basename(imageSrc),
      assetMapping,
      title,
      reporter,
      'vision-hero',
    )

    return {
      image: heroImageRef,
      title: title.trim(),
      titleColor: titleColor.trim(),
    }
  } else {
    reporter.recordWarning('hero-section', 'Hero section not found')
    return {
      title: 'Notre vision du voyage',
      titleColor: 'white',
    }
  }
}

async function extractPriseDeConscience(markdownContent, assetMapping, reporter) {
  // Extract the "La prise de conscience" section including the title
  const priseDeConscienceMatch = markdownContent.match(/::title-container-h2\n#subtitle\n\*\*La prise de conscience\*\*\n::\s*\n::text-container\n#text\n([\s\S]*?)(?=::concept-container)/)
  
  if (priseDeConscienceMatch) {
    const contentMarkdown = priseDeConscienceMatch[1].trim()
    log(`📋 Found "Prise de conscience" content: ${contentMarkdown.substring(0, 100)}...`)
    
    // Add the title as a markdown heading
    const titleMarkdown = '## La prise de conscience\n\n'
    const fullContentMarkdown = titleMarkdown + contentMarkdown
    
    // Convert :br to paragraph breaks
    const processedMarkdown = fullContentMarkdown.replace(/:br/g, '\n\n')
    const content = await convertMarkdownToPortableText(processedMarkdown, assetMapping)
    
    return {
      content: content,
    }
  } else {
    reporter.recordWarning('prise-de-conscience', 'Prise de conscience section not found')
    return {
      content: [],
    }
  }
}

async function extractFounderSection(markdownContent, assetMapping, reporter) {
  // Extract the founder section from concept-container
  const founderMatch = markdownContent.match(/::concept-container\n---\nimage-src:\s*([^\n]+)\n---\n#founder\n([^\n]+)\n::/)
  
  if (founderMatch) {
    const [, imageSrc, founderName] = founderMatch
    log(`📋 Found founder image: "${imageSrc}"`)
    
    let founderImageRef = null
    const imageSrcClean = imageSrc.trim()
    const imageBasename = basename(imageSrcClean)
    
    founderImageRef = convertImageReference(
      imageBasename,
      assetMapping,
      founderName,
      reporter,
      'vision-founder',
    )
    
    return {
      image: founderImageRef,
      caption: founderName.trim(),
    }
  } else {
    reporter.recordWarning('founder-section', 'Founder section not found')
    return {
      caption: 'Romain, fondateur d\'Odysway',
    }
  }
}

async function extractCeQueOnDefend(markdownContent, assetMapping, reporter) {
  // Extract "Ce que l'on défend" section including the title
  const ceQueOnDefendMatch = markdownContent.match(/::title-container-h2\n#subtitle\n\*\*Ce que l'on défend\*\*\n::\s*\n::text-container\n#text\n([\s\S]*?)(?=::title-container-h2|$)/)
  
  if (ceQueOnDefendMatch) {
    const contentMarkdown = ceQueOnDefendMatch[1].trim()
    log(`📋 Found "Ce que l'on défend" content: ${contentMarkdown.substring(0, 100)}...`)
    
    // Add the title as a markdown heading
    const titleMarkdown = '## Ce que l\'on défend\n\n'
    const fullContentMarkdown = titleMarkdown + contentMarkdown
    
    // Convert :br to paragraph breaks
    const processedMarkdown = fullContentMarkdown.replace(/:br/g, '\n\n')
    const content = await convertMarkdownToPortableText(processedMarkdown, assetMapping)
    
    return {
      content: content,
    }
  } else {
    reporter.recordWarning('ce-que-on-defend', 'Ce que l\'on défend section not found')
    return {
      content: [],
    }
  }
}

async function extractTeamSection(markdownContent, assetMapping, reporter) {
  // Extract everything from "Une équipe à taille humaine" section onwards
  // This includes the team text, team photo, and all the values sections
  const teamMatch = markdownContent.match(/::title-container-h2\n#subtitle\n\*\*Une équipe à taille humaine\*\*\n::\s*\n([\s\S]*)$/)
  
  if (teamMatch) {
    const contentMarkdown = teamMatch[1].trim()
    log(`📋 Found team section content: ${contentMarkdown.substring(0, 200)}...`)
    
    // Add the title as a markdown heading
    const titleMarkdown = '## Une équipe à taille humaine\n\n'
    const fullContentMarkdown = titleMarkdown + contentMarkdown
    
    // Convert custom containers to standard markdown format
    const processedMarkdown = convertCustomContainersToMarkdown(fullContentMarkdown)
    log(`📋 Processed team markdown: ${processedMarkdown.substring(0, 200)}...`)
    
    // Convert the content to Portable Text, which will handle all containers and images automatically
    const content = await convertMarkdownToPortableText(processedMarkdown, assetMapping)

    return {
      content: content,
    }
  } else {
    reporter.recordWarning('team-section', 'Team section not found')
    return {
      content: [],
    }
  }
}

function convertCustomContainersToMarkdown(content) {
  let markdown = content

  // Convert :br to double newlines (paragraph breaks)
  markdown = markdown.replace(/:br/g, '\n\n')

  // Convert title containers to markdown headings
  markdown = markdown.replace(/::title-container-h2[\s\S]*?#subtitle\s*\n\*\*(.*?)\*\*[\s\S]*?::/g, '## $1\n\n')
  markdown = markdown.replace(/::title-container-h3[\s\S]*?#subtitle\s*\n\*\*(.*?)\*\*[\s\S]*?::/g, '### $1\n\n')

  // Convert text containers to regular markdown (remove wrapper, keep content)
  markdown = markdown.replace(/::text-container[\s\S]*?#text\s*\n([\s\S]*?)(?=::|$)/g, '$1\n\n')

  // Convert section-container to regular markdown (remove wrapper, keep content including image containers)
  markdown = markdown.replace(/::section-container[\s\S]*?#content\s*\n([\s\S]*?)(?=::|$)/g, '$1\n\n')

  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n')

  return markdown.trim()
}
