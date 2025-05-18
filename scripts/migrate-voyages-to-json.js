import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import slugify from 'slugify'

// Image download configuration
const IMAGE_DOWNLOAD_DIR = '../public/images/voyages'
const OUTPUT_DIR = 'content/voyagesv2'
const INPUT_FILE = './butter-data/voyages.json'
const DOWNLOAD_DELAY_MS = 100
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 200

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const turndown = new TurndownService()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function downloadImage(imageUrl, outputPath, retryCount = 0) {
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(outputPath)) {
    return outputPath
  }
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    if (!response.data) throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
    fs.writeFileSync(outputPath, response.data)
    return outputPath
  }
  catch {
    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS)
      return downloadImage(imageUrl, outputPath, retryCount + 1)
    }
    else {
      console.error(`Failed to download image after ${MAX_RETRIES} attempts: ${imageUrl}`)
      return null
    }
  }
}

function generateImageFilename(imageUrl) {
  const urlObj = new URL(imageUrl)
  const originalFilename = path.basename(urlObj.pathname)
  const extension = path.extname(originalFilename)
  return extension.length === 0 ? `${originalFilename}.jpg` : originalFilename
}

async function processAndDownloadImages(voyage) {
  if (!fs.existsSync(IMAGE_DOWNLOAD_DIR)) fs.mkdirSync(IMAGE_DOWNLOAD_DIR, { recursive: true })
  const voyageSlug = slugify(voyage.slug, { lower: true })
  const voyageDir = path.join(IMAGE_DOWNLOAD_DIR, voyageSlug)
  if (!fs.existsSync(voyageDir)) fs.mkdirSync(voyageDir, { recursive: true })
  const imageUrlMap = new Map()
  const imagesToProcess = []
  if (voyage.image_principale) imagesToProcess.push({ url: voyage.image_principale })
  if (voyage.image_secondaire) imagesToProcess.push({ url: voyage.image_secondaire })
  if (voyage.images && Array.isArray(voyage.images)) voyage.images.forEach((img) => {
    if (img.image) {
      imagesToProcess.push({ url: img.image })
    }
  })
  if (voyage.programme && Array.isArray(voyage.programme)) voyage.programme.forEach((day) => {
    if (day.image) {
      imagesToProcess.push({ url: day.image })
    }
  })
  if (voyage.photo_auteur_description) imagesToProcess.push({ url: voyage.photo_auteur_description })
  for (let i = 1; i <= 6; i++) {
    const photo = voyage[`hebergement_photo_${i}`]
    if (photo) {
      imagesToProcess.push({ url: photo })
    }
  }
  for (let i = 1; i <= 4; i++) {
    const photo = voyage[`accompagnateur_${i}_photo`]
    if (photo) {
      imagesToProcess.push({ url: photo })
    }
  }
  for (let i = 1; i <= 7; i++) {
    const photo = voyage[`avis_${i}_photo`]
    if (photo) {
      imagesToProcess.push({ url: photo })
    }
  }
  for (const image of imagesToProcess) {
    try {
      const filename = generateImageFilename(image.url)
      const outputPath = path.join(voyageDir, filename)
      await downloadImage(image.url, outputPath)
      const relativePath = `/images/voyages/${voyageSlug}/${filename}`
      imageUrlMap.set(image.url, relativePath)
      await sleep(DOWNLOAD_DELAY_MS)
    }
    catch (error) {
      console.error(`Error processing image ${image.url}: ${error.message}`)
    }
  }
  return imageUrlMap
}

function htmlListToArray(htmlList) {
  if (!htmlList) return []
  const dom = new JSDOM(htmlList)
  const listItems = dom.window.document.querySelectorAll('li')
  return Array.from(listItems).map((item) => {
    let text = turndown.turndown(item.innerHTML).trim()
    // Convert <strong> or <b> to **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '**$1**')
    return text
  })
}

function parseDuration(duree) {
  // Ex: "10 jours / 9 nuits"
  const match = /([0-9]+)\s*jours?\s*\/\s*([0-9]+)\s*nuits?/.exec(duree)
  if (match) return { duration: parseInt(match[1]), nights: parseInt(match[2]) }
  return { duration: 0, nights: 0 }
}

function mapMonths(numbers) {
  // numbers input looks like this "1,2,3,4,12"
  if (!numbers) return []
  return numbers.split(',').map(n => MONTHS[parseInt(n) - 1]).filter(Boolean)
}

