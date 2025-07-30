import axios from 'axios'

import { stripeCLI } from './stripeCLI'

const config = useRuntimeConfig()

const createCheckoutSession = async (order) => {
  console.log('order', order)

  const [fetchedDeal, customFields] = await Promise.all([
    activecampaign.getDealById(order.dealId),
    activecampaign.getDealCustomFields(order.dealId),
  ])
  console.log('===========fetchedDeal in stripe.js===========', fetchedDeal)
  const deal = { ...fetchedDeal.deal, ...customFields }

  const isDev = config.public.environment !== 'production'
  const origin = config.public.siteURL
  console.log('======Origin======', origin, 'isDev', isDev)
  console.log('======Config======', config.public)
  console.log('======Success URL======', `${origin}/success`)
  console.log('======Cancel URL======', `${origin}${order.currentUrl}`)
  const imageUrl = 'https://dev.odysway.com/logos/Logo-Odysway-Bleu.png'

  const lineItems = []
  let paidAmount = 0
  let coupon = null

  function calculatDepositeValue(data) {
    // WE take the total value of the deal, we substract the flight price and the insurance price
    const baseToCalculateDepositValue = +data.value - ((data.includeFlight === 'Oui' ? data.flightPrice : 0) * data.nbTravelers) - ((data.insuranceCommissionPrice ?? 0) * data.nbTravelers)
    // We take 30% of the baseToCalculateDepositValue (which include options and reduction) and add the flight price if it's included
    // Insurance is added in another line item
    return Math.floor((baseToCalculateDepositValue) * 0.3 + (data.includeFlight === 'Oui' ? data.flightPrice : 0) * data.nbTravelers)
  }
  const gotEarlyBird = deal.gotEarlybird === 'Oui'
  const gotLastMinute = deal.gotLastMinute === 'Oui'
  const baseTravelerPrice = +deal.basePricePerTraveler + ((deal.flightPrice > 0 && deal.includeFlight === 'Oui') ? +deal.flightPrice : 0) - (gotEarlyBird ? +deal.promoEarlybird : 0) - (gotLastMinute ? +deal.promoLastMinute : 0)
  // console.log('baseTravelerPrice', baseTravelerPrice, deal.basePricePerTraveler, deal.flightPrice, deal.promoEarlybird, deal.promoLastMinute)
  if (order.paymentType === 'deposit') {
    const depositValue = calculatDepositeValue(deal)
    console.log('depositValue', depositValue)
    lineItems.push(
      {
        // Travel Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: deal.title,
            images: [imageUrl],
            description: 'Paiement de l\'acompte, les options et réductions seront appliquées au paiement du solde', // : 'Paiement du solde',
          },
          unit_amount: depositValue,
        },
        quantity: 1,
      })
    paidAmount += depositValue

    if (deal.insurance !== 'Aucune Assurance' && +deal.insuranceCommissionPrice > 0) {
      lineItems.push({
        // Insurances Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Assurance ' + deal.insurance,
            images: [order.insuranceImg],
          },
          unit_amount: +deal.insuranceCommissionPrice,
        },
        quantity: +deal.nbTravelers,
      })
      paidAmount += +deal.insuranceCommissionPrice * +deal.nbTravelers
    }
  }

  if (order.paymentType === 'balance') {
    lineItems.push(
      {
        // Travel Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: deal.title,
            images: [imageUrl],
            description: 'Paiement du solde',
          },
          unit_amount: +deal.restToPay,
        },
        quantity: 1,
      })
    paidAmount += +deal.restToPay
  }
  if (order.paymentType === 'custom') {
    lineItems.push(
      {
        // Travel Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: deal.title,
            images: [imageUrl],
            description: 'Règlement personnalisé, extension voyage',
          },
          unit_amount: +order.amount,
        },
        quantity: 1,
      })
    paidAmount += +order.amount
  }
  else if (order.paymentType === 'full') {
    paidAmount += +deal.value
    lineItems.push(
      {
        // Travel Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: deal.title,
            images: [imageUrl],
            description: 'Tarif Adulte ',
          },
          unit_amount: baseTravelerPrice,
        },
        quantity: +deal.nbAdults,
      })
    if (+deal.nbUnderAge > 0) {
      lineItems.push(
        {
          // Travel Fees
          price_data: {
            currency: 'eur',
            product_data: {
              name: deal.title,
              images: [imageUrl],
              description: 'Tarif Enfant ',
            },
            unit_amount: baseTravelerPrice - +deal.promoChildren,
          },
          quantity: +deal.nbUnderAge,
        })
    }
    if (deal.nbTeen > 0) {
      lineItems.push(
        {
          // Travel Fees
          price_data: {
            currency: 'eur',
            product_data: {
              name: deal.title,
              images: [imageUrl],
              description: 'Tarif Adolescent ',
            },
            unit_amount: baseTravelerPrice - +deal.promoTeen,
          },
          quantity: +deal.nbTeen,
        })
    }
    if (deal.insurance !== 'Aucune Assurance' && +deal.insuranceCommissionPrice > 0) {
      lineItems.push({
        // Insurances Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: deal.insurance,
            images: [order.insuranceImg],
          },
          unit_amount: +deal.insuranceCommissionPrice,
        },
        quantity: +deal.nbTravelers,
      })
    }
    if (+deal.indivRoom === 'Oui' && +deal.indivRoomPrice > 0) {
      lineItems.push({
        // Insurances Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Chambre individuelle',
            images: ['https://odysway.com/logos/logo_noir.png'],
          },
          unit_amount: +deal.indivRoomPrice,
        },
        quantity: +deal.nbTravelers,
      })
    }
    if (deal.extensionPrice > 0) {
      lineItems.push({
        // Insurances Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Extension voyage',
            images: ['https://odysway.com/logos/logo_noir.png'],
          },
          unit_amount: +deal.extensionPrice,
        },
        quantity: +deal.nbTravelers,
      })
    }
    if (deal.alreadyPaid > 0) {
      coupon = await stripeCLI.coupons.create({
        amount_off: deal.alreadyPaid, // in cents
        currency: 'eur',
        name: 'Credit pour paiement déjà effectué',
        duration: 'once',
        redeem_by: Math.floor(Date.now() / 1000) + 3600 * 24 * 1, // 1 jour
      })
    }
  }
  console.log('LineItems', lineItems)

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
              text: `:eyes: <https://odysway90522.activehosted.com/app/deals/${order.dealId}|Nouveau paiement CB - ${order.contact.firstName} ${order.contact.lastName} - Deal ID : ${order.dealId}>`,
            },
          },
        ],
      },
    })
  }
  const { contact } = await activecampaign.getClientById(deal.contact)
  //     // Stripe only accept strings for metadata
  delete order.insurances
  delete order.options
  delete order.indivRoomPrice
  delete order.insurancePricePerTraveler
  delete order.contact

  // Changer et récupérer le contact d'ac
  console.log('contact retrieved', contact)
  const existingCustomers = await stripeCLI.customers.list({
    email: contact.email,
    limit: 1,
  })

  let customer

  // If customer exists, use that customer
  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0]

    // Update customer name if changed
    if (customer.name !== contact.firstName + ' ' + contact.lastName) {
      customer = await stripeCLI.customers.update(customer.id, {
        name: contact.firstName + ' ' + contact.lastName,
      })
    }
    console.log('customer updated', customer)
  }
  else {
    // Create new customer if not found
    customer = await stripeCLI.customers.create({
      email: contact.email,
      name: contact.firstName + ' ' + contact.lastName,
      metadata: order,
      phone: contact.phone,
    })
    console.log('customer created', customer)
  }

  // Now use customer.id in your checkout session
  Object.assign(order, { customer: customer.id, paidAmount })
  console.log('order before session', order)

  // Ensure URLs are properly encoded
  let forcedOrigin = isDev ? 'https://dev.odysway.com' : config.public.siteURL
  const successUrl = encodeURI(`${forcedOrigin}/confirmation?voyage=${deal.slug}&purchase=true`)
  const cancelUrl = encodeURI(`${forcedOrigin}${order.currentUrl}`)

  console.log('Final URLs:', {
    successUrl,
    cancelUrl,
    origin,
    currentUrl: order.currentUrl,
  })

  try {
    const session = await stripeCLI.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      discounts: coupon ? [{ coupon: coupon.id }] : [],
      customer: customer.id,
      invoice_creation: { enabled: true },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: order,
      payment_intent_data: {
        metadata: order,
      },
      after_expiration: {
        recovery: {
          enabled: true,
        },
      },
      currency: 'eur',
      payment_method_types: [
        'customer_balance',
        'card',
      ],
      payment_method_options: {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'eu_bank_transfer',
            eu_bank_transfer: {
              country: 'FR',
            },
          },
        },
      },
    })

    console.log('====CREATE STRIPE SESSION======', session)
    return session.url
  }
  catch (error) {
    console.error('Stripe session creation error:', error)
    throw error
  }
}

