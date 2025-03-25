import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import slugify from 'slugify'

const IMAGE_DOWNLOAD_DIR = '../public/images/voyages'
const DOWNLOAD_DELAY_MS = 500
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

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

    if (filteredDeals.length !== 0) {
      let imgSrc1Path = '/images/flowers.png'
      if (voyage.image_miniature) {
        try {
          const filename = generateImageFilename(voyage.image_miniature)
          const outputPath = path.join(voyageDir, filename)
          await downloadImage(voyage.image_miniature, outputPath)
          imgSrc1Path = `/images/voyages/${voyage.slug}/${filename}`
        }
        catch (error) {
          console.error(`Failed to download miniature image for ${voyage.slug}: ${error.message}`)
        }
      }

      let imgSrc2Path = '/images/iStock-1336944149.webp'
      if (voyage.image_principale) {
        const filename = path.basename(voyage.image_principale)
        imgSrc2Path = `/images/voyages/${slugify(voyage.slug, { lower: true })}/${filename}`
      }

      const formatedDates = filteredDeals.reduce((acc, cur) => {
        const date = {
          departureDate: cur.date_debut,
          returnDate: cur.date_fin,
          startingPrice: cur.prix_voyage,
          indivRoomPrice: cur.voyage.price_indiv_room_forced || 300,
          maxTravellers: cur.voyage.number_catchline_tab_group,
          bookedPlaces: cur.nombre_de_pax_disponible || 0,
          earlyBird: cur.voyage.got_earlybird || false,
          promoEarlyBird: cur.voyage.reduction_earlybird || 0,
          lastMinute: cur.last_minute_disponible || false,
          promoLastMinute: cur.reduction_last_minute || 0,
          promo: cur.voyage.reduction_code_promo || 0,
          privatized: false,
          flyTicketPrice: cur.voyage.prix_avion || 0,
        }
        acc.push(date)
        return acc
      }, [])

      const formatedData = {
        title: voyage.titre,
        slug: slugify(voyage.slug, { lower: true }),
        iso: voyage.pays.map(p => p.iso).join(','),
        imgSrc2: {
          src: imgSrc2Path,
          alt: path.basename(imgSrc2Path, path.extname(imgSrc2Path)),
        },
        imgSrc1: {
          src: imgSrc1Path,
          alt: path.basename(imgSrc1Path, path.extname(imgSrc1Path)),
        },
        interjection: voyage.interjection,
        country: voyage.pays.map(p => p.nom).join(','),
        zoneChapka: voyage.pays[0]?.zone_chapka || 0,
        privatisation: false,
        duration: voyage.duree,
        startingPrice: voyage.prix,
        rating: voyage.note || 0,
        comments: voyage.nombre_avis || 0,
        tooltipChild: voyage.description_bandeau_famille || '',
        tooltipGroup: voyage.groupe ? 'Disponible en groupe' : '',
        dates: [...formatedDates],
      }

      const filename = voyage.slug
      fs.writeFileSync(`../content/deals/${slugify(filename, { lower: true })}.json`, JSON.stringify(formatedData, null, 2))
    }
  }
}

mergeDeals()
