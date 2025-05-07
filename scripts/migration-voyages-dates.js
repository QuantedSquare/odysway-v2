import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import slugify from 'slugify'
import TurndownService from 'turndown'

const token = '19660f0f8ccfbde527e13dd4193c8be8301f4393' // process.env.BUTTER_API_TOKEN

async function getVoyages() {
  const { data: dataOne } = await axios.get(`https://api.buttercms.com/v2/content/voyages/?auth_token=${token}`)

  const { data: dataTwo } = await axios.get(`https://api.buttercms.com/v2/content/programme/?auth_token=${token}`)

  const { data: dataThree } = await axios.get(`https://api.buttercms.com/v2/content/faq/?auth_token=${token}`)

  const { data: dataFour } = await axios.get(`https://api.buttercms.com/v2/content/images/?auth_token=${token}`)

  const voyages = dataOne.data.voyages
  const programmes = dataTwo.data.programme
  const faq = dataThree.data.faq
  const images = dataFour.data.images
  // Reassigned programme to travel
  programmes.forEach((programme) => {
    if (!programme.voyage.meta) {
      return
    }
    const voyageId = programme.voyage.meta.id

    const index = voyages.indexOf(voyages.find(v => v.meta.id === voyageId))

    if (index !== -1) {
      if (!voyages[index].programme) {
        voyages[index].programme = []
      }

      voyages[index].programme.push({
        jours: programme.jours,
        titre: programme.titre,
        image: programme.image,
        contenu: programme.contenu,
        ville: programme.ville,
      })
    }
  })
  faq.forEach((item) => {
    if (!item.voyage.meta) {
      return
    }
    const voyageId = item.voyage.meta.id
    const index = voyages.indexOf(voyages.find(v => v.meta.id === voyageId))
    if (index !== -1) {
      if (!voyages[index].faq) {
        voyages[index].faq = []
      }
      voyages[index].faq.push({
        question: item.question,
        reponse: item.reponse,
      })
    }
  })
  images.forEach((image) => {
    if (!image.voyage[0]?.meta) {
      return
    }
    const voyageId = image.voyage[0].meta.id
    const index = voyages.indexOf(voyages.find(v => v.meta.id === voyageId))
    if (index !== -1) {
      if (!voyages[index].images) {
        voyages[index].images = []
      }
      voyages[index].images.push({
        image: image.image,
        image_mobile: image.image_mobile,
      })
    }
  })
  console.log('Voyages json read result ===> ', voyages.length)
  fs.writeFileSync('./butter-data/voyages.json', JSON.stringify(voyages, null, 2))
}

function getDatesVoyagesGroups() {
  axios.get(`https://api.buttercms.com/v2/content/dates_voyages_groupe/?auth_token=${token}`)
    .then((res) => {
      const data = res.data.data.dates_voyages_groupe

      fs.writeFileSync('./butter-data/dates-groups.json', JSON.stringify(data, null, 2))
      return data
    })
    .catch(error => console.error(error))
}

// CATEGORIES

const turndown = new TurndownService()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const IMAGE_DOWNLOAD_DIR = '../public/images/categories'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

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

function getCategories() {
  axios.get(`https://api.buttercms.com/v2/content/categories/?auth_token=${token}`)
    .then((res) => {
      const data = res.data.data.categories.map((category) => {
        const imageUrl = category.image
        const imageFilename = generateImageFilename(imageUrl)
        const imagePath = path.join(IMAGE_DOWNLOAD_DIR, imageFilename)
        downloadImage(imageUrl, imagePath)
        return {
          title: category.titre,
          slug: category.content_slug,
          discoverTitle: category.titre_discover,
          titre_seo: category.titre_seo,
          image: {
            src: imagePath,
            alt: category.titre,
          },
          showOnHome: category.show_on_home,
        }
      })
      console.log('Categories json read result ===> ', data)
      fs.writeFileSync('./butter-data/categories.json', JSON.stringify(data, null, 2))
      return data
    })
    .catch(error => console.error(error))
}

// getVoyages()
// getDatesVoyagesGroups()
// getCategories()

function getReviews() {
  axios.get(`https://api.buttercms.com/v2/pages/*/avis/?&auth_token=${token}`)
    .then((res) => {
      const data = res.data.data.fields.avis.map((review) => {
        // console.log('Review ===> ', review)
        const imageUrl = review.photo
        const imageFilename = imageUrl ? generateImageFilename(imageUrl) : null
        const IMAGE_DOWNLOAD_DIR2 = '../public/images/reviews'
        const imagePath = imageFilename ? path.join(IMAGE_DOWNLOAD_DIR2, imageFilename) : null
        if (imagePath) {
          downloadImage(imageUrl, imagePath)
        }
        return {
          author: review.name,
          authorAge: review.age || '',
          photo: imageUrl,
          rating: review.note,
          text: review.text,
          date: review.date,
          voyageSlug: review.voyage.slug ? slugify(review.voyage.slug, { lower: true }) : '',
          voyageTitle: review.voyage.titre,
          isOnHome: review.published,
        }
      })
      // console.log('Reviews json read result ===> ', data)
      data.forEach((review) => {
        fs.writeFileSync(`./butter-data/reviews/${slugify(review.voyageSlug + '-' + review.author, { lower: true })}.json`, JSON.stringify(review, null, 2))
      })
    })
    .catch(error => console.error(error))
}
getReviews()
