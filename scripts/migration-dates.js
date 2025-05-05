import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import slugify from 'slugify'

const IMAGE_DOWNLOAD_DIR = '../public/images/voyages'
const DOWNLOAD_DELAY_MS = 500
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// async function downloadImage(imageUrl, outputPath, retryCount = 0) {
//   if (fs.existsSync(outputPath)) {
//     console.log(`Image already exists at: ${outputPath}`)
//     return outputPath
//   }

//   try {
//     console.log(`Downloading image: ${imageUrl}`)
//     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })

//     if (!response.data) {
//       throw new Error('Failed to download image: No data received')
//     }

//     fs.writeFileSync(outputPath, response.data)
//     console.log(`Saved image to: ${outputPath}`)
//     return outputPath
//   }
//   catch (error) {
//     if (retryCount < MAX_RETRIES) {
//       console.warn(`Error downloading image, retrying (${retryCount + 1}/${MAX_RETRIES}): ${error.message}`)
//       await sleep(RETRY_DELAY_MS)
//       return downloadImage(imageUrl, outputPath, retryCount + 1)
//     }
//     else {
//       console.error(`Failed to download image after ${MAX_RETRIES} attempts: ${imageUrl}`)
//       throw error
//     }
//   }
// }

// function generateImageFilename(imageUrl) {
//   const urlObj = new URL(imageUrl)
//   const originalFilename = path.basename(urlObj.pathname)
//   const extension = path.extname(originalFilename)

//   if (extension.length === 0) {
//     console.log('No extension found for image: ', urlObj)
//     return `${originalFilename}.jpg`
//   }

//   return originalFilename
// }

function readJson(filename) {
  const data = JSON.parse(fs.readFileSync(filename))
  return data
}

async function mergeDeals() {
  const voyages = await readJson('./butter-data/voyages.json')
  const datesVoyagesGroupe = await readJson('./butter-data/dates-groups.json')

  if (!fs.existsSync(IMAGE_DOWNLOAD_DIR)) {
    fs.mkdirSync(IMAGE_DOWNLOAD_DIR, { recursive: true })
  }

  for (const voyage of voyages) {
    const voyageDir = IMAGE_DOWNLOAD_DIR + '/' + slugify(voyage.slug, { lower: true })
    if (!fs.existsSync(voyageDir)) {
      fs.mkdirSync(voyageDir, { recursive: true })
    }
    const filteredDeals = datesVoyagesGroupe.filter(date => date.voyage.slug === voyage.slug)

    // let imgSrc1Path = '/images/flowers.png'
    // if (voyage.image_miniature) {
    //   try {
    //     const filename = generateImageFilename(voyage.image_miniature)
    //     const outputPath = path.join(voyageDir, filename)
    //     await downloadImage(voyage.image_miniature, outputPath)
    //     imgSrc1Path = `/images/voyages/${slugify(voyage.slug, { lower: true })}/${filename}`
    //   }
    //   catch (error) {
    //     console.error(`Failed to download miniature image for ${voyage.slug}: ${error.message}`)
    //   }
    // }

    // let imgSrc2Path = '/images/iStock-1336944149.webp'
    // if (voyage.image_principale) {
    //   const filename = generateImageFilename(voyage.image_principale)
    //   imgSrc2Path = `/images/voyages/${slugify(voyage.slug, { lower: true })}/${filename}`
    // }
    let formatedDates = []
    if (filteredDeals.length !== 0) {
      formatedDates = filteredDeals.reduce((acc, cur) => {
        const date = {
          published: true,
          badges: [],
          departureDate: cur.date_debut,
          returnDate: cur.date_fin,
          startingPrice: cur.prix_voyage,
          maxTravelers: cur.voyage.number_catchline_tab_group,
          minTravelers: 2,
          bookedTravelers: cur.nombre_de_pax_disponible || 0,
          includeFlight: cur.voyage.got_avion || false,
          flightPrice: cur.voyage.prix_avion || 0,
        }
        acc.push(date)
        return acc
      }, [])
    }

    console.log(formatedDates)

    // const formatedDate = {
    //   published: z.boolean().default(true),
    //   badges: z.array(z.object({
    //     text: z.string().describe('Texte du badge, utiliser des "*" pour afficher du texte en gras (ex: "**7 nuits** sur place")'),
    //     icon: z.string().editor({ input: 'icon' }),
    //   })),
    //   departureDate: z.date().describe('Date de départ du voyage'),
    //   returnDate: z.date().describe('Date de retour du voyage'),
    //   startingPrice: z.number().describe('Prix de départ du voyage'),
    //   maxTravelers: z.number().describe('Nombre de personnes maximum'),
    //   minTravelers: z.number().describe('Nombre de personnes minimum').default(2),
    //   bookedTravelers: z.number().describe('Nombre de personnes réservées'),
    //   includeFlight: z.boolean().describe('Inclure un vol'),
    //   flightPrice: z.number().describe('Prix du vol si inclus'),
    // }

    // const filename = voyage.slug
    // fs.writeFileSync(`../content/dates/${slugify(voyage.slug, { lower: true })}/date.json`, JSON.stringify(formatedDates, null, 2))
  }
}

mergeDeals()
