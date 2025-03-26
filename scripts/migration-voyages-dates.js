import fs from 'node:fs'
import axios from 'axios'

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

getVoyages()
// getDatesVoyagesGroups()