// ===== HANDLE PAYMENT SESSION =====
const handlePaymentSession = async (session, paymentType) => {
  let checkoutId
  if (paymentType === 'Virement') {
    const checkoutSession = await stripeCLI.checkout.sessions.list({
      payment_intent: session.id,
    })
    checkoutId = checkoutSession.data[0].id
    session = checkoutSession.data[0]
  }
  else {
    checkoutId = session.id
  }
  console.log('In handlePaymentSession || paymentType:', paymentType, 'checkoutId', checkoutId, 'session', session)

  const isDev = config.public.environment !== 'production'

  const order = session.metadata
  console.log('SESSION METADATA as ORDER', order)

  const reponse = await activecampaign.getDealById(order.dealId)
  const customFields = await activecampaign.getDealCustomFields(order.dealId)
  const deal = { ...reponse.deal, ...customFields }

  const calculatePricePerPerson = (data) => {
    const {
      basePricePerTraveler,
      nbTravelers,
      flightPrice = 0,
      extensionPrice = 0,
      promoChildren = 0,
      nbChildren = 0,
      promoTeen = 0,
      nbTeen = 0,
      earlybirdAvailable = 'Non',
      promoEarlybird = 0,
      lastMinuteAvailable = 'Non',
      promoLastMinute = 0,
      promoValue = 0,
    } = data

    let price = basePricePerTraveler * nbTravelers

    price += flightPrice * nbTravelers
    price += extensionPrice * nbTravelers

    if (promoChildren && nbChildren) {
      price -= promoChildren * nbChildren
    }

    if (promoTeen && nbTeen) {
      price -= promoTeen * nbTeen
    }

    if (earlybirdAvailable === 'Oui' && promoEarlybird) {
      price -= earlybirdAvailable * promoEarlybird * nbTravelers
    }

    if (lastMinuteAvailable === 'Oui' && promoLastMinute) {
      price -= lastMinuteAvailable * promoLastMinute * nbTravelers
    }

    if (promoValue) {
      price -= promoValue * nbTravelers
    }

    return Math.ceil(price / nbTravelers)
  }

  // BOOKING MANAGEMENT SUPABASE
  const { data: bookedDate, error } = await supabase
    .from('booked_dates')
    .update({ is_option: false, expiracy_date: null, booked_places: deal.nbTravelers })
    .eq('deal_id', order.dealId)
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

  //   // Fetch Deal Data
  console.log('Passed deal retrieving', deal)

  const { contact: client } = await activecampaign.getClientById(deal.contact)
  console.log('Passed client retrieving', client)
  //   // Chapka notify
  if (deal.insurance !== 'Aucune Assurance' && !isDev && (order.paymentType === 'full' || order.paymentType === 'deposit')) {
    const { data: lineItems } = await stripeCLI.checkout.sessions.listLineItems(checkoutId)
    session.lineItems = lineItems
    console.log('LineItems', lineItems)
    const inssuranceItem = lineItems.find((item) => {
      return [
        'Assurance Multirisque',
        'Assurance Annulation',
        'Assurance Assistance',
      ].includes(item.description)
    })
    Object.assign(deal, { pricePerTraveler: calculatePricePerPerson(deal) })
    console.log('InssuranceItem', inssuranceItem)
    if (inssuranceItem) {
      session.metadata.customer_details.email = client.email
      chapka.notify(session.metadata, inssuranceItem, deal)
      console.log('Chapka notify')
    }
  }

  // AC Update toutes les valeur monaitaire sont en centimes
  const totalPaid = +(deal.alreadyPaid || 0) + +(session.amount_total)
  const restToPay = +deal.value - totalPaid

  console.log('totalPaid', totalPaid, restToPay)
  const dealData = {
    group: '2',
    stage: +customFields.alreadyPaid > 0 ? '33' : '6',
    alreadyPaid: totalPaid,
    restToPay: restToPay,
    currentStep: totalPaid >= +deal.value
      ? 'Solde réglé'
      : 'Acompte réglé',

  }
  if (totalPaid >= +deal.value) {
    Object.assign(dealData, { paiementLink: 'Paiement OK' })
  }

  console.log('dealData', dealData)
  await activecampaign.updateDeal(order.dealId, dealData)

  const note = await activecampaign.addNote(order.dealId, {
    note: {
      note: `Paiement ${paymentType} -  ${session.customer_details.name} - ${session.customer_details.email} - ${session.amount_total / 100}€`,
    },
  })
  console.log('added note', note)

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
                text: `:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${order.dealId}|Confirmation paiement ${paymentType} - ${client.firstName} ${client.lastName} - ${order.dealId}>`,
              },
            },
          ],
        },
    })

    //     axios({
    //       url: 'https://www.google-analytics.com/collect',
    //       method: 'post',
    //       params: {
    //         v: 1,
    //         tid: process.env.NODE_ENV === 'development' ? 'UA-160322718-1' : 'UA-120209294-1',
    //         cid: '555',
    //         t: 'event',
    //         ec: 'Transaction_Server',
    //         ea: 'Ping_Confirmation',
    //         el: '' + +order.selectedTravelersToPay,
    //         ev: +session.amount_total
    //       }
    //     })
  }
}
export default {
  createCheckoutSession,
  handlePaymentSession,
}
