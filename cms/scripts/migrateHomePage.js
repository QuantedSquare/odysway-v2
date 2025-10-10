import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {convertMarkdownToPortableText} from './markdownToPortableText.js'
import {MigrationReporter} from './migrationReporter.js'
import {createId} from './utils/createId.js'
import fs from 'node:fs'
import {log, error} from 'node:console'
import process from 'node:process'
import {basename} from 'node:path'
import yaml from 'js-yaml'

const homePageFilePath = '../content/index.md'

export default async function migrateHomePage(client) {
  const reporter = new MigrationReporter('home-page')

  try {
    log(`🔄 Migrating home page from: ${homePageFilePath}`)

    const assetMapping = await buildImageAssetMapping(client)
    const markdownContent = fs.readFileSync(homePageFilePath, 'utf8')

    const slug = 'home-page'

    // Extract SEO settings from frontmatter
    const seoSettings = await extractSEOSettings(markdownContent)

    // Extract hero section
    const heroSection = await extractHeroSection(markdownContent, assetMapping, reporter)

    // Extract experience carousel
    const experienceCarousel = await extractExperienceCarousel(markdownContent, assetMapping)

    // Extract France trips section
    const franceTrips = await extractFranceTrips(markdownContent)

    // Extract follow desires section
    const followDesires = await extractFollowDesires(markdownContent, assetMapping)

    // Extract travel differently section
    const travelDifferently = await extractTravelDifferently(markdownContent, assetMapping, reporter)

    // Extract guaranteed departures section
    const guaranteedDepartures = await extractGuaranteedDepartures(markdownContent, assetMapping)

    // Extract summer travel section
    const summerTravel = await extractSummerTravel(markdownContent, assetMapping)

    // Extract newsletter section
    const newsletter = await extractNewsletter(markdownContent, assetMapping)

    // Extract unforgettable travels section
    const unforgettableTravels = await extractUnforgettableTravels(markdownContent, assetMapping)

    // Extract reviews section
    const reviews = await extractReviews(markdownContent, assetMapping)

    // Extract contact section
    const contact = await extractContact(markdownContent, assetMapping)

    const homePageID = createId('homePage', slug)
    const homePageDoc = {
      _id: homePageID,
      _type: 'homePage',
      seo: seoSettings,
      heroSection: heroSection,
      experienceCarousel: experienceCarousel,
      franceTrips: franceTrips,
      followDesires: followDesires,
      travelDifferently: travelDifferently,
      guaranteedDepartures: guaranteedDepartures,
      summerTravel: summerTravel,
      newsletter: newsletter,
      unforgettableTravels: unforgettableTravels,
      reviews: reviews,
      contact: contact,
    }

    reporter.incrementTotal()
    await client.createOrReplace(homePageDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated home page: ${heroSection.title} (ID: ${homePageID})`)

    reporter.finish()
  } catch (err) {
    error('❌ Error during home page migration:', err.message)
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    process.exit(1)
  }
}

async function extractSEOSettings(markdownContent) {
  const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---\n/)
  let seoSettings = {
    title: 'Voyages en immersion en petits groupes et privatifs',
    description: 'Odysway : première agence de voyage en immersion en France et à l\'étranger. Vivez des expériences uniques, en petits groupes, au plus près des habitants et de leurs traditions.',
    robots: 'index, follow',
  }

  if (frontmatterMatch) {
    try {
      const frontmatter = yaml.load(frontmatterMatch[1])
      seoSettings = {
        title: frontmatter.seo?.title || frontmatter.title || 'Voyages en immersion en petits groupes et privatifs',
        description: frontmatter.seo?.description || frontmatter.description || '',
      }
    } catch (err) {
      log('⚠️  Error parsing frontmatter:', err.message)
    }
  }

  return seoSettings
}

async function extractHeroSection(markdownContent, assetMapping, reporter) {
  const heroSectionMatch = markdownContent.match(/::home-hero-section\n---\nimageSrc:\s*([^\n]+)\nprimary-color:\s*([^\n]+)\nsecondary-color:\s*([^\n]+)\ntertiary-color:\s*([^\n]+)\n---\n#title\n([\s\S]*?)\n::/)
  
  if (heroSectionMatch) {
    const [, imageSrc, , , , title] = heroSectionMatch
    const heroImageRef = convertImageReference(
      basename(imageSrc),
      assetMapping,
      title.trim(),
      reporter,
      'home-hero',
    )

    return {
      image: heroImageRef,
      title: title.trim(),
    }
  } else {
    reporter.recordWarning('hero-section', 'Hero section not found')
    return {
      title: 'La rencontre au cœur du voyage',
    }
  }
}

async function extractExperienceCarousel(markdownContent, assetMapping) {
  const carouselMatch = markdownContent.match(/::experience-carousel\n#title\n([^\n]+)\n::/)
  
  if (carouselMatch) {
    const titleText = carouselMatch[1].replace(/\[([^\]]+)\].*/, '$1').trim()
    return {
      title: titleText,
      experiences: [], // Will be populated with references to experience documents
    }
  } else {
    return {
      title: 'Expériences à vivre',
      experiences: [],
    }
  }
}

async function extractFranceTrips(markdownContent) {
  const franceMatch = markdownContent.match(/::color-container\{color="soft-blush"\}[\s\S]*?:::horizontal-carousel[\s\S]*?#title\n\[([^\]]+)\][\s\S]*?#carousel-item([\s\S]*?):::/)
  
  if (franceMatch) {
    const [, title, carouselContent] = franceMatch
    const tripSlugs = []
    const slugMatches = carouselContent.matchAll(/slug="([^"]+)"/g)
    for (const match of slugMatches) {
      tripSlugs.push(match[1])
    }
    
    return {
      title: title.trim(),
      voyagesFrance: [], // Will be populated with references to voyage documents
    }
  } else {
    return {
      title: 'Nos séjours en France',
      voyagesFrance: [],
    }
  }
}

async function extractFollowDesires(markdownContent, assetMapping) {
  const followMatch = markdownContent.match(/::color-container\{color="primary"\}[\s\S]*?:::card-grid[\s\S]*?#title\n([^\n]+)\n[\s\S]*?:::/)
  
  if (followMatch) {
    const titleText = followMatch[1].trim()
    return {
      title: titleText,
      categoriesFollowDesires: [], // Will be populated with references to category documents
    }
  } else {
    return {
      title: 'Suivez vos envies',
      categoriesFollowDesires: [],
    }
  }
}

async function extractTravelDifferently(markdownContent, assetMapping, reporter) {
  const travelMatch = markdownContent.match(/::color-container\{color="white"\}[\s\S]*?:::text-image-container[\s\S]*?imageSrc:\s*([^\n]+)[\s\S]*?#title\n\[([^\]]+)\][\s\S]*?#content-cols([\s\S]*?)#cta-button[\s\S]*?:::cta-button[\s\S]*?link:\s*([^\n]+)[\s\S]*?#text\n([^\n]+)[\s\S]*?:::/)
  
  if (travelMatch) {
    const [, imageSrc, title, contentCols, ctaLink, ctaText] = travelMatch
    const imageRef = convertImageReference(
      basename(imageSrc),
      assetMapping,
      title,
      reporter,
      'home-travel-differently',
    )

    // Use title as string

    // Extract features from content-cols
    const features = []
    const featureMatches = contentCols.matchAll(/:::icon-text-col[\s\S]*?icon:\s*([^\n]+)[\s\S]*?#text\n([^\n]+)[\s\S]*?:::/g)
    for (const match of featureMatches) {
      const iconRef = convertImageReference(
        basename(match[1].trim()),
        assetMapping,
        match[2].trim(),
        reporter,
        'home-travel-feature-icon',
      )
      features.push({
        icon: iconRef,
        text: match[2].trim(),
      })
    }

    return {
      title: title.trim(),
      image: imageRef,
      features: features,
      ctaButton: {
        text: ctaText.trim(),
        link: ctaLink.trim(),
        color: 'secondary',
      },
    }
  } else {
    return {
      title: 'Voyager, autrement',
      features: [],
      ctaButton: {
        text: 'Notre vision du voyage',
        link: '/a-propos',
        color: 'secondary',
      },
    }
  }
}

async function extractGuaranteedDepartures(markdownContent, assetMapping) {
  const departuresMatch = markdownContent.match(/::color-container\{color="grey-light"\}[\s\S]*?:::horizontal-carousel[\s\S]*?#title\n\[([^\]]+)\][\s\S]*?#carousel-item([\s\S]*?):::/)
  
  if (departuresMatch) {
    const [, title] = departuresMatch
    
    return {
      title: title.trim(),
      voyagesGuaranteedDepartures: [], // Will be populated with references to voyage documents
    }
  } else {
    return {
      title: 'Nos départs garantis',
      voyagesGuaranteedDepartures: [],
    }
  }
}

async function extractSummerTravel(markdownContent, assetMapping) {
  const summerMatch = markdownContent.match(/::color-container\{color="white"\}[\s\S]*?:::horizontal-carousel[\s\S]*?#title\n\[([^\]]+)\][\s\S]*?#carousel-item([\s\S]*?):::/)
  
  if (summerMatch) {
    const [, title] = summerMatch
    
    return {
      title: title.trim(),
      voyagesSummerTravel: [], // Will be populated with references to voyage documents
    }
  } else {
    return {
      title: 'Voyager cet été',
      voyagesSummerTravel: [],
    }
  }
}

async function extractNewsletter(markdownContent, assetMapping) {
  const newsletterMatch = markdownContent.match(/::color-container\{color="soft-blush"\}[\s\S]*?:::newsletter-container[\s\S]*?#title\n\[([^\]]+)\][\s\S]*?#subtitle\n\[([^\]]+)\][\s\S]*?:::/)
  
  if (newsletterMatch) {
    const [, title, subtitle] = newsletterMatch
    const newsletterContent = `${title.trim()}\n\n${subtitle.trim()}`
    const newsletterBlocks = await convertMarkdownToPortableText(newsletterContent, assetMapping)
    return newsletterBlocks
  } else {
    const defaultContent = 'Nos (bonnes) idées voyage 🌍\n\n1 fois par mois, inspirations, récits et bons plans pour un voyage plus conscient.'
    const newsletterBlocks = await convertMarkdownToPortableText(defaultContent, assetMapping)
    return newsletterBlocks
  }
}

async function extractUnforgettableTravels(markdownContent, assetMapping) {
  const unforgettableMatch = markdownContent.match(/::color-container\{white-text color="primary"\}[\s\S]*?:::horizontal-carousel[\s\S]*?#title\n\[([^\]]+)\][\s\S]*?#carousel-item([\s\S]*?):::/)
  
  if (unforgettableMatch) {
    const [, title] = unforgettableMatch
    
    return {
      title: title.trim(),
      voyagesUnforgettableTravels: [], // Will be populated with references to voyage documents
    }
  } else {
    return {
      title: 'Voyages inoubliables',
      voyagesUnforgettableTravels: [],
    }
  }
}

async function extractReviews(markdownContent, assetMapping) {
  const reviewsMatch = markdownContent.match(/::color-container\{color="white"\}[\s\S]*?:::common-review-container[\s\S]*?#title\n\[([^\]]+)\][\s\S]*?#cta\n([^\n]+)\n[\s\S]*?:::/)
  
  if (reviewsMatch) {
    const [, title, ctaText] = reviewsMatch
    return {
      title: title.trim(),
      reviews: [], // Will be populated with references to review documents
      ctaText: ctaText.trim(),
    }
  } else {
    return {
      title: 'Ils en parlent mieux que nous',
      reviews: [],
      ctaText: 'Afficher plus de témoignages',
    }
  }
}

async function extractContact(markdownContent, assetMapping) {
  const contactMatch = markdownContent.match(/::color-container\{color="grey-light-2"\}[\s\S]*?:::info-container[\s\S]*?#title\n([^\n]+)\n[\s\S]*?#description\n([^\n]+)\n[\s\S]*?:::cta-button[\s\S]*?link:\s*([^\n]+)[\s\S]*?#text\n([^\n]+)[\s\S]*?:::/)
  
  if (contactMatch) {
    const [, title, description, ctaLink, ctaText] = contactMatch
    
    return {
      title: title.trim(),
      description: description.trim(),
      ctaButton: {
        text: ctaText.trim(),
        link: ctaLink.trim(),
        color: 'secondary',
      },
    }
  } else {
    return {
      title: 'Envie de partir, mais besoin d\'en parler ?',
      description: 'Nos spécialistes de chaque destination sont là pour vous accompagner.',
      ctaButton: {
        text: 'Planifier un échange',
        link: '/calendly',
        color: 'secondary',
      },
    }
  }
}
