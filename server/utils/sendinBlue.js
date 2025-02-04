import axios from 'axios'
import dayjs from 'dayjs'

const sendinBlueHeaders = {
  'api-key': process.env.SENDINBLUE_API_KEY,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

// Todo
// Refaire le update contact pour qu'il aille dans la bonne list
//  - Besoin du webhook AC
// Check que les data envoyer pour la route smtp email sont bien celles demander par le template.

function request(path, data, method) {
  return axios({
    url: 'https://api.sendinblue.com/v3' + path,
    method,
    headers: sendinBlueHeaders,
    data,
  })
}

function post(path, data) {
  return request(path, data, 'post')

  // try {
  //   const res = await request(path, data, 'post')
  //   return res
  // } catch (err) {
  //   console.log('error post sendinblue', err.response)
  // }
}

const sendinBlueKeysMap = {
  SMS: 'phone',
  VOYAGE: 'title',
  SITUATION: 'state',
  FORMULE: 'travelType',
  UTM_SOURCE_ORIGINE: 'utmParam',
  NOM: 'lastName',
  PRENOM: 'fisrtName',
}

const sendinBlueKeys = Object.keys(sendinBlueKeysMap)

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

  sendinBlueKeys.forEach((key) => {
    if (data[sendinBlueKeysMap[key]]) {
      contactData.attributes[key] = data[sendinBlueKeysMap[key]]
    }
  })

  return contactData
}
// =================== MODULE EXPORT ===============
const sendinBlue = {
  async updateContact(email, data) {
    // console.log('sendinblue update contact', email, data)

    const contactData = mapOrderContactData(data)
    contactData.email = email
    contactData.updateEnabled = true

    try {
      await post('/contacts', contactData)
    }
    catch (err) {
      console.log('error post updatecontact sendinblue', err.response.data)
      console.log('with this sendinblue data', contactData)
      await request(`/contacts/${email}`, contactData, 'put')
    }

    return true
  },
  // Prospect: 12,
  // Payé: 14, // Clients sur sendinblue
  // Perdu: 13,
  // 'Optin Newsletter': 18,
  // 'Ebook': 20, // This is the Guide in real life
  //  Ebook: 19,
  // "Demande d'infos": 15 // Not needed anymore
  async updateContactListId(email, listId) {
    try {
      await post('/contacts', {
        email,
        listIds: [listId],
      })
    }
    catch (err) {
      request(`/contacts/${email}`, {
        email,
        listIds: [listId],
      }, 'put').catch((error) => {
        console.log('put error sendinblu', error.response)
      })
    }
    return true
  },
  sendEmail(template, order, travel) {
    return post('/smtp/email', {
      templateId: template,
      to: [{
        name: order.firstname || order.client,
        email: order.email,
      }],
      params: { ...order, ...travel },
    })
  },
}
export default sendinBlue
