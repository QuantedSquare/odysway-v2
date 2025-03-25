import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import slugify from 'slugify'

// Image download configuration
const IMAGE_DOWNLOAD_DIR = '../public/images/voyages'
const DOWNLOAD_DELAY_MS = 500 // 500ms delay between downloads
const MAX_RETRIES = 3 // Maximum number of retry attempts
const RETRY_DELAY_MS = 2000 // Wait 2 seconds before retrying

// Helper function to create a delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Download an image with retry logic
 * @param {String} imageUrl - URL of the image to download
 * @param {String} outputPath - Path to save the image
 * @param {Number} retryCount - Current retry attempt
 * @returns {Promise<String>} - Local path to the downloaded image
 */
async function downloadImage(imageUrl, outputPath, retryCount = 0) {
  // Check if file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`Image already exists at: ${outputPath}`)
    return outputPath
  }

  try {
    console.log(`Downloading image: ${imageUrl}`)
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    fs.writeFileSync(outputPath, Buffer.from(buffer))
    console.log(`Saved image to: ${outputPath}`)
    return outputPath
  }
  catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Error downloading image, retrying (${retryCount + 1}/${MAX_RETRIES}): ${error.message}`)
      await sleep(RETRY_DELAY_MS)
      return downloadImage(imageUrl, outputPath, retryCount + 1)
    }
    else {
      console.error(`Failed to download image after ${MAX_RETRIES} attempts: ${imageUrl}`)
      throw error
    }
  }
}

/**
 * Generate a filename for the downloaded image
 * @param {String} imageUrl - URL of the image
 * @returns {String} - Filename for the image
 */
function generateImageFilename(imageUrl) {
  // Parse the URL to get the original filename
  const urlObj = new URL(imageUrl)
  const originalFilename = path.basename(urlObj.pathname)

  // If no extension, add .jpg
  if (!path.extname(originalFilename)) {
    return `${originalFilename}.jpg`
  }

  return originalFilename
}

/**
 * Process and download all images in a voyage
 * @param {Object} voyage - Voyage object containing image URLs
 * @returns {Promise<Object>} - Object containing mappings from original URLs to local paths
 */
async function processAndDownloadImages(voyage) {
  // Create image directory if it doesn't exist
  if (!fs.existsSync(IMAGE_DOWNLOAD_DIR)) {
    fs.mkdirSync(IMAGE_DOWNLOAD_DIR, { recursive: true })
  }

  const imageUrlMap = new Map()
  const imagesToProcess = []

  // Add main images if they exist
  if (voyage.image_principale) {
    imagesToProcess.push({
      url: voyage.image_principale,
    })
  }

  if (voyage.image_secondaire) {
    imagesToProcess.push({
      url: voyage.image_secondaire,
    })
  }

  // Add gallery images if they exist
  if (voyage.images && Array.isArray(voyage.images)) {
    voyage.images.forEach((img) => {
      if (img.image) {
        imagesToProcess.push({
          url: img.image,
        })
      }
    })
  }

  // Add programme images if they exist
  if (voyage.programme && Array.isArray(voyage.programme)) {
    voyage.programme.forEach((day) => {
      if (day.image) {
        imagesToProcess.push({
          url: day.image,
        })
      }
    })
  }

  // Add author photo if it exists
  if (voyage.photo_auteur_description) {
    imagesToProcess.push({
      url: voyage.photo_auteur_description,
    })
  }

  // Add accommodation photos if they exist
  for (let i = 1; i <= 6; i++) {
    const photo = voyage[`hebergement_photo_${i}`]
    if (photo) {
      imagesToProcess.push({
        url: photo,
      })
    }
  }

  // Add guide photos if they exist
  for (let i = 1; i <= 4; i++) {
    const photo = voyage[`accompagnateur_${i}_photo`]
    if (photo) {
      imagesToProcess.push({
        url: photo,
      })
    }
  }

  // Add review photos if they exist
  for (let i = 1; i <= 7; i++) {
    const photo = voyage[`avis_${i}_photo`]
    if (photo) {
      imagesToProcess.push({
        url: photo,
      })
    }
  }

  // Download each image with rate limiting
  for (const image of imagesToProcess) {
    try {
      const filename = generateImageFilename(image.url)
      const outputPath = path.join(IMAGE_DOWNLOAD_DIR, filename)
      await downloadImage(image.url, outputPath)
      const relativePath = `/images/voyages/${filename}`
      imageUrlMap.set(image.url, relativePath)
      await sleep(DOWNLOAD_DELAY_MS)
    }
    catch (error) {
      console.error(`Error processing image ${image.url}: ${error.message}`)
    }
  }

  return imageUrlMap
}

// Initialize turndown service to convert HTML to markdown
const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
})

// Configure turndown to handle paragraphs with proper spacing
turndown.addRule('paragraphs', {
  filter: 'p',
  replacement: function (content) {
    return '\n' + content + '\n\n'
  },
})

// If you need to handle additional HTML elements with specific spacing
turndown.addRule('lineBreaks', {
  filter: 'br',
  replacement: function () {
    return '\n'
  },
})

// Fix for lists inside HTML content
turndown.addRule('lists', {
  filter: ['ul', 'ol'],
  replacement: function (content) {
    return '\n\n' + content + '\n\n'
  },
})

function formatDescription(htmlContent) {
  if (!htmlContent) return ''

  // Convert HTML to markdown with turndown
  let markdown = turndown.turndown(htmlContent)

  // Trim extra whitespace while maintaining paragraph breaks
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n') // Replace triple+ newlines with double
    .trim()

  return markdown
}

// input is an array of images [{image: 'url', image_mobile: 'alt'}]
// output is a string of markdown like
function formatImageArray(array, imageUrlMap) {
  if (!array || !array.length) return ''

  // Pattern for left columns: 7, 4, 5, repeat...
  const leftColWidths = [7, 4, 5]
  // Pattern for right columns: 5, 8, 7, repeat...
  const rightColWidths = [5, 8, 7]

  let result = ''

  for (let i = 0; i < array.length; i += 2) {
    // Determine the row index for selecting the appropriate col-width
    const rowIndex = Math.floor(i / 2) % 3

    // Left column (odd indices in your layout)
    const leftColWidth = leftColWidths[rowIndex]

    // Format left column
    if (i < array.length) {
      // Using the inline format for the first item in each pair
      result += `::::photo-col{col-width="${leftColWidth}" image-src="${imageUrlMap.get(array[i].image) || array[i].image}"}
