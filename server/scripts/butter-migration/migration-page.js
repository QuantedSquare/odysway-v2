import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import slugify from 'slugify'

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
  replacement: function (content, node) {
    const listType = node.nodeName.toLowerCase() === 'ol' ? 'ordered' : 'unordered'
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

// Function to clean text strings
function cleanString(str) {
  if (!str) return ''

  // Remove extra spaces, line breaks and html tags
  return str.replace(/^\s*\*\s*\\r\\n\s*\*\s*/gm, '')
    .replace(/^\s*\*\s*/gm, '')
    .replace(/\\r\\n/g, '\n')
    .trim()
}

// input is an array of images [{image: 'url', image_mobile: 'alt'}]
// output is a string of markdown like
function formatImageArray(array) {
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
      result += `::::photo-col{col-width="${leftColWidth}" image-src="${array[i].image}"}
::::\n\n`
    }

    // Right column (even indices in your layout)
    if (i + 1 < array.length) {
      const rightColWidth = rightColWidths[rowIndex]

      // Using the block format for the second item in each pair
      result += `::::photo-col
---
col-width: "${rightColWidth}"
image-src: ${array[i + 1].image}
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

function mapProgrammeInMarkdon(programme) {
  return programme.map((item) => {
    return `
    :::day-row
    ---
    image: ${item.image}
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

function mapHerebergementInMarkdown(voyage) {
  // There can be up to 6 hebergement_photo_n fiels
  // We need to check which ones got a velue and include them in the markdown
  const hebergementPhotos = []
  for (let i = 1; i <= 6; i++) {
    const photo = voyage[`hebergement_photo_${i}`]
    if (photo.length > 0) {
      hebergementPhotos.push(photo)
    }
  }

  return hebergementPhotos.map((photo) => {
    return `
    :::::image-carousel-item
    ---
    image: ${photo}
    ---
    :::::`
  }).join('\n')
}

function mapAccompagnateursInMarkdown(voyage) {
  // There can be up to 4 accompagnateur_n fields
  // We need to check which ones got a value and include them in the markdown
  const accompagnateurs = []
  for (let i = 1; i <= 4; i++) {
    const accompagnateur = voyage[`accompagnateur_${i}_nom`]
    if (accompagnateur.length > 0) {
      accompagnateurs.push({
        nom: accompagnateur,
        role: voyage[`accompagnateur_${i}_role`],
        photo: voyage[`accompagnateur_${i}_photo`],
        description: voyage[`accompagnateur_${i}_description`],
      })
    }
  }
  // !!! Indentation is important
  return accompagnateurs.map(accompagnateur => `  ::::avatar-list-item
    ---
    avatar: ${accompagnateur.photo}
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

function mapAvisVoyageInMarkdown(voyage) {
  // There can be up to 7 avis_n_nom fields
  const avis = []
  for (let i = 1; i <= 7; i++) {
    const nom = voyage[`avis_${i}_nom`]
    if (nom.length > 0) {
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
    photo: ${avis.photo || ''}
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
function convertToMarkdown(voyageData) {
  const voyage = voyageData // Assuming we're processing one voyage at a time

  // Build the markdown content
  let markdown = `::hero-voyage-section
---
image-src: ${voyage.image_principale}
---
#title
${voyage.titre}

#component-slot-1
  :::photo-gallery-dialog
  #gallery-btn
  voir la galerie photos

  #photo-col
    ${formatImageArray(voyage.images)}
  :::

#component-slot-2
  :::video-dialog
  ---
  video-src: ${voyage.lien_video_1 || ''}
  ---
  #video-btn
  voir la video
  :::
::

::bottom-app-bar
#starting-price
Dès [${voyage.prix}€]{style="font-weight: bold"}

#text-btn-1
voir dates & prix

#text-btn-2
Prendre RDV
::

::sticky-container
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
    avatar: ${voyage.photo_auteur_description}
    avatar-size: "60"
    ---
    #title
    [${voyage.nom_auteur_description}]{style="font-weight: bold"} , ${voyage.role_auteur_description}
    ::::
  :::

  :::highlights-row
  ---
  image: ${voyage.image_secondaire}
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

  ${voyage.programme && mapProgrammeInMarkdon(voyage.programme)}

  :::title-container
  #title
  Votre hébergement
  :::

  :::accomodation-container
  #text
  ${formatDescription(voyage.hebergement_description)}

  ${voyage.hebergement_photo_1.length > 0
  && `
  #carousel
    ::::carousel
    #carousel-item
      ${mapHerebergementInMarkdown(voyage)}
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
  ${mapAccompagnateursInMarkdown(voyage)}
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

${mapAvisVoyageInMarkdown(voyage).length > 0
  ? `
::title-container
#title
Les avis des voyageurs
::

::avis-voyage-container
#carousel
  :::avis-carousel
  #carousel-item
  ${mapAvisVoyageInMarkdown(voyage)}
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
function processVoyageData(inputJson, outputDir) {
  console.log('Processing voyage data...')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  try {
    // Parse the JSON if it's a string, otherwise use it directly
    const voyageData = JSON.parse(fs.readFileSync(inputJson, 'utf8'))

    if (Array.isArray(voyageData)) {
      voyageData.forEach(post => processMarkdown(convertToMarkdown(post, outputDir), outputDir, slugify(post.slug)))
    }
    else {
      processMarkdown(convertToMarkdown(voyageData, outputDir), outputDir, slugify(voyageData.slug))
    }

    console.log(`Successfully converted data to markdown. File saved at: ${outputDir}`)
    return true
  }
  catch (error) {
    console.error('Error processing voyage data:', error)
    return false
  }
}
const inputFile = 'data/voyages.json'
const outputDir = 'data/voyages'

processVoyageData(inputFile, outputDir)
