import axios from 'axios'
import dayjs from 'dayjs'
import supabase from './supabase'

const baseUrl = process.env.ACTIVE_CAMPAIGN_URL
const headers = {
  'Api-Token': process.env.ACTIVE_CAMPAIGN_API_KEY,
}

// Custom Fields Mapping
const customFieldsMapDeal = {
  1: 'forecastedClosingDate',
  2: 'departureDate',
  30: 'returnDate',
  4: 'nbTravelers',
  5: 'nbAdults',
  6: 'nbChildren',
  7: 'promoCode',
  8: 'isFlight',
  9: 'travelType',
  29: 'isCouple',
  11: 'specialRequest',
  12: 'insurance',
  13: 'insuranceCommissionPrice',
  14: 'marginPerTraveler',
  15: 'totalMargin',
  16: 'flightMargin',
  17: 'country',
  18: 'pricePerTraveler',
  19: 'indivRoom',
  20: 'currentStep',
  21: 'paiementLink',
  22: 'slug',
  23: 'image',
  24: 'alreadyPaid',
  25: 'travelBook',
  26: 'flightTickets',
  27: 'insuranceContract',
  28: 'restTravelersToPay',
  31: 'CalendlyType',
  32: 'CalendlyDate',
  33: 'traveler1',
  34: 'traveler2',
  35: 'traveler3',
  36: 'traveler4',
  37: 'traveler5',
  38: 'traveler6',
  39: 'traveler7',
  40: 'traveler8',
  41: 'otherReasonLost',
  42: 'ReasonLost',
  43: 'flightTicketBought',
  44: 'restToPay',
  45: 'utm',
  46: 'includedFlight',
  47: 'insuranceCommissionPerTraveler',
  56: 'depositPrice',
  57: 'basePricePerTraveler',
  60: 'iso',
  62: 'zoneChapka',
  59: 'indivRoomPrice',
  48: 'promoValue',
  66: 'restToPayPerTraveler',
  67: 'totalTravelPrice',
  69: 'flightPrice',
  71: 'extensionPrice',
  55: 'promoChildren',
  72: 'maxChildrenAge',
  73: 'promoTeen',
  74: 'maxTeenAge',
  75: 'nbUnderAge',
  76: 'nbTeen',
  77: 'conversionDate',
  78: 'oldCreationDate',
  79: 'oldOwner',
  80: 'source',
  81: 'forcedIndivRoom',
  82: 'paiementMethod',
  85: 'promoEarlybird',
  86: 'gotEarlybird',
  95: 'promoLastMinute',
  96: 'gotLastMinute',
}
const customFieldsMapContact = {
  1: 'birthdate',
  2: 'passId',
  3: 'adress',
  4: 'city',
  5: 'zipCode',
  6: 'calendlyType',
  7: 'calendlyDate',
  8: 'whichTravel',
  10: 'gotQuestions',
}

// =================== Utility Functions ===================
const findCustomFieldValue = (fieldValues, fieldId) => {
  return fieldValues.find(i => i.customFieldId === fieldId)?.fieldValue || null
}

const handleCustomFields = (fields, fieldMap) =>
  fields.reduce((acc, field) => {
    const key = fieldMap[field.customFieldId]
    acc[key] = Array.isArray(field.fieldValue)
      ? field.fieldValue[0]
      : field.fieldValue
    return acc
  }, {})

const reverseCustomFieldsMap = (fields, fieldMap) => {
  // Create a reverse map: { readableKey: customFieldId }
  const reversedMap = Object.entries(fieldMap).reduce((acc, [id, key]) => {
    acc[key] = Number(id)
    return acc
  }, {})

  return Object.entries(fields)
    .map(([key, value]) => {
      if (reversedMap[key]) {
        return { customFieldId: reversedMap[key], fieldValue: value }
      }
      return null // Ignore fields that are not in the mapping
    })
    .filter(Boolean) // Remove null values
}

const transformDealForAPI = (flatDeal) => {
  const {
    contact, currency, group, owner, stage, title, value,
    firstname, lastname, email, phone,
    ...fields
  } = flatDeal
  return {
    deal: {
      contact,
      currency,
      fields: reverseCustomFieldsMap(fields, customFieldsMapDeal), // Wrap fields in an arrays
      group,
      owner,
      stage,
      title,
      value,
    },
    firstname,
    lastname,
    email,
    phone,
  }
}

// API Request Method
const apiRequest = async (endpoint, method = 'get', data = null) => {
  try {
    const response = await axios({
      url: `${baseUrl}${endpoint}`,
      method,
      headers,
      data,
    })
    console.log(`API Response from ${endpoint}:`, response.data)
    return response.data
  }
  catch (error) {
    console.error(`API Error in ${endpoint}:`, error.message)
    throw error
  }
}

// =================== CONTACT ===================
const getClientById = async id => await apiRequest(`/contacts/${id}`)

const getClientByEmail = async email => await apiRequest(`/contacts?email=${email}`)

const upsertContact = async (contactData) => {
  // #TODO Checker si sendinblue encore nécessaire
  // sendinBlue.updateContact(contactData.contact.email, contactData.contact)
  const response = await apiRequest('/contact/sync', 'post', contactData)
  return response.contact
}

