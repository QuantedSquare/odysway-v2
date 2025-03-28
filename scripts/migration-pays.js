import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import slugify from 'slugify'

const IMAGE_DOWNLOAD_DIR = '../public/images/destinations'
const DESTINATIONS_DIR = '../content/destinations'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

const token = '19660f0f8ccfbde527e13dd4193c8be8301f4393' // process.env.BUTTER_API_TOKEN

async function getPays() {
  const { data: paysData } = await axios.get(`https://api.buttercms.com/v2/content/pays/?auth_token=${token}`)
  const pays = paysData.data.pays
  fs.writeFileSync('./butter-data/pays.json', JSON.stringify(pays, null, 2))
}

await getPays()

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function downloadImage(imageUrl, outputPath, retryCount = 0) {
  if (fs.existsSync(outputPath)) {
    console.log(`Image already exists at: ${outputPath}`)
    return outputPath
  }

  try {
    console.log(`Downloading image: ${imageUrl}`)
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })

    if (!response.data) {
      throw new Error('Failed to download image: No data received')
    }

    fs.writeFileSync(outputPath, response.data)
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

function generateImageFilename(imageUrl) {
  const urlObj = new URL(imageUrl)
  const originalFilename = path.basename(urlObj.pathname)
  const extension = path.extname(originalFilename)

  if (extension.length === 0) {
    console.log('No extension found for image: ', urlObj)
    return `${originalFilename}.jpg`
  }

  return originalFilename
}

async function readJson(filename) {
  const data = await JSON.parse(fs.readFileSync(filename))
  return data
}

async function formatDestinations() {
  try {
    const paysList = await readJson('./butter-data/pays.json')
    const paysListFiltered = paysList.filter(p => p.destinations.length !== 0)

    const destinationsMap = []

    paysListFiltered.forEach((pays) => {
      pays.destinations.forEach((destination) => {
        const destinationName = destination.nom

        if (!destinationsMap.some(d => d.title === destinationName)) {
          destinationsMap.push({
            title: destinationName,
            slug: slugify(destination.nom, { lower: true }),
            metaDescription: destination.meta_description,
            image: destination.image_1 || '',
            isOnPage: true,
            countries: [],
          })
        }

        const destinationIndex = destinationsMap.findIndex(d => d.title === destinationName)

        destinationsMap[destinationIndex].countries.push({
          country: pays.nom,
          image: pays.image,
          slug: slugify(pays.nom, { lower: true }),
          metaDescription: destination.meta_description,
          isOnPage: pays.top || false,
        })
      })
    })
    console.log('Destinations formated successfully')
    return destinationsMap
  }
  catch (error) {
    console.error('Error formating destinations: ', error)
  }
}

async function createDestinationFiles() {
  const destinations = await formatDestinations()

  if (!fs.existsSync(IMAGE_DOWNLOAD_DIR)) {
    fs.mkdirSync(IMAGE_DOWNLOAD_DIR, { recursive: true })
  }

  if (!fs.existsSync(DESTINATIONS_DIR)) {
    fs.mkdirSync(DESTINATIONS_DIR, { recursive: true })
  }
  for (const destination of destinations) {
    if (destination.image) {
      try {
        const filename = generateImageFilename(destination.image)
        const outputPath = path.join(IMAGE_DOWNLOAD_DIR, filename)
        await downloadImage(destination.image, outputPath)
        destination.image = `/images/destinations/${filename}`
      }
      catch (error) {
        console.error(`Failed to download destination image for ${destination.title}: ${error.message}`)
      }
    }

    if (destination.countries.length > 0) {
      destination.countries.forEach((country) => {
        if (country.image) {
          try {
            const filename = generateImageFilename(country.image)
            const outputPath = path.join(IMAGE_DOWNLOAD_DIR, filename)
            downloadImage(country.image, outputPath)
            country.image = `/images/destinations/${filename}`
          }
          catch (error) {
            console.error(`Failed to download destination image for ${destination.title}: ${error.message}`)
          }
        }
      })
    }

    try {
      const filename = destination.slug
      fs.writeFileSync(`../content/destinations/${slugify(filename, { lower: true })}.json`, JSON.stringify(destination, null, 2))
      console.log('Succesfull file writing')
    }
    catch (error) {
      console.error(`Erorr writing destination files ${destination.title}: ${error.message}`)
    }
  }
}

createDestinationFiles()
