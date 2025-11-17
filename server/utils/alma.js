import axios from 'axios'
// https://docs.almapay.com/reference/payment
// https://github.com/QuantedSquare/odysway-v2/tree/a4faa65862d98ead284e632d6e8a23b8be4c0f1c/server/api/v1/alma
const config = useRuntimeConfig()

const isDev = config.public.environment !== 'production'

const BASE_URL = isDev ? 'https://odysway-v2.vercel.app' : config.public.siteURL

const ALMA_KEY = isDev ? process.env.ALMA_KEY_DEV : process.env.ALMA_KEY_LIVE
const BASE_ALMA_URL = isDev ? 'https://api.sandbox.getalma.eu/v1/' : 'https://api.getalma.eu/v1/'
const BASE_IPN_URL = isDev ? 'https://odysway-v2.vercel.app' : config.public.siteURL

const headers = {
  'accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': ALMA_KEY,
}

const customAxios = axios.create({
  baseURL: BASE_ALMA_URL,
  headers,
})

const sendSlackNotification = (message) => {
  if (!isDev) {
    axios({
      url: process.env.SLACK_URL_PAIEMENTS,
      method: 'post',
      data: {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
        ],
      },
    }).catch((slackErr) => {
      console.warn('Failed to send Slack notification:', slackErr.message)
    })
  }
}

const createAlmaSession = async (order) => {
  if (!order.dealId) {
    throw new Error('dealId is required')
  }

  const [fetchedDeal, customFields] = await Promise.all([
    activecampaign.getDealById(order.dealId),
    activecampaign.getDealCustomFields(order.dealId),
  ])
  const deal = { ...fetchedDeal.deal, ...customFields }
  const { contact } = await activecampaign.getClientById(deal.contact)

  if (!deal.totalTravelPrice || deal.totalTravelPrice <= 0) {
    throw new Error('Invalid travel price')
  }
  if (!contact.email) {
    throw new Error('Missing customer email')
  }

  sendSlackNotification(`:eyes: <https://odysway90522.activehosted.com/app/deals/${deal.dealId}| Nouveau paiement ALMA - ${contact.firstName} ${contact.lastName} - Deal ID : ${deal.dealId}>`)

  if (deal.insurance && deal.insurance !== 'Aucune Assurance' && deal.insuranceCommissionPrice && deal.nbTravelers) {
    const insuranceItem = {
      amount_total: deal.insuranceCommissionPrice * deal.nbTravelers,
      description: `Assurance ${deal.insurance}`,
      quantity: deal.nbTravelers,
      price: {
        unit_amount: deal.insuranceCommissionPrice,
        currency: 'EUR',
      },
    }
    Object.assign(deal, { insuranceChoice: insuranceItem })
  }

  const successUrl = encodeURI(`${BASE_URL}/confirmation?voyage=${deal.slug}&purchase=true`)
  const cancelUrl = encodeURI(`${BASE_URL}${order.currentUrl}`)

  const paymentBody = {
    payment: {
      installments_count: 3,
      deferred_months: 0,
      deferred_days: 0,
      ipn_callback_url: `${BASE_IPN_URL}/api/v1/webhooks/alma/payments`,
      locale: 'fr',
      expires_after: 2880,
      capture_method: 'automatic',
      purchase_amount: deal.totalTravelPrice,
      return_url: successUrl || 'https://odysway.com',
      customer_cancel_url: cancelUrl || 'https://odysway.com',
      custom_data: deal,
    },
    customer: {
      first_name: contact.firstName || '',
      last_name: contact.lastName || '',
      email: contact.email,
    },
  }

  const res = await customAxios({
    url: 'payments',
    method: 'POST',
    data: paymentBody,
  }).catch((err) => {
    console.error('Erreur création de payement Alma', err.response?.data || err.message)
    throw new Error(`Alma payment creation failed: ${err.response?.data?.message || err.message}`)
  })
  return res.data
}

const insertAlmaId = async (paymentId) => {
  const { data, error } = await supabase.from('alma_ids').select('id').eq('id', paymentId).maybeSingle()
  if (error) {
    console.error('Supabase error retrieving alma id:', error)
    throw new Error(`Error retrieving alma id: ${error.message}`)
  }
  if (data) {
    console.log('Payment already handled in supabase:', paymentId)
    setResponseStatus(event, 200)
  }
  else {
    const { data, error } = await supabase
      .from('alma_ids')
      .insert([{ id: paymentId }])
      .select()
    if (error) {
      console.error('Error inserting alma ID:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Database error',
      })
    }
    console.log('Alma Paiement, inserted id in supabase:', data)
  }
}

const retrievePayment = async (paymentId) => {
  const res = await customAxios({
    url: `payments/${paymentId}`,
    method: 'GET',
  }).catch((err) => {
    console.error(`Payment not found for pid: ${paymentId}`, err.response?.data || err.message)
    throw new Error(`Failed to retrieve Alma payment: ${err.response?.data?.message || err.message}`)
  })
  if (res.data.processing_status === 'captured') {
    return res.data
  }
  else {
    throw new Error('Payment not captured')
  }
}