::::\n\n`
    }

    // Right column (even indices in your layout)
    if (i + 1 < array.length) {
      const rightColWidth = rightColWidths[rowIndex]

      // Using the block format for the second item in each pair
      result += `::::photo-col
---
col-width: "${rightColWidth}"
image-src: ${imageUrlMap.get(array[i + 1].image) || array[i + 1].image}
---
::::\n\n`
    }
  }

  return result.trim()
}
// Function to convert list items from Butter CMS format
function highlightListItems(htmlList) {
  if (!htmlList) return ''

  // Create a DOM from the HTML string
  const dom = new JSDOM(htmlList)
  const listItems = dom.window.document.querySelectorAll('li')

  // Convert each list item to the desired format
  const highlightItems = Array.from(listItems).map((item) => {
    // Use turndown to convert any HTML within the list item to markdown
    const content = turndown.turndown(item.innerHTML).trim()

    return `  ::::highlight-list-item
  ${content}
  ::::`
  })

  // Join all items with proper spacing
  return highlightItems.join('\n\n')
}

function formatPriceItems(htmlList, isIncluded = false) {
  if (!htmlList) return ''

  // Create a DOM from the HTML string
  const dom = new JSDOM(htmlList)
  const listItems = dom.window.document.querySelectorAll('li')

  // Convert each list item to the desired format
  const priceItems = Array.from(listItems).map((item) => {
    // Use turndown to convert any HTML within the list item to markdown
    const content = turndown.turndown(item.innerHTML)

    // Create the price-details-item component with the appropriate included attribute
    return `  :::price-details-item${isIncluded ? '{:is-included=true}' : ''}
  #item
  ${content.trim()}
  :::`
  })

  // Join all items with double newlines
  return priceItems.join('\n\n')
}

function mapProgrammeInMarkdon(programme, imageUrlMap) {
  return programme.map((item) => {
    return `
    :::day-row
    ---
    image: ${imageUrlMap.get(item.image) || item.image}
    ---
    #subtitle
    ${item.jours}

    #title
    ${item.titre}

    #text
    ${item.contenu}
    :::
    `
  }).join('\n')
}

function mapHerebergementInMarkdown(voyage, imageUrlMap) {
  // There can be up to 6 hebergement_photo_n fiels
  // We need to check which ones got a velue and include them in the markdown
  const hebergementPhotos = []
  for (let i = 1; i <= 6; i++) {
    const photo = voyage[`hebergement_photo_${i}`]
    if (photo && photo.length > 0) {
      hebergementPhotos.push(photo)
    }
  }

  return hebergementPhotos.map((photo) => {
    return `
    :::::image-carousel-item
    ---
    image: ${imageUrlMap.get(photo) || photo}
    ---
    :::::`
  }).join('\n')
}

function mapAccompagnateursInMarkdown(voyage, imageUrlMap) {
  const accompagnateurs = []
  for (let i = 1; i <= 4; i++) {
    const accompagnateur = voyage[`accompagnateur_${i}_nom`]
    if (accompagnateur && accompagnateur.length > 0) {
      accompagnateurs.push({
        nom: accompagnateur,
        role: voyage[`accompagnateur_${i}_role`],
        photo: voyage[`accompagnateur_${i}_photo`],
        description: voyage[`accompagnateur_${i}_description`],
      })
    }
  }
  return accompagnateurs.map(accompagnateur => `  ::::avatar-list-item
    ---
    avatar: ${imageUrlMap.get(accompagnateur.photo) || accompagnateur.photo}
    ---
    #title
    ${accompagnateur.nom}

    #subtitle
    ${accompagnateur.role}
    #text
    ${formatDescription(accompagnateur.description)}
    ::::
  `).join('\n')
}

function mapAvisVoyageInMarkdown(voyage, imageUrlMap) {
  const avis = []
  for (let i = 1; i <= 7; i++) {
    const nom = voyage[`avis_${i}_nom`]
    if (nom && nom.length > 0) {
      avis.push({
        nom: nom,
        age: voyage[`avis_${i}_age`],
        photo: voyage[`avis_${i}_photo`],
        avis: voyage[`avis_${i}_avis`],
      })
    }
  }

  return avis.map(avis => `
    ::::avis-carousel-item
    ---
    photo: ${imageUrlMap.get(avis.photo) || avis.photo || ''}
    ---
    #title
    ${avis.nom}, [${avis.age}]{style="color: grey"}

    #avis
    ${formatDescription(avis.avis)}
    ::::`).join('\n')
}

function mapFaqsInMarkdown(faq) {
  if (!faq || !Array.isArray(faq) || faq.length === 0) {
    console.log('No FAQ found or invalid FAQ format')
    return ''
  }

  return faq.map((item) => {
    // Use turndown to convert HTML content to markdown
    const formattedAnswer = formatDescription(item.reponse)
      // Ensure proper indentation for all lines in the answer
      .split('\n')
      .map(line => line.trim()) // Trim each line
      .join('\n      ') // Join with proper indentation

    return `
      :::question-panel
      #question
      [${item.question}]{style="font-weight:bold"}
      
      #answer
      ${formattedAnswer}
      :::`
  }).join('\n')
}

// Function to convert the voyage data to markdown
function convertToMarkdown(voyageData, imageUrlMap) {
  const voyage = voyageData

  // Helper function to get local image path
  const getLocalImagePath = (url) => {
    if (!url) return ''
    return imageUrlMap.get(url) || url
  }

  // Build the markdown content
  let markdown = `::hero-voyage-section