const upsertContactIntoSupabase = async (contactId) => {
  try {
    const acContact = await getClientById(contactId)
    const contactToUpsert = {
      id: contactId,
      contact: contactId,
      created_at: acContact.contact.cdate,
      firstname: acContact.contact.firstName || null,
      lastname: acContact.contact.lastName || null,
      email: acContact.contact.email,
      birthdate: acContact.contact.fieldValues.find(i => i.field === '1')?.value
        ? dayjs(acContact.contact.fieldValues.find(i => i.field === '1').value, 'YYYY-MM-DD').toISOString()
        : null,
      city: findCustomFieldValue(acContact.contact.fieldValues, '4'),
      zip_code: +findCustomFieldValue(acContact.contact.fieldValues, '5') || null,
    }

    const { error, data } = await supabase
      .from('activecampaign_clients')
      .upsert(contactToUpsert)
      .select()

    if (error) console.error('Supabase upsert error:', error)
    return data
  }
  catch (err) {
    console.error('Contact upsert error:', err)
    throw createError({
      statusCode: 400,
      message: 'Error upserting contact',
    })
  }
}

// =================== DEAL ===================
const getDealById = async id => await apiRequest(`/deals/${id}`)

const getDealCustomFields = async (dealId) => {
  const response = await apiRequest(`/deals/${dealId}/dealCustomFieldData`)
  return handleCustomFields(response.dealCustomFieldData, customFieldsMapDeal)
}

const createDeal = async (data) => {
  // #TODO Checker si sendinblue encore nécessaire
  // sendinBlue.updateContact(data.email, Object.assign({}, data.dealData.deal, this.handleCustomFields(dealData.deal.fields)))
  // sendinBlue.updateContactListId(data.email, 12) // Prospect
  // First upsert contact
  const formatedDeal = transformDealForAPI(data)
  const client = {
    contact: {
      email: data.email,
      firstName: data.firstname,
      lastName: data.lastname,
      phone: `${data.phone}`,
    },
  }

  const contact = await upsertContact(client)

  formatedDeal.deal.contact = contact.id

  delete formatedDeal.firstname
  delete formatedDeal.lastname
  delete formatedDeal.email
  delete formatedDeal.phone

  const response = await apiRequest('/deals', 'post', formatedDeal)
  if (response.deal.id) {
    await sendSlackNotification(response.deal.id, formatedDeal)
  }
  return response.deal.id
}

const updateDeal = async (dealId, data) => {
  // #TODO Checker si sendinblue encore nécessaire
  //  sendinBlue.updateContact(data.email, this.handleCustomFields(data.deal.fields))
  const formatedDeal = transformDealForAPI(data)
  if (data.email) {
    const client = {
      contact: {
        email: data.email,
        firstName: data.firstname,
        lastName: data.lastname,
        phone: `${data.phone}`,
      },
    }
    // l'user peut s'être trompé d'infos, on update le contact
    const contact = await upsertContact(client)

    formatedDeal.deal.contact = contact.id

    delete formatedDeal.firstname
    delete formatedDeal.lastname
    delete formatedDeal.email
    delete formatedDeal.phone
  }
  const response = await apiRequest(`/deals/${dealId}`, 'put', formatedDeal)
  return response.deal.id
}

const getAllDeal = async id => await apiRequest(`/contacts/${id}/deals`)

const addNote = async (dealId, data) => await apiRequest(`/deals/${dealId}/notes`, 'post', data)

const retrieveOwner = async (dealId) => {
  try {
    const res = await apiRequest(`/deals/${dealId}/owner`)
    return `${res.user.firstName} ${res.user.lastName}`
  }
  catch (err) {
    console.error('error retrieve owner', err)
  }
}

// ============ Notification slack  ============
const sendSlackNotification = (id, data) => {
  if (process.env.NODE_ENV === 'development') return
  if (id && data) {
    const dealData = data.deal
    const travelType = findCustomFieldValue(dealData.fields, 9)
    const nbTravelers = findCustomFieldValue(dealData.fields, 4)

    const emoji = travelType === 'Voyage de Groupe' ? ':rocket: ' : ':female-technologist:'
    axios({
      url: process.env.SLACK_URL_DEVIS,
      method: 'post',
      data:
        {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `${emoji} <https://odysway90522.activehosted.com/app/deals/${id}|${travelType} - ${data.firstname} ${data.lastname} - pax ${nbTravelers} - ${dealData.title}>`,
              },
            },
          ],
        },
    })
  }
  return id
}

const optionNotification = async (session) => {
  try {
    const deal = await getDealById(session.dealId)
    const client = await getClientById(deal.deal.contact)

    axios({
      url: process.env.SLACK_URL_POSE_OPTION,
      method: 'post',
      data:
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:open_book: <https://odysway90522.activehosted.com/app/deals/${session.dealId}|${session.title} - ${client.contact.firstName} ${client.contact.lastName} - pax ${session.nbTravelers}>`,
            },
          },
        ],
      },
    })
  }
  catch (err) {
    console.log('Error get client by id', err)
  }
}

export default {
  // --- Utils ---
  handleCustomFields: deal => handleCustomFields(deal, customFieldsMapDeal), // A Checker
  handleContactCustomFields: contact => handleCustomFields(contact.fieldValues, customFieldsMapContact), // A Checker
  transformDealForAPI,
  // --- Clients ---
  getClientById, // OK
  getClientByEmail, // OK
  upsertContact, // OK
  upsertContactIntoSupabase,
  // --- Deals ---
  getDealById, // OK
  getDealCustomFields, // OK
  getAllDeal, // OK
  retrieveOwner,
  createDeal, // OK
  updateDeal,
  addNote,
  // --- Notification ---
  sendSlackNotification, // OK
  optionNotification,
}