const handlePaymentSession = async (session) => {
  const method = 'Alma'
  const order = session.custom_data
  const totalPaidAlma = session.purchase_amount
  console.log('=========ALMA SESSION=========', session)
  console.log('=========TOTAL PAID VIA ALMA=========', totalPaidAlma)

  const [fetchedDeal, customFields] = await Promise.all([
    activecampaign.getDealById(order.id),
    activecampaign.getDealCustomFields(order.id),
  ])
  const deal = { ...fetchedDeal.deal, ...customFields }
  const { contact } = await activecampaign.getClientById(deal.contact)
  console.log('contact', contact)

  // BOOKING MANAGEMENT SUPABASE
  const { data: bookedDate, error } = await supabase
    .from('booked_dates')
    .update({ is_option: false, expiracy_date: null, booked_places: order.nbTravelers })
    .eq('deal_id', order.id)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating booked_dates', error)
  }
  else {
    const { data: allBooked, error: sumAllBookedError } = await supabase
      .from('booked_dates')
      .select('booked_places')
      .eq('travel_date_id', bookedDate.travel_date_id)
    if (sumAllBookedError) return { error: sumAllBookedError.message }

    const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
    console.log('totalBooked', totalBooked)
    // Update the travel_dates.booked_seat
    await supabase
      .from('travel_dates')
      .update({ booked_seat: totalBooked })
      .eq('id', bookedDate.travel_date_id)
  }

  // Chapka notify
  if (deal.insurance !== 'Aucune Assurance' && !isDev) {
    const inssuranceItem = order.insuranceChoice

    const sessionForChapka = {
      countries: Array.isArray(order.country) ? [...order.country] : [order.country],
      customer_details: {
        email: contact.email,
      },
      dealId: order.id,
    }

    const customFieldsForChapka = {
      ...customFields,
      pricePerTraveler: Math.ceil((totalPaidAlma / order.nbTravelers) - (deal.insuranceCommissionPrice * deal.nbTravelers)),
    }
    console.log('customFieldsForChapka', customFieldsForChapka)
    const isCapExploraction = deal.isCapExploraction === 'Oui' || deal.iso.includes('NP') || deal.iso.includes('PE') || false
    const chapkaNotify = chapka.notify(sessionForChapka, inssuranceItem, customFieldsForChapka, contact, isCapExploraction)
    console.log('===== Chapka notify sent =====', chapkaNotify)
  }

  const restToPay = +deal.value - totalPaidAlma

  console.log('====CUSTOM FIELDS=====', customFields)

  const dealData = {
    group: '2', // '2'= pipeline id of "Voyageurs"
    stage: +customFields.alreadyPaid > 0 ? '33' : '6', // first payment (full or acompte) => '33' = "Gestion résa (sales)" || '6' ="en attente de départ"
    alreadyPaid: totalPaidAlma,
    restToPay: restToPay,
    currentStep: totalPaidAlma === +deal.value
      ? 'Paiement OK'
      : 'Paiement en cours',
  }

  console.log('==== Deal data =====', dealData)

  await activecampaign.updateDeal(order.id, dealData)

  if (session.processing_status === 'captured') {
    const addedNote = activecampaign.addNote(order.id, {
      note: {
        note: `Paiement ${method} -  ${
          contact.firstName} ${contact.lastName} - ${contact.email} - ${totalPaidAlma / 100}€`,
      },

    })
    console.log('addedNote', addedNote)
  }
  if (session.processing_status === 'canceled') {
    const addedNote = activecampaign.addNote(order.id, {
      note: {
        note: `Paiement ${method} -  ${
          contact.firstName} ${contact.lastName} - ${contact.email} - ${totalPaidAlma / 100}€ - Paiement annulé`,
      },

    })
    console.log('addedNote', addedNote)
  }
  sendSlackNotification(`:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${order.id}|Confirmation paiement CB - ${method} - ${contact.firstName} ${contact.lastName} - ${order.id}>`)

  // axios({
  //   url: 'https://www.google-analytics.com/collect',
  //   method: 'post',
  //   params: {
  //     v: 1,
  //     tid: process.env.NODE_ENV === 'development' ? process.env.GOOGLE_ANALYTICS_TID_TEST : process.env.GOOGLE_ANALYTICS_TID_LIVE,
  //     cid: '555',
  //     t: 'event',
  //     ec: 'Transaction_Server',
  //     ea: 'Ping_Confirmation',
  //     el: '' + +order.selectedTravelersToPay,
  //     ev: +totalAmount,
  //   },
  // })
}

export default {
  createAlmaSession,
  retrievePayment,
  insertAlmaId,
  handlePaymentSession,
}