---
image-src: ${getLocalImagePath(voyage.image_principale)}
---
#title
${voyage.titre}
`

  if (voyage.images && voyage.images.length > 0) {
    markdown += `#component-slot-1
  :::photo-gallery-dialog
  #gallery-btn
  voir la galerie photos

  #photo-col
    ${formatImageArray(voyage.images, imageUrlMap)}
  :::`
  }

  if (voyage.lien_video_1) {
    markdown += `#component-slot-2
  :::video-dialog
  ---
  video-src: ${voyage.lien_video_1}
  ---
  #video-btn
  voir la video
  :::`
  }

  markdown += '\n::\n\n'

  markdown += `::sticky-container
---
left-space: 8
left-sticky: false
right-space: 4
right-sticky: true
---
#left-side
  :::title-container
  #title
  ${voyage.titre}
  :::

  :::intro-voyage-container
  ---
  programme: ${voyage.fichier_pdf || ''}
  ---

  #tooltip-text-group
    ::::icon-col
    ---
    icon-name: mdiCalendar
    ---
    #tooltip
    Durée de voyage

    #text
    ${voyage.duree.toUpperCase()}
    ::::

    ::::icon-col
    ---
    icon-name: mdiWhiteBalanceSunny
    ---
    #tooltip
    Période idéale

    #text
    ${voyage.periode_ideale.toUpperCase()}
    ::::

    ::::icon-col
    ---
    icon-name: mdiTent
    ---
    #tooltip
    Hébergement

    #text
    ${voyage.hebergement.toUpperCase()}
    ::::

    ::::icon-col
    ---
    icon-name: mdiAccountGroup
    ---
    #tooltip
    Disponible en groupe

    #text
    ${voyage.groupe ? 'DISPONIBLE EN GROUPE' : 'NON DISPONIBLE EN GROUPE'}
    ::::

    ::::icon-col
    ---
    icon-name: mdiTeddyBear
    ---
    #tooltip
    ${voyage.description_bandeau_famille}

    #text
    ${voyage.description_bandeau_famille.toUpperCase()}
    ::::

  #intro-voyage
  ${formatDescription(voyage.description)}

  #avatar
    ::::avatar-list-item
    ---
    avatar: ${getLocalImagePath(voyage.photo_auteur_description)}
    avatar-size: "60"
    ---
    #title
    [${voyage.nom_auteur_description}]{style="font-weight: bold"}${voyage.role_auteur_description ? ` , ${voyage.role_auteur_description}` : ''}
    ::::
  :::

  :::highlights-row
  ---
  image: ${getLocalImagePath(voyage.image_secondaire)}
  ---
