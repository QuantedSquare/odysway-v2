import fs from 'node:fs'
import axios from 'axios'
import _ from 'lodash'

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

function getProgrammes() {
  axios.get(`https://api.buttercms.com/v2/content/voyages/?auth_token=${token}`)
    .then((res) => {
      const data = res.data.data.voyages

      fs.writeFileSync('./butter-data/voyages.json', JSON.stringify(data, null, 2))

      console.log('Voyages json read result ===> ', readJson('./butter-data/voyages.json').length)
      console.log(data)
      return data
    })
    .catch(error => console.error(error))
}

function getDatesVoyagesGroups() {
  axios.get(`https://api.buttercms.com/v2/content/dates_voyages_groupe/?auth_token=${token}`)
    .then((res) => {
      const data = res.data.data.dates_voyages_groupe

      fs.writeFileSync('./butter-data/dates-groups.json', JSON.stringify(data, null, 2))
      console.log('Dates json read result ===> ', readJson('./butter-data/dates-groups.json').length)
      return data
    })
    .catch(error => console.error(error))
}

async function mergeDeals() {
  const voyages = await readJson('./butter-data/voyages.json')
  const datesVoyagesGroupe = await readJson('./butter-data/dates-groups.json')

  for (const voyage of voyages) {
    const filteredDeals = datesVoyagesGroupe.filter(date => date.voyage.slug === voyage.slug)

    if (filteredDeals.length !== 0) {
      const formatedDates = filteredDeals.reduce((acc, cur) => {
        const date = {
          departureDate: cur.date_debut,
          returnDate: cur.date_fin,
          startingPrice: cur.prix_voyage,
          indivRoomPrice: cur.voyage.price_indiv_room_forced || 300, // check default value
          maxTravellers: cur.voyage.number_catchline_tab_group,
          bookedPlaces: cur.nombre_de_pax_disponible || 0,
          earlyBird: cur.voyage.got_earlybird || false,
          promoEarlyBird: cur.voyage.reduction_earlybird || 0, // check default value
          promoLastMinute: cur.reduction_last_minute || 0, // check default value
          lastMinute: cur.last_minute_disponible || false,
          promo: cur.voyage.reduction_code_promo || 0,
          privatized: false, // key needed as private voyage is possible ?
          flyTicketPrice: cur.voyage.prix_avion || 0, // check default value
        }
        acc.push(date)
        return acc
      }, [])

      const formatedData = {
        title: voyage.titre,
        slug: voyage.slug,
        ISO: voyage.pays[0].iso,
        imgSrc2: { // TODO: update image
          src: '/images/IMG_20250101_161727_049.jpg',
          alt: 'Petits chiens',
        },
        imgSrc1: { // TODO: update image
          src: '/images/iStock-1336944149.webp',
          alt: 'Fleur Japons',
        },
        interjection: voyage.interjection,
        country: voyage.pays[0].nom,
        zoneChapka: voyage.pays[0].zone_chapka,
        privatisation: false,
        duration: voyage.duree, // check if same duration between dates for each voyage
        startingPrice: voyage.prix,
        rating: voyage.note || 0,
        comments: voyage.nombre_avis || 0,
        tooltipChild: voyage.description_bandeau_famille || '',
        tooltipGroup: voyage.groupe ? 'Disponible en groupe' : '',
        dates: [...formatedDates],
      }

      const filename = voyage.slug
      fs.writeFileSync(`./butter-data/deals/${filename}.json`, JSON.stringify(formatedData, null, 2))
    }
  }
}

function readJson(filename) {
  const data = JSON.parse(fs.readFileSync(filename))
  return data
}

getVoyages()
// getDatesVoyagesGroups()
// mergeDeals()
// readJson('./voyages.json')
