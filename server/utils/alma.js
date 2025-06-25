import axios from 'axios'
// https://docs.almapay.com/reference/payment
// https://github.com/QuantedSquare/odysway-v2/tree/a4faa65862d98ead284e632d6e8a23b8be4c0f1c/server/api/v1/alma
const isDev = process.env.NODE_ENV === 'development'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const ALMA_KEY = isDev ? process.env.ALMA_KEY_DEV : process.env.ALMA_KEY_LIVE

const BASE_ALMA_URL = isDev ? 'https://api.sandbox.getalma.eu/v1/' : 'https://api.getalma.eu/v1/'
// const IPN_URL = isDev ? 'https://dev-dot-odysway-267314.ew.r.appspot.com' : 'https://odysway.com'
const IPN_URL = isDev ? 'https://odysway-v2.vercel.app' : 'https://odysway.com'

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
  const deal = { ...acDeal.deal, ...customFields }
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
      ipn_callback_url: `${IPN_URL}/api/v1/webhooks/alma/payments`,
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

// Error retrieving alma ids TypeError: data.map is not a function
const retrieveAlmaIds = async () => {
  try {
    const data = await supabase.from('alma_ids').select()
    console.log('data', data)
    return data.map(id => id.id)
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
  const totalAmount = session.purchase_amount

  console.log('ALMA SESSION in stripe module', session)

  const directPayment = !order.isSold && order.isPayment && !order.isAdvance // check here

  // Fetch Deal Data
  const fetchedDeal = await activecampaign.getDealById(order.id)
  const customFields = await activecampaign.getDealCustomFields(order.id)
  const deal = { ...fetchedDeal.deal, ...customFields }

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
    console.log('booked_dates updated', bookedDate)

    const { data: allBooked, error: sumAllBookedError } = await supabase
      .from('booked_dates')
      .select('booked_places')
      .eq('travel_date_id', bookedDate.travel_date_id)
    if (sumAllBookedError) return { error: sumAllBookedError.message }

    const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
    // Update the travel_dates.booked_seat
    await supabase
      .from('travel_dates')
      .update({ booked_seat: totalBooked })
      .eq('id', bookedDate.travel_date_id)
  }

  const { contact } = await activecampaign.getClientById(deal.contact)

  // Chapka notify

  // const inssuranceItem = order.insuranceChoice

  // console.log('INSSURANCE ITEM', inssuranceItem)

  // if (inssuranceItem && !isDev) {
  //   chapka.notify(order, inssuranceItem, customFields)
  // }

  if (deal.insurance !== 'Aucune Assurance' && !isDev) {
    const inssuranceItem = order.insuranceChoice
    Object.assign(deal, { pricePerTraveler: usePricePerTraveler(deal) })
    chapka.notify(session, inssuranceItem, deal)
    console.log('===== Chapka notify sent =====')
  }

  // AC Update toutes les valeur monaitaire sont en centimes
  const totalPaid = +(customFields.alreadyPaid || 0) + +(totalAmount)

  const restToPay = +deal.value - totalPaid

  // FALSE UNIQUEMENT SUR PAGE PAIEMENT ET REGLEMENT SOLDE
  const isAdvance = order.isAdvance === true || order.isAdvance === 'true'

  console.log('====CUSTOM FIELDS=====', customFields)

  const countUnderAge = +order.nbUnderAge || 0
  const countTeen = +order.nbChildren || 0

  const childrenReduction = countUnderAge * +order.promoChildren * 100 * !directPayment
  const teenReduction = countTeen * +order.promoChildren * 100 * !directPayment // check if special promo for teen
  // childrenReduction + teenReduction UNIQUEMENT AU PREMIER CALCUL
  const restToPayPerTraveler = (restToPay + childrenReduction + teenReduction) / (isAdvance ? +order.selectedTravelersToPay : (+customFields.restTravelersToPay - +order.selectedTravelersToPay))

  function restTravelerToPay() {
    if (totalPaid >= +deal.value) {
      return 0
    }
    else if (isAdvance) {
      return +order.selectedTravelersToPay
    }
    else {
      return +customFields.restTravelersToPay - +order.selectedTravelersToPay
    }
  }

  const dealData = {
    deal: {
      group: '2',
      stage: totalPaid >= +deal.deal.value ? '8' : '6',
      fields: [
        {
          customFieldId: 20,
          fieldValue: totalPaid >= +deal.deal.value
            ? 'Solde réglé'
            : 'Acompte réglé',
        },
        { customFieldId: 21, fieldValue: 'Paiement OK' }, // Lien paiement
        { customFieldId: 24, fieldValue: totalPaid }, // Field : AlreadyPaid
        { customFieldId: 44, fieldValue: restToPay }, // Field : restToPay
        { customFieldId: 28, fieldValue: restTravelerToPay() },
        { customFieldId: 66, fieldValue: totalPaid >= +deal.deal.value ? 0 : restToPayPerTraveler }, // Solde restant par Voyageur à régler
        { customFieldId: 82, fieldValue: customFields.paiementMethod ? `${customFields.paiementMethod} ${method}` : method }, // Payment method
      ],
    },
  }

  console.log('====DealDataFromWebhookStripe=====', dealData.deal.fields)

  activecampaign.updateDeal(order.id, dealData)

  activecampaign.addNote(order.id, {
    note: {
      note: `Paiement CB - ${method} -  ${
        deal.firstName} ${deal.lastName} - ${deal.email} - ${totalAmount / 100}€`,
    },
  })

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
