import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import axios from 'axios'

import { stripeCLI } from './stripeCLI'

dayjs.extend(customParseFormat)

const config = useRuntimeConfig()

const createCheckoutSession = async (order) => {
  console.log('order', order)
  console.log('config', config.public.environment)
  const origin = config.public.siteURL

  const isDev = config.public.environment === 'development'

  const imageUrl = order.image ? order.image.replace('buttercms', 'filestackcontent') : 'https://odysway.com/logos/logo_noir.png'
  const directPayment = order.paymentType === 'custom' // order.isPayment && !order.isSold && !order.isAdvance

  // AppliedPrice = (baseVoyage - Promo -  + Flight + Extension) * isSold || depositDatePassed
  const lineItems = []

  if ((order.nbTravelers - order.nbUnderAge - order.nbTeen) > 0) {
    lineItems.push(
      {
        // Travel Fees
        price_data: {
          currency: 'eur',
          product_data: {
            name: order.title,
            images: [imageUrl],
            description: order.paymentType === 'deposit' ? 'Paiement de l\'acompte, les options et réductions seront appliquées au paiement du solde' : 'Paiement du solde',
          },
          unit_amount: order.appliedPrice * 100,
        },
        quantity: (order.nbTravelers - order.nbUnderAge - order.nbTeen),
      })
  }
  // -------- AJOUT TARIFS ENFANTS ET ADOS
  if (order.nbUnderAge > 0) {
    lineItems.push({
      // Travel Fees
      price_data: {
        currency: 'eur',
        product_data: {
          name: order.title + ' - Tarif Enfant',
          description: order.paymentType === 'deposit' ? 'Paiement de l\'acompte, les options et réductions du tarif enfant seront appliquées au paiement du solde' : 'Paiement du solde tarif enfant',
          images: [imageUrl],
        },
        unit_amount: (order.appliedPrice - (directPayment || order.isDeposit ? 0 : order.childrenPromo)) * 100,
      },
      quantity: order.nbUnderAge,
    })
  }
  if (order.nbTeen > 0) {
    lineItems.push({
      // Travel Fees
      price_data: {
        currency: 'eur',
        product_data: {
          name: order.title + ' - Tarif Adolescent',
          description: order.paymentType === 'deposit' ? 'Paiement de l\'acompte, les options et réductions du tarif adolescent seront appliquées au paiement du solde' : 'Paiement du solde tarif adolescent',
          images: [imageUrl],
        },
        unit_amount: (order.appliedPrice - (directPayment || order.isDeposit ? 0 : order.teenPromo)) * 100,
      },
      quantity: order.nbTeen,
    })
  }

  // --------------- AJOUT ASSURANCE -----------------
  if ((order.insurances.cancellation || order.insurances.global) && !directPayment && !order.isSold) {
    lineItems.push({
      // Insurances Fees
      price_data: {
        currency: 'eur',
        product_data: {
          name: order.insurances.global ? 'Assurance multirisques' : 'Assurance annulation',
          images: [order.insuranceImg],
        },
        unit_amount: order.insurancePricePerTraveler * 100,
      },
      quantity: order.nbTravelers,
    })
  }
  // --------------- AJOUT OPTIONS UNIQUEMENT AU SOLDE -----------------
  if (order.options.indivRoom && order.includRoom && !directPayment) {
    lineItems.push({
      // Insurances Fees
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Chambre individuelle',
          images: ['https://odysway.com/logos/logo_noir.png'],
        },
        unit_amount: order.indivRoomPrice * 100,
      },
      quantity: order.nbTravelers,
    })
  }

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

  //     // Stripe only accept strings for metadata
  delete order.insurances
  delete order.options
  delete order.indivRoomPrice
  delete order.insurancePricePerTraveler
  delete order.contact

  const session = await stripeCLI.checkout.sessions.create({
    line_items: lineItems,
    payment_method_types: ['card'],
    mode: 'payment',
    invoice_creation: { enabled: true },
    success_url: `${origin}`,
    cancel_url: `${origin}${order.currentUrl}`,
    metadata: order,
  })

  console.log('====CREATE STRIPE SESSION======', session)
  return session.url
}
// const isDev = process.env.NODE_ENV === 'development'

// const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// const stripe = {
//   async createStripeSession(order) {

//     return stripeApi.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: lineItems,
//       mode: 'payment',
//       invoice_creation: { enabled: true },
//       success_url: `${BASE_URL}/confirmation?voyage=${order.voyage}&success=true&amount=${order.appliedPrice * order.nbTravelers}`,
//       cancel_url: BASE_URL,
//       metadata: order,
//       // consent_collection: {
//       //   promotions: 'auto',
//       // },
//       after_expiration: {
//         recovery: {
//           enabled: true,
//         },
//       },
//     })
//   },
//   async handlePaymentSession(session) {
//     const order = session.metadata
//     const directPayment = !order.isSold && order.isPayment && !order.isAdvance

