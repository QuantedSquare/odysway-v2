import { createError, defineEventHandler } from 'h3'

// Les commerciaux qu'Ulysse peut attribuer à une vente : les utilisateurs AC
// qui ont un nom, sous la forme que le miroir écrit dans `seller`.
//
//   GET /api/v1/ulysse/commerciaux
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  try {
    const { users } = await activecampaign.listUsers()
    return { commerciaux: commercialDeal.listeCommerciaux(users) }
  }
  catch (err) {
    console.error('[ulysse/commerciaux]', err?.message)
    throw createError({ statusCode: 502, statusMessage: 'ActiveCampaign est injoignable' })
  }
})
