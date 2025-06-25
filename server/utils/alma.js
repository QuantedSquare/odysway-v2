import axios from 'axios'
// https://docs.almapay.com/reference/payment
// https://github.com/QuantedSquare/odysway-v2/tree/a4faa65862d98ead284e632d6e8a23b8be4c0f1c/server/api/v1/alma
const config = useRuntimeConfig()

const isDev = config.public.environment !== 'production'

const BASE_URL = isDev ? 'https://odysway-v2-git-feat-alma-quanted-square.vercel.app' : 'https://odysway.com'

const ALMA_KEY = isDev ? process.env.ALMA_KEY_DEV : process.env.ALMA_KEY_LIVE
const BASE_ALMA_URL = isDev ? 'https://api.sandbox.getalma.eu/v1/' : 'https://api.getalma.eu/v1/'
const BASE_IPN_URL = isDev ? 'https://odysway-v2-git-feat-alma-quanted-square.vercel.app' : 'https://odysway.com'

const headers = {
  'accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': ALMA_KEY,
}

const createAlmaSession = async (order) => {
  if (!order.dealId) {
    throw new Error('dealId is required')
  }

  const acDeal = await activecampaign.getDealById(order.dealId)
  const customFields = await activecampaign.getDealCustomFields(order.dealId)
  const deal = { ...acDeal.deal, ...customFields, paymentType: order.paymentType }
  const { contact } = await activecampaign.getClientById(deal.contact)

  if (!deal.totalTravelPrice || deal.totalTravelPrice <= 0) {
    throw new Error('Invalid travel price')
  }
  if (!contact.email || !contact.firstName || !contact.lastName) {
    throw new Error('Missing customer information')
  }

  if (!isDev) {
    try {
      await axios({
        url: process.env.SLACK_URL_PAIEMENTS,
        method: 'post',
        data: {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `:eyes: <https://odysway90522.activehosted.com/app/deals/${deal.dealId}| Nouveau paiement ALMA - ${contact.firstName} ${contact.lastName} - Deal ID : ${deal.dealId}>`,
              },
            },
          ],
        },
      })
    }
    catch (slackErr) {
      console.warn('Failed to send Slack notification:', slackErr.message)
    }
  }

  if (deal.insurance && deal.insurance !== 'Aucune Assurance' && deal.insuranceCommissionPrice && deal.nbTravelers) {
    const insuranceItem = {
      amount_total: deal.insuranceCommissionPrice * deal.nbTravelers,
      description: deal.insurance,
      quantity: deal.nbTravelers,
      price: {
        unit_amount: deal.insuranceCommissionPrice,
        currency: 'EUR',
      },
    }
    Object.assign(deal, { insuranceChoice: insuranceItem })
  }

  const successUrl = encodeURI(`${BASE_URL}/confirmation?voyage=${deal.slug}`)
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
      return_url: successUrl,
      customer_cancel_url: cancelUrl,
      custom_data: deal,
    },
    customer: {
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    },
  }

  try {
    const res = await axios({
      url: BASE_ALMA_URL + 'payments',
      method: 'POST',
      headers,
      data: paymentBody,
    })
    return res.data
  }
  catch (err) {
    console.error('Erreur création de payement Alma', err.response?.data || err.message)
    throw new Error(`Alma payment creation failed: ${err.response?.data?.message || err.message}`)
  }
}

const retrieveAlmaIds = async () => {
  try {
    const { data, error } = await supabase.from('alma_ids').select()
    if (error) {
      console.error('Supabase error retrieving alma ids:', error)
      throw new Error(`Error retrieving alma ids: ${error.message}`)
    }
    return data ? data.map(row => row.id) : []
  }
  catch (error) {
    console.error('Error retrieving alma ids', error)
    throw new Error('Error retrieving alma ids')
  }
}

const retrievePayment = async (paymentId) => {
  try {
    const res = await axios({
      url: `${BASE_ALMA_URL}payments/${paymentId}`,
      method: 'GET',
      headers,
    })
    return res.data
  }
  catch (err) {
    console.error('Error retrieving Alma payment:', err.response?.data || err.message)
    throw new Error(`Failed to retrieve Alma payment: ${err.response?.data?.message || err.message}`)
  }
}

const handlePaymentSession = async (session) => {
  const method = 'Alma'
  const order = session.custom_data
  const totalAmount = session.custom_data.totalTravelPrice

  console.log('ALMA SESSION in stripe module', session)

  // Fetch Deal Data
  const fetchedDeal = await activecampaign.getDealById(order.id)
  const customFields = await activecampaign.getDealCustomFields(order.id)
  const deal = { ...fetchedDeal.deal, ...customFields }

  console.log('fetchedDeal', fetchedDeal)
  console.log('customFields', customFields)
  console.log('deal', deal)

  // BOOKING MANAGEMENT SUPABASE
  const { data: bookedDate, error } = await supabase
    .from('booked_dates')
    .update({ is_option: false, expiracy_date: null, booked_places: order.nbTravelers })
    .eq('deal_id', order.id)
    .select('*')
    .single()

  console.log('bookedDate', bookedDate)
  if (error) {
    console.error('Error updating booked_dates', error)
  }
  else {
    console.log('booked_dates updated', bookedDate)

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

  const { contact } = await activecampaign.getClientById(deal.contact)
  console.log('contact', contact)
  // Chapka notify

  if (deal.insurance !== 'Aucune Assurance' && !isDev) {
    const inssuranceItem = order.insuranceChoice
    Object.assign(deal, { pricePerTraveler: usePricePerTraveler(deal) })
    chapka.notify(session, inssuranceItem, deal)
    console.log('===== Chapka notify sent =====')
  }

  // AC Update toutes les valeurs monaitaires sont en centimes
  const totalPaid = +(customFields.alreadyPaid || 0) + +(totalAmount)

  const restToPay = +deal.value - totalPaid

  console.log('====CUSTOM FIELDS=====', customFields)

  const dealData = {
    group: '2',
    stage: +customFields.alreadyPaid > 0 ? '33' : '6', // check étape en cours
    alreadyPaid: totalPaid,
    restToPay: restToPay,
    currentStep: totalPaid === +deal.value
      ? 'Alma - Paiement OK'
      : 'Alma - Paiement en cours',
  }

  console.log('==== Deal data =====', dealData.deal.fields)

  const updatedDeal = await activecampaign.updateDeal(order.id, dealData)
  console.log('updatedDeal', updatedDeal)

  const addedNote = await activecampaign.addNote(order.id, {
    note: {
      note: `Paiement CB - ${method} -  ${
        deal.firstName} ${deal.lastName} - ${deal.email} - ${totalAmount / 100}€`,
    },
  })
  console.log('addedNote', addedNote)
  if (!isDev) {
    axios({
      url: process.env.SLACK_URL_PAIEMENTS,
      method: 'post',
      data:
        {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${order.id}|Confirmation paiement CB - ${method} - ${contact.firstName} ${contact.lastName} - ${order.id}>`,
              },
            },
          ],
        },
    })

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
}

export default {
  retrieveAlmaIds,
  createAlmaSession,
  handlePaymentSession,
  retrievePayment,
}