function getVideoLinks(voyage) {
  const videoLinks = []
  for (let i = 1; i <= 4; i++) {
    const video = voyage[`lien_video_${i}`]
    if (video) videoLinks.push(video)
  }
  return videoLinks
}

function getReviews(voyage) {
  const reviews = []
  for (let i = 1; i <= 7; i++) {
    const reviewName = voyage[`avis_${i}_nom`]
    const reviewPhoto = voyage[`avis_${i}_photo`]
    const reviewText = voyage[`avis_${i}_avis`]
    const reviewAge = voyage[`avis_${i}_age`]
    if (reviewText.length > 0) {
      reviews.push({
        author: reviewName || '',
        authorAge: reviewAge || '',
        photo: reviewPhoto || '',
        rating: 5,
        text: turndown.turndown(reviewText),
        date: '2025-03-25T00:00:00',
        voyageSlug: slugify(voyage.slug, { lower: true }),
        voyageTitle: voyage.titre,
        isOnHome: false,
      })
    }
  }
  reviews.forEach((review) => {
    const imageUrl = review.photo
    const imageFilename = imageUrl ? generateImageFilename(imageUrl) : null
    const IMAGE_DOWNLOAD_DIR2 = '../public/images/reviews'
    const imagePath = imageFilename ? path.join(IMAGE_DOWNLOAD_DIR2, imageFilename) : null
    if (imagePath) {
      downloadImage(imageUrl, imagePath)
      review.photo = imagePath
    }
    fs.writeFileSync(`./butter-data/reviews/${slugify(review.voyageSlug + '-' + review.author, { lower: true })}.json`, JSON.stringify(review, null, 2))
  })
  return reviews
}