${highlightListItems(voyage.plus)}

  #title
  [Ce que vous allez vivre ❤️️]{style="font-weight: bold"}
  :::

  :::green-card-container
  #title
  POURQUOI VOYAGER AVEC ODYSWAY ?

  #items
    ::::green-card-item
    Un accompagnement personnalisé du début à la fin de votre voyage
    ::::

    ::::green-card-item
    La liberté de choisir votre mode de voyage : en petit groupe ou privatif (aux dates de votre choix)
    ::::

    ::::green-card-item
    Des petits groupes pour une dimension intimiste
    ::::

    ::::green-card-item
    Des expériences en immersion, loin du tourisme de masse, soigneusement conçues par Odysway
    ::::

    ::::green-card-item
    Des guides locaux passionnés
    ::::
  :::

  :::title-container
  #title
  Le programme du voyage
  :::

  ${voyage.programme && mapProgrammeInMarkdon(voyage.programme, imageUrlMap)}

  :::title-container
  #title
  Votre hébergement
  :::

  :::accomodation-container
  #text
  ${formatDescription(voyage.hebergement_description)}

  ${voyage.hebergement_photo_1 && voyage.hebergement_photo_1.length > 0
  && `
  #carousel
    ::::carousel
    #carousel-item
      ${mapHerebergementInMarkdown(voyage, imageUrlMap)}
    ::::`
  }
  :::

  :::title-container
  #title
  Les accompagnateurs
  :::

  :::guides-container
  #text
  ${formatDescription(voyage.description_accompagnateurs)}

  #guides
  ${mapAccompagnateursInMarkdown(voyage, imageUrlMap)}
  :::