//     // Fetch Deal Data
//     const customData = await activecampaign.getDealCustomFields(order.dealId)
//     const customFields = activecampaign.handleCustomFields(await customData.dealCustomFieldData)
//     const activecampaignDealData = await activecampaign.getDealById(order.dealId)
//     const client = await activecampaign.getClientById(activecampaignDealData.deal.contact)
//     // Chapka notify
//     const { data: lineItems } = await stripeApi.checkout.sessions.listLineItems(session.id)
//     session.lineItems = lineItems

//     const inssuranceItem = lineItems.find((item) => {
//       return [
//         'Assurance multirisques',
//         'Assurance annulation',
//       ].includes(item.description)
//     })

//     if (inssuranceItem && !isDev) {
//       chapka.notify(session, inssuranceItem, customFields)
//     }
//     console.log('ORDER', order)
//     // AC Update toutes les valeur monaitaire sont en centimes
//     const totalPaid = +(customFields.alreadyPaid || 0) + +(session.amount_total)

//     const restToPay = +activecampaignDealData.deal.value - totalPaid

//     // FALSE UNIQUEMENT SUR PAGE PAIEMENT ET REGLEMENT SOLDE
//     const isAdvance = order.isAdvance === true || order.isAdvance === 'true'

//     console.log('====CUSTOM FIELDS=====', customFields)

//     const countUnderAge = +order.nbUnderAge || 0
//     const countTeen = +order.nbTeen || 0

//     const childrenReduction = countUnderAge * +order.childrenPromo * 100 * !directPayment
//     const teenReduction = countTeen * +order.teenPromo * 100 * !directPayment
//     // childrenReduction + teenReduction UNIQUEMENT AU PREMIER CALCUL
//     const restToPayPerTraveler = (restToPay + childrenReduction + teenReduction) / (isAdvance ? +order.selectedTravelersToPay : (+customFields.restTravelersToPay - +order.selectedTravelersToPay))

//     function restTravelerToPay() {
//       if (totalPaid >= +activecampaignDealData.deal.value) {
//         return 0
//       }
//       else if (isAdvance) {
//         return +order.selectedTravelersToPay
//       }
//       else {
//         return +customFields.restTravelersToPay - +order.selectedTravelersToPay
//       }
//     }

//     const dealData = {
//       deal: {
//         group: '2',
//         stage: totalPaid >= +activecampaignDealData.deal.value ? '8' : '6',
//         fields: [
//           {
//             customFieldId: 20,
//             fieldValue: totalPaid >= +activecampaignDealData.deal.value
//               ? 'Solde réglé'
//               : 'Acompte réglé',
//           },
//           { customFieldId: 21, fieldValue: totalPaid >= +activecampaignDealData.deal.value ? 'Paiement OK' : 'https://odysway.com/paiement?orderId=' + order.dealId + '&amount=' + (Math.round(order.flatRestToPay)) + '&isSold=true' }, // Lien paiement
//           { customFieldId: 24, fieldValue: totalPaid }, // Field : AlreadyPaid
//           { customFieldId: 44, fieldValue: restToPay }, // Field : restToPay
//           { customFieldId: 28, fieldValue: restTravelerToPay() },
//           { customFieldId: 66, fieldValue: totalPaid >= +activecampaignDealData.deal.value ? 0 : restToPayPerTraveler }, // Solde restant par Voyageur à régler
//         ],
//       },
//     }

//     console.log('====DealDataFromWebhookStripe=====', dealData.deal.fields)

//     activecampaign.updateDeal(order.dealId, dealData)

//     activecampaign.addNote(order.dealId, {
//       note: {
//         note: `Paiement CB -  ${session.customer_details.name} - ${session.customer_details.email} - ${session.amount_total / 100}€`,
//       },
//     })

//     if (!isDev) {
//       axios({
//         url: process.env.SLACK_URL_PAIEMENTS,
//         method: 'post',
//         data: // { text: `Confirmation paiement CB - ${client.contact.firstName} ${client.contact.lastName} - ${order.dealId}` }
//             {
//               blocks: [
//                 {
//                   type: 'section',
//                   text: {
//                     type: 'mrkdwn',
//                     text: `:white_check_mark: <https://odysway90522.activehosted.com/app/deals/${order.dealId}|Confirmation paiement CB - ${client.contact.firstName} ${client.contact.lastName} - ${order.dealId}>`,
//                   },
//                 },
//               ],
//             },
//       })

//       axios({
//         url: 'https://www.google-analytics.com/collect',
//         method: 'post',
//         params: {
//           v: 1,
//           tid: process.env.NODE_ENV === 'development' ? process.env.GOOGLE_ANALYTICS_TID_TEST : process.env.GOOGLE_ANALYTICS_TID_LIVE,
//           cid: '555',
//           t: 'event',
//           ec: 'Transaction_Server',
//           ea: 'Ping_Confirmation',
//           el: '' + +order.selectedTravelersToPay,
//           ev: +session.amount_total,
//         },
//       })
//     }
//   },
// }
export default {
  createCheckoutSession,
}
