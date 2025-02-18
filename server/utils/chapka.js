import { createHash } from 'crypto'
import axios from 'axios'
import dayjs from 'dayjs'

const getSignature = (data) => {
  const keys = Object.keys(data).sort()

  const hashData = keys.reduce((acc, key) => acc + (data[key] ?? ''), '')
  const secretKey = process.env.CHAPKA_HASH // process.env.NODE_ENV !== 'development' ? process.env.CHAPKA_HASH_TEST : process.env.CHAPKA_HASH

  return createHash('sha1').update(hashData + secretKey).digest('hex')
}

const createDataQuote = (data, insuranceType) => {
  const { pricePerTraveler, countries, departureDate, returnDate, nbTravelers } = data

  const dataQuote = {
    emetteur: 'ODYSWAY',
    produit: countries.includes('NP') || countries.includes('PE') ? 'CAP-EXPLORACTION' : 'CAP-EXPLORER',
    formule: insuranceType === 'rapatriement' ? 'MR' : 'AN',
    provenance: 'FR',
    destination: countries,
    nombre: nbTravelers,
    DATE_RESA: dayjs().format('DD/MM/YYYY'),
    depart: dayjs(departureDate, 'YYYY-MM-DD').format('DD/MM/YYYY'),
    retour: dayjs(returnDate, 'YYYY-MM-DD').format('DD/MM/YYYY'),
    devise: 'EUR',
    montant1: pricePerTraveler,
  }

  for (let i = 2; i <= nbTravelers; i++) {
    dataQuote[`montant${i}`] = pricePerTraveler
  }

  dataQuote.sign = getSignature(dataQuote)
  return dataQuote
}

const pricing = (amount, zone, nbTraveller) => {
  const thresholds = [
    { amount: 0, cancel: 24, rapatriement: [52, 58, 61] },
    { amount: 300, cancel: 32, rapatriement: [58, 64, 67] },
    { amount: 600, cancel: 38, rapatriement: [65, 70, 72] },
    { amount: 900, cancel: 48, rapatriement: [79, 84, 86] },
    { amount: 1300, cancel: 62, rapatriement: [92, 98, 101] },
    { amount: 1600, cancel: 79, rapatriement: [100, 120, 130] },
    { amount: 2500, cancel: 112, rapatriement: [148, 162, 169] },
    { amount: 3500, cancel: 139, rapatriement: [175, 196, 206] },
    { amount: 4500, cancel: 179, rapatriement: [198, 224, 237] },
    { amount: 6000, cancel: 225, rapatriement: [240, 260, 270] },
    { amount: 8000, cancel: 269, rapatriement: [298, 320, 331] },
  ]

  const { cancel, rapatriement } = thresholds
    .slice()
    .reverse()
    .find(t => amount >= t.amount) || thresholds[0]

  const finalRapatriement = zone >= 1 && zone <= 3 ? rapatriement[zone - 1] : 0

  return {
    rapatriement: nbTraveller >= 3 ? finalRapatriement * 0.85 : finalRapatriement,
    cancel: nbTraveller >= 3 ? cancel * 0.85 : cancel,
  }
}

const getQuote = async (data, insuranceType) => {
  const insuranceTypeMap = new Set(['rapatriement', 'cancel'])
  if (!insuranceTypeMap.has(insuranceType)) {
    throw new Error(`Cannot get quote for ${insuranceType} insurance`)
  }

  try {
    const dataQuote = createDataQuote(data, insuranceType)
    console.log('dataQuote', dataQuote)
    const res = await axios.post(
      'https://api.chapka.fr/quote/index.php?request=quote',
      dataQuote,
    )
    return {
      [insuranceType]: res.data?.premium ? res.data.premium / dataQuote.nombre : 0,
    }
  }
  catch (err) {
    throw new Error(`Failed to get insurance quote '${insuranceType}': ${err.message}`)
  }
}

const quote = async (body) => {
  const timestampNow = dayjs().valueOf()
  const timestampDepart = dayjs(body.departureDate).valueOf()
  const maxTimestamp = 10 * 24 * 60 * 60 * 1000 // 10 days
  if (timestampDepart - timestampNow < maxTimestamp) {
    pricing(body.pricePerTraveler, body.zoneChapka, body.nbTravelers)
  }
  else {
    const [rapatriementQuote, cancelQuote] = await Promise.all([
      getQuote(body, 'rapatriement'),
      getQuote(body, 'cancel'),
    ])
    return { ...rapatriementQuote, ...cancelQuote }
  }
}

export default { quote }
