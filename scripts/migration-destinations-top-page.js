import fs from 'node:fs'
import path from 'node:path'

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
  replacement: function (content) {
    return '\n\n' + content + '\n\n'
  },
})

// Function to convert the destination data to markdown
function formatData(inputJson1, inputJson2) {
  try {
    const destinationData = JSON.parse(fs.readFileSync(inputJson2, 'utf8')).filter(d => d.destinations.length > 0)
    const voyageData = JSON.parse(fs.readFileSync(inputJson1, 'utf8'))

    const destinationsMap = []

    destinationData.forEach((d) => {
      const destinationName = d.destinations[0].nom

      if (!destinationsMap.some(d => d.title === destinationName)) {
        destinationsMap.push({
          title: destinationName,
          slug: slugify(destinationName, { lower: true }),
          id: d.destinations[0].meta.id,
          deals: [],
        })
      }
    })

    const regex = /\[_id=(\d+)\]/

    voyageData.forEach((voyage) => {
      if (voyage.pays[0]?.destinations[0] && voyage.pays[0]?.top && voyage.disponible) {
        let match = Number(voyage.pays[0]?.destinations[0].match(regex)[1])
        const destinationIndex = destinationsMap.findIndex(d => d.id === match)

        destinationsMap[destinationIndex].deals.push({
          slug: slugify(voyage.slug, { lower: true }),
          title: voyage.pays[0].nom,
        })
      }
    })

    return destinationsMap.filter(d => d.deals.length > 0)
  }
  catch (error) {
    console.error('Error processing voyage data:', error)
    return error
  }
}

function convertToMarkdown() {
  const destinations = formatData(inputVoyagesFile, inputDestinationsFile)
  // Build the markdown content
  let markdown = ``

  for (const destination of destinations) {
    markdown += `::horizontal-carousel
#title
Notre sélection [${destination.title}]{style="color: #2e8b57;"}
  
#carousel-item`
    for (const deal of destination.deals) {
      markdown += `
  :::voyage-col-card{voyage-slug="${deal.slug}"}
  :::
      `
    }
    markdown += `
:: \n\n`
  }

  console.log(markdown)
  return markdown
}

function processMarkdown(markdown, outputDir, slug) {
  const outputFile = path.join(outputDir, `${slug}.md`)
  fs.writeFileSync(outputFile, markdown)
}

const inputVoyagesFile = './butter-data/voyages.json'
const inputDestinationsFile = './butter-data/pays.json'
const outputDir = '../content/destinations'
processMarkdown(convertToMarkdown(), outputDir, 'top')
