import { createHash } from 'crypto'
import axios from 'axios'
import dayjs from 'dayjs'
// import qs from 'qs';

function getSignature(data) {
  const keys = Object.keys(data).sort()

  const hash = createHash('sha1')
  let hashData = ''

  keys.forEach((key) => {
    hashData += data[key]
  }, '')

  hashData += process.env.CHAPKA_HASH

  hash.update(hashData)

  return hash.digest('hex')
}

const chapka = {
  async notify(stripeSession, inssuranceItem, dealCustomFields) {
    const order = stripeSession.metadata
    const inssuranceType = inssuranceItem.description === 'Assurance multirisques' ? 'MR' : 'AN'

    const data = {
      emetteur: 'ODYSWAY', // SENDER’S NAME // PROD: ODYSWAY, TEST: ODYSWAY-TEST
      produit: 'CAP-EXPLORER', // PRODUCT NAME
      reference: order.dealId.toString(), // YOUR REFERENCE
      formule: inssuranceType, // Type d'assurance vendu.
      prime: (inssuranceItem.amount_total / 100).toFixed(2), // CONTRAT PREMIUM
      email: stripeSession.customer_details.email, // CLIENT EMAIL
      provenance: 'FR',
      destination: order.countries, // DESTINATION
      nombre: inssuranceItem.quantity.toString(), // NUMBER OF INSURED
      depart: dayjs(dealCustomFields.departureDate).format('DD/MM/YYYY'), // DEPARTURE DATE
      retour: dayjs(dealCustomFields.returnDate).format('DD/MM/YYYY'), // RETURN DATE
      // "montant"      : (order.priceBase * order.travellers.length).toFixed(2),       //TRIP AMOUNT
      devise: 'EUR', // CURRENCY
      // "genre"        : "MR",           //CLIENT TITLE
      // "prenom"       : "Dupont",       //CLIENT FIRSTNAME
      // "nom"          : "Jean",
    }

    const indivPrice = (+dealCustomFields.pricePerTraveler) - (inssuranceItem.price.unit_amount / 100)

    for (let index = 1; index < 9; index++) {
      const traveler = dealCustomFields[`traveler${index}`]

      if (traveler) {
        const travelerData = traveler.split('_')

        data[`prenom${index}`] = travelerData[0]
        data[`nom${index}`] = travelerData[1]
        data[`montant${index}`] = indivPrice.toFixed(2)
      }
    }

    data.sign = getSignature(data)

    console.log('send data to chapka', data)

    try {
      // #TODO REPLACE QS
      const res = await axios.post('https://api.chapka.fr/notify/?request=create', qs.stringify({
        message: JSON.stringify(data),
        mode: 'json',
      }))

      console.log('Notify chapka', res.status)
    }
    catch (err) {
      console.log('Err notify chapka', err)
    }
  },
  async quote(response) {
    console.log('response for chapka service', response)
    try {
      const data = response
      data.sign = getSignature(response)

      console.log('test', response)
      const res = await axios({
        url: ' https://api.chapka.fr/quote/index.php?request=quote',
        // #TODO REPLACE QS
        data: qs.stringify({
          message: JSON.stringify(data),
          mode: 'json',
        }),
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*',
        },
      })

      console.log('Quote chapka', res)
      return res.data
    }
    catch (err) {
      console.log('Err notify chapka', err)
    }
  },
}
export default chapka