#right-side
  :::info-card
  ---
  average-note: ${voyage.note}
  class: mt-12
  nb-notes: ${voyage.nombre_avis}
  ---
  #catch-phrase
  Discutons de votre projet !

  #payment-items
    ::::payment-item
    ---
    image-src: /images/alma.webp
    ---
    #text
    Payez en 3 versements
    ::::

    ::::payment-item
    ---
    image-src: /images/ancv.png
    ---
    #text
    Payez avec vos chèques vacances
    ::::

  #text-btn-1
  voir dates & prix

  #text-btn-2
  Demander plus d'informations
  :::
::

::title-container
#title
Détails du prix
::

::price-details-container
#left-column-phrase
[Le prix comprend]{style="font-weight: bold"}

#items-list-include
${formatPriceItems(voyage.price_include, true)}

#right-column-phrase
[Le prix ne comprend pas]{style="font-weight: bold"}

#items-list-exclude
${formatPriceItems(voyage.price_not_include)}
::

${mapAvisVoyageInMarkdown(voyage, imageUrlMap).length > 0
  ? `
::title-container
#title
Les avis des voyageurs
::

::avis-voyage-container
#carousel
  :::avis-carousel
  #carousel-item
  ${mapAvisVoyageInMarkdown(voyage, imageUrlMap)}
  :::
::
`
  : ''}
::title-container
#title
Dates & Prix
::

::dates-prices-container
---
slug: ${slugify(voyage.slug)}
---
#phrase-left-title
DÉPARTS GROUPÉS

#phrase-left-subtitle
REJOIGNEZ UN PETIT GROUPE DE ${voyage.number_catchline_tab_group > 0 ? voyage.number_catchline_tab_group : 8} VOYAGEURS
#phrase-right-title
VOYAGE PRIVATISÉ

#phrase-right-subtitle
DEMANDEZ VOTRE DEVIS PERSONNALISÉ
::

::faq-container
#section-title
  :::title-container
  #title
  Foire aux questions
  :::

#faq
  ${mapFaqsInMarkdown(voyage.faq)}
::
`

  return markdown
}

function processMarkdown(markdown, outputDir, slug) {
  const outputFile = path.join(outputDir, `${slug}.md`)
  fs.writeFileSync(outputFile, markdown)
}

// Main function that processes the JSON data and writes the markdown file
async function processVoyageData(inputJson, outputDir) {
  console.log('Processing voyage data...')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  try {
    // Parse the JSON if it's a string, otherwise use it directly
    const voyageData = JSON.parse(fs.readFileSync(inputJson, 'utf8'))

    if (Array.isArray(voyageData)) {
      for (const post of voyageData) {
        // Process images first
        const imageUrlMap = await processAndDownloadImages(post)
        // Convert markdown with updated image paths
        const markdown = convertToMarkdown(post, imageUrlMap)
        processMarkdown(markdown, outputDir, slugify(post.slug))
      }
    }
    else {
      // Process images first
      const imageUrlMap = await processAndDownloadImages(voyageData)
      // Convert markdown with updated image paths
      const markdown = convertToMarkdown(voyageData, imageUrlMap)
      processMarkdown(markdown, outputDir, slugify(voyageData.slug))
    }

    console.log(`Successfully converted data to markdown. File saved at: ${outputDir}`)
    return true
  }
  catch (error) {
    console.error('Error processing voyage data:', error)
    return false
  }
}

const inputFile = './butter-data/voyages.json'
const outputDir = '../content/voyages'

processVoyageData(inputFile, outputDir)
