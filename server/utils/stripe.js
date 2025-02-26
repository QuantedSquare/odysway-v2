import axios from 'axios'

import { stripeCLI } from './stripeCLI'

const config = useRuntimeConfig()

const createCheckoutSession = async (order) => {
  console.log('order', order)

  // const order = {
  //   dealId: dealId.value,
  //   paymentType: route.query.type,
  //   contact: deal.value.contact,
  //   currentUrl: route.fullPath,
  //   insuranceImg: props.page.fields.assurance_img,
  //   amout: route.query.amount, // Optionnel
  // }

  const reponse = await activecampaign.getDealById(order.dealId)
  const customFields = await activecampaign.getDealCustomFields(order.dealId)
  const deal = { ...reponse.deal, ...customFields }

  // console.log('deal', deal)
  const origin = config.public.siteURL

  const isDev = true // config.public.environment === 'development'

  const imageUrl = deal.image ? deal.image.replace('buttercms', 'filestackcontent') : 'https://odysway.com/logos/logo_noir.png'

  const lineItems = []
  let paidAmount = 0

  function calculatDepositeValue(data) {
    const baseToCalculateDepositValue = +data.value - (data.flightPrice ?? 0) * data.nbTravelers - ((data.insuranceCommissionPrice ?? 0) * data.nbTravelers)
    console.log('deal test calculate', +data.value, (data.flightPrice ?? 0) * data.nbTravelers, ((data.insuranceCommissionPrice ?? 0) * data.nbTravelers))
    console.log('baseToCalculateDepositValue', baseToCalculateDepositValue)
    return Math.floor((baseToCalculateDepositValue) * 0.3 + (data.flightPrice ?? 0) * data.nbTravelers)
  }

  if (order.paymentType === 'deposit') {
    const depositValue = calculatDepositeValue(deal)
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
            name: deal.insurance,
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
          unit_amount: +order.amout,
        },
        quantity: 1,
      })
    paidAmount += +order.amout
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
          unit_amount: +deal.basePricePerTraveler + (deal.flightPrice > 0 ? +deal.flightPrice : 0),
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
            unit_amount: +deal.basePricePerTraveler - +deal.promoChildren + (deal.flightPrice > 0 ? +deal.flightPrice : 0),
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
            unit_amount: +deal.basePricePerTraveler - +deal.promoTeen + (deal.flightPrice > 0 ? +deal.flightPrice : 0),
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
  const contact = await activecampaign.getClientById(deal.contact)
  //     // Stripe only accept strings for metadata
  delete order.insurances
  delete order.options
  delete order.indivRoomPrice
  delete order.insurancePricePerTraveler
  delete order.contact

  // Changer et récupérer le contact d'ac
  console.log('====CREATE STRIPE CUSTOMER======', contact)
  const customer = await stripeCLI.customers.create({
    email: contact.email,
    name: contact.firstName + contact.lastName,
    metadata: order,
    phone: contact.phone,
  })

  Object.assign(order, { customer: customer.id, paidAmount })

  const session = await stripeCLI.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    customer: customer.id,
    invoice_creation: { enabled: true },
    success_url: `${origin}`,
    cancel_url: `${origin}${order.currentUrl}`,
    metadata: order,
    payment_intent_data: {
      metadata: order, // used in bank transfer webhook otherwise it's blank
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
const handlePaymentSession = (session, paymentType) => {
  console.log('In handlePaymentSession', session, paymentType)
  //   let checkoutId

  //   if (paymentType === 'Virement') {
  //     const checkoutSession = await stripe.checkout.sessions.list({
  //       payment_intent: session.id
  //     })
  //     checkoutId = checkoutSession.data[0].id
  //     session = checkoutSession.data[0]
  //   } else {
  //     checkoutId = session.id
  //   }

  //   const order = session.metadata
  //   const directPayment = !order.isSold && order.isPayment && !order.isAdvance

  //   // Fetch Deal Data
  //   const customData = await ac.getCustomFieldData(order.dealId)
  //   const customFields = ac.handleCustomFields(await customData.dealCustomFieldData)
  //   const activecampaignDealData = await ac.getDealById(order.dealId)
  //   const client = await ac.getClientById(activecampaignDealData.deal.contact)
  //   // Chapka notify

  //   const { data: lineItems } = await stripe.checkout.sessions.listLineItems(checkoutId)
  //   session.lineItems = lineItems

  //   const inssuranceItem = lineItems.find((item) => {
  //     return [
  //       'Assurance multirisques',
  //       'Assurance annulation'
  //     ].includes(item.description)
  //   })

  //   if (inssuranceItem && !isDev) {
  //     chapka.notify(session, inssuranceItem, customFields)
  //   }
  //   console.log('SESSION METADATA as ORDER', order)
  //   // AC Update toutes les valeur monaitaire sont en centimes
  //   const totalPaid = +(customFields.alreadyPaid || 0) + +(session.amount_total)

  //   const restToPay = +activecampaignDealData.deal.value - totalPaid

  //   // FALSE UNIQUEMENT SUR PAGE PAIEMENT ET REGLEMENT SOLDE
  //   const isAdvance = order.isAdvance === true || order.isAdvance === 'true'

  //   // console.log('====CUSTOM FIELDS=====', customFields)

  //   const countUnderAge = +order.nbUnderAge || 0
  //   const countTeen = +order.nbTeen || 0

  //   const childrenReduction = countUnderAge * +order.childrenPromo * 100 * !directPayment
  //   const teenReduction = countTeen * +order.teenPromo * 100 * !directPayment
  //   // childrenReduction + teenReduction UNIQUEMENT AU PREMIER CALCUL
  //   const restToPayPerTraveler = (restToPay + childrenReduction + teenReduction) / (isAdvance ? +order.selectedTravelersToPay : (+customFields.restTravelersToPay - +order.selectedTravelersToPay))

  //   function restTravelerToPay () {
  //     if (totalPaid >= +activecampaignDealData.deal.value) {
  //       return 0
  //     } else if (isAdvance) {
  //       return +order.selectedTravelersToPay
  //     } else {
  //       return +customFields.restTravelersToPay - +order.selectedTravelersToPay
  //     }
  //   }

  //   const dealData = {
  //     deal: {
  //       group: '2',
  //       stage: totalPaid >= +activecampaignDealData.deal.value ? '33' : '6',
  //       fields: [
  //         {
  //           customFieldId: 20,
  //           fieldValue: totalPaid >= +activecampaignDealData.deal.value
  //             ? 'Solde réglé'
  //             : 'Acompte réglé'
  //         },
  //         { customFieldId: 21, fieldValue: totalPaid >= +activecampaignDealData.deal.value ? 'Paiement OK' : 'https://odysway.com/paiement?orderId=' + order.dealId + '&amount=' + (Math.round(order.flatRestToPay)) + '&isSold=true' }, // Lien paiement
  //         { customFieldId: 24, fieldValue: totalPaid }, // Field : AlreadyPaid
  //         { customFieldId: 44, fieldValue: restToPay }, // Field : restToPay
  //         { customFieldId: 28, fieldValue: restTravelerToPay() },
  //         { customFieldId: 66, fieldValue: totalPaid >= +activecampaignDealData.deal.value ? 0 : restToPayPerTraveler } // Solde restant par Voyageur à régler
  //       ]
  //     }
  //   }

  //   // console.log('====DealDataFromWebhookStripe=====', dealData.deal.fields)

  //   ac.updateDeal(order.dealId, dealData)

  //   ac.addNote(order.dealId, {
  //     note: {
  //       note: `Paiement ${paymentType} -  ${session.customer_details.name} - ${session.customer_details.email} - ${session.amount_total / 100}€`
  //     }
  //   })

  //   if (!isDev) {
  //     axios({
  //       url: 'https://hooks.slack.com/services/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',
  //       method: 'post',
  //       data: // { text: `Confirmation paiement CB - ${client.contact.firstName} ${client.contact.lastName} - ${order.dealId}` }
  //       {
  //         blocks: [
  //           {
  //             type: 'section',
  //             text: {
  //               type: 'mrkdwn',
  //               text: `:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${order.dealId}|Confirmation paiement ${paymentType} - ${client.contact.firstName} ${client.contact.lastName} - ${order.dealId}>`
  //             }
  //           }
  //         ]
  //       }
  //     })

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
//   }
}
export default {
  createCheckoutSession,
  handlePaymentSession,
}
