import axios from 'axios'
import dayjs from 'dayjs'

const brevoHeaders = {
  'api-key': process.env.BREVO_API_KEY,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

// Todo
// Refaire le update contact pour qu'il aille dans la bonne list
//  - Besoin du webhook AC pour supprimer de certaines listes
// Check que les data envoyer pour la route smtp email sont bien celles demander par le template.

const apiRequest = async (path, method = 'get', data = null) => {
  try {
    const options = {
      url: `https://api.brevo.com/v3${path}`,
      method,
      headers: brevoHeaders,
      data,
    }
    console.log('========options=======', options)
    const response = await axios.request(options).then((res) => {
      console.log('========response=======', res)
      return res
    })
    return response
  }
  catch (error) {
    console.error(`API Error in ${path}:`, error.message)
    throw error
  }
}

const brevoKeysMap = {
  SMS: 'phone',
  VOYAGE: 'title',
  SITUATION: 'state',
  FORMULE: 'travelType',
  UTM_SOURCE_ORIGINE: 'utmParam',
  NOM: 'lastName',
  PRENOM: 'fisrtName',
}

const brevoKeys = Object.keys(brevoKeysMap)

function formatDate(orderDate) {
  if (orderDate) {
    return dayjs(orderDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  }
  else { return '' }
}

function mapOrderContactData(data) {
  const contactData = { attributes: {} }

  contactData.attributes.DATE_DEPART = formatDate(data.departureDate)
  contactData.attributes.DATE_RETOUR = formatDate(data.returnDate)

  brevoKeys.forEach((key) => {
    if (data[brevoKeysMap[key]]) {
      contactData.attributes[key] = data[brevoKeysMap[key]]
    }
  })

  return contactData
}
// =================== MODULE EXPORT ===============
const brevo = {
  async updateContact(email, data) {
    console.log('brevo update contact', email, data)

    const contactData = mapOrderContactData(data)
    contactData.email = email
    contactData.updateEnabled = true
    contactData.listIds = data.listIds
    console.log('========contactData avec Mapping=======', contactData)

    try {
      const response = await apiRequest('/contacts', 'post', contactData)
      console.log('========response=======', response)
      return response
    }
    catch (err) {
      console.log('error post updatecontact brevo', err.response.data)
      console.log('with this brevo data', contactData)
      return err.response.data
    }
  },
  // Prospects: 12,
  // Clients: 14,
  // Perdu: 13,
  // 'Optin Newsletter': 18,

  // CHeck if useless
  async updateContactListId(email, listId) {
    try {
      const response = await apiRequest('/contacts', 'post', {
        email,
        listIds: [listId],
      })
      console.log('========response=======', response)
      return response
    }
    catch (err) {
      console.log('========err=======', err)
      apiRequest(`/contacts/${email}`, 'put', {
        email,
        listIds: [listId],
      }).catch((error) => {
        console.log('put error sendinblu', error.response)
      })
    }
  },

  // UNUSED FOR NOW
  sendEmail(template, order, travel) {
    return apiRequest('/smtp/email', 'post', {
      templateId: template,
      to: [{
        name: order.firstname || order.client,
        email: order.email,
      }],
      params: { ...order, ...travel },
    })
  },
}
export default brevo