async function processVoyage(voyage) {
  const imageUrlMap = await processAndDownloadImages(voyage)
  const { duration, nights } = parseDuration(voyage.duree || '')
  // Map fields according to schema
  getReviews(voyage)
  const out = {
    published: voyage.disponible, // Default to true, adjust if you have a field for this
    title: voyage.titre || '',
    destinations: voyage.pays.map((p) => {
      return {
        name: p.nom,
        slug: slugify(p.nom, { lower: true }),
      }
    }),
    groupeAvailable: voyage.groupe,
    privatisationAvailable: voyage.individuel,
    customAvailable: undefined, // Not present in source
    experienceType: 'En immersion chez...', // Not present in source
    level: '1', // Not present in source
    categories: voyage.categorie.map(c => ({ name: c.slug })),
    duration,
    nights,
    includeFlight: voyage.vol_inclus,
    housingType: voyage.hebergement,
    idealPeriods: mapMonths(voyage.periode_ideale_search).map(month => ({ month })),
    monthlyAvailability: mapMonths(voyage.periode_ideale_search).map(month => ({ month })),
    minAge: 8,
    rating: voyage.note || 5,
    comments: voyage.nombre_avis || 10,
    miniatureDisplay: 'Note moyenne',
    authorNote: {
      text: turndown.turndown(voyage.description || ''),
      author: voyage.nom_auteur_description || '',
      affixeAuthor: voyage.role_auteur_description || '',
    },
    experiencesBlock: htmlListToArray(voyage.plus),
    slug: slugify(voyage.slug, { lower: true }) || '',
    description: turndown.turndown(voyage.description || ''),
    emailDescription: voyage.description_email,
    metaDescription: voyage.meta_description || '',
    interjection: '',
    badgeSection: {
      experienceBadge: {
        text: 'En immersion chez...',
        color: 'yellow',
        visible: true,
      },
      groupeBadge: {
        text: `Groupe de **${voyage.nombre_de_voyageurs_pour_privatiser} à ${voyage.nombre_catchline_tab_group + 1} personnes**`,
        visible: voyage.groupe,
      },
      durationBadge: {
        text: `**${nights > 0 ? nights : duration} nuits sur place**`,
        visible: nights > 0 || duration > 0,
      },
      includeFlightBadge: {
        text: '**Vol** compris',
        visible: voyage.vol_inclus,
      },
      housingBadge: {
        text: voyage.tooltip_hebergement,
        visible: voyage.tooltip_hebergement.length > 0,
      },
      periodBadge: {
        text: voyage.periode_ideale,
        visible: voyage.periode_ideale.length > 0,
      },
    },
    programmeBlock: (voyage.programme || []).map(day => ({
      title: day.titre || '',
      badgeText: day.jours || '',
      description: day.contenu || '',
      photo: imageUrlMap.get(day.image) || day.image || '',
      denivellation: '',
      road: '',
      night: '',
    })),
    pricingDetailsBlock: {
      include: htmlListToArray(voyage.price_include),
      exclude: htmlListToArray(voyage.price_not_include),
    },
    pricing: {
      startingPrice: voyage.prix || 0,
      lastMinuteAvailable: false,
      lastMinuteReduction: 0,
      earlyBirdAvailable: voyage.got_earlybird,
      earlyBirdReduction: voyage.reduction_earlybird,
      maxTravelers: voyage.number_catchline_tab_group,
      minTravelersToConfirm: voyage.nombre_de_voyageurs_pour_privatiser > 0 ? voyage.nombre_de_voyageurs_pour_privatiser : 2,
      indivRoom: voyage.indiv_room,
      forcedIndivRoom: voyage.forced_indiv_room,
      indivRoomPrice: voyage.indiv_room_price,
      cseReduction: voyage.reduction_code_promo.length > 0 ? voyage.reduction_code_promo : 0, // Not present in source
      cseAvailable: voyage.reduction_code_promo.length > 0, // Not present in source
      childrenPromo: voyage.reduction_enfant || 0, // Not present in source
      childrenAge: 12, // Default
      airportCode: Array.from({ length: 2 }, (_, i) => i + 1).map(i => voyage[`airport_code_${i}`] || '').filter(Boolean),
    },
    accompanistsDescription: turndown.turndown(voyage.description_accompagnateurs || ''),
    accompanistsList: Array.from({ length: 4 }, (_, i) => i + 1).map((i) => {
      if (!voyage[`accompagnateur_${i}_nom`]) return null
      return {
        name: voyage[`accompagnateur_${i}_nom`] || '',
        description: turndown.turndown(voyage[`accompagnateur_${i}_description`] || ''),
        role: voyage[`accompagnateur_${i}_role`] || '',
        image: imageUrlMap.get(voyage[`accompagnateur_${i}_photo`]) || voyage[`accompagnateur_${i}_photo`] || '',
      }
    }).filter(Boolean),
    housingBlock: [
      {
        title: voyage.hebergement,
        housingType: '',
        housingMood: voyage.hebergement_description,
        image: Array.from({ length: 6 }, (_, i) => i + 1).map((i) => {
          if (!voyage[`hebergement_photo_${i}`]) return null
          return {
            src: imageUrlMap.get(voyage[`hebergement_photo_${i}`]) || voyage[`hebergement_photo_${i}`] || '',
            alt: 'image de l\'hébergement ' + voyage.titre || '',
          }
        }).filter(Boolean),
      },
    ],
    image: {
      src: imageUrlMap.get(voyage.image_principale) || voyage.image_principale || '',
      alt: 'image principale du voyage ' + voyage.titre || '',
    },
    imageSecondary: {
      src: imageUrlMap.get(voyage.image_secondaire) || voyage.image_secondaire || '',
      alt: 'image secondaire du voyage ' + voyage.titre || '',
    },
    photosList: (voyage.images || []).map(img => ({
      src: imageUrlMap.get(img.image) || img.image || '',
      alt: 'image de la liste de photos du voyage ' + voyage.titre || '',
    })),
    videoLinks: getVideoLinks(voyage),
    faqBlock: {
      faqList: (voyage.faq || []).map(f => ({
        question: f.question || '',
        answer: turndown.turndown(f.reponse || ''),
      })),
    },
    seo: {
      metaTitle: voyage.titre || '',
      canonicalUrl: `https://www.odysway.com/voyages/${voyage.slug}`,
      ogTitle: voyage.titre || '',
      ogDescription: voyage.meta_description || '',
      ogImage: {
        src: imageUrlMap.get(voyage.image_principale) || voyage.image_principale || '',
        alt: 'image principale du voyage ' + voyage.titre || '',
      },
      twitterTitle: voyage.titre || '',
      twitterDescription: voyage.meta_description || '',
      twitterImage: {
        src: imageUrlMap.get(voyage.image_principale) || voyage.image_principale || '',
        alt: 'image principale du voyage ' + voyage.titre || '',
      },
      twitterCard: 'summary_large_image',
    },
  }
  return out
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const raw = fs.readFileSync(INPUT_FILE, 'utf8')
  const voyages = JSON.parse(raw)
  for (const voyage of Array.isArray(voyages) ? voyages : [voyages]) {
    const out = await processVoyage(voyage)
    const outPath = path.join(OUTPUT_DIR, `${slugify(voyage.slug)}.json`)
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
    console.log(`Wrote ${outPath}`)
  }
}

main()
