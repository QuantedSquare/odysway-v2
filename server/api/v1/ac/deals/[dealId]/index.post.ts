import type { H3Event } from 'h3'

// Écriture arbitraire sur un deal ActiveCampaign, adressée par son id.
//
// SÉCURITÉ — réservée au back-office (session `booking_token`) et à Ulysse
// (jeton de service). Les ids de deal étant séquentiels, cette route ouverte à
// l'anonyme permettait de réécrire n'importe quel dossier du CRM : prix, marge,
// montant déjà payé, lien de paiement, coordonnées du voyageur.
//
// Le tunnel de commande n'en dépend pas : ses écritures passent par
// /ac/deals/update-with-bms?bookedId=<uuid>, porté par le `booked_id` que le
// client détient déjà, qui résout lui-même le dealId depuis Supabase.

export default defineEventHandler(async (event: H3Event): Promise<TypeDeal> => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  requireCrmAccess(event)

  const dealId = event.context.params?.dealId
  if (!dealId) {
    throw createError({
      statusCode: 400,
      message: 'Deal ID is required',
    })
  }
  if (!Number.isInteger(+dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deal ID should be an integer',
    })
  }
  const parsedBody = await readValidatedBody(event, body => UpdateDealSchema.safeParse(body))
  if (!parsedBody.success) {
    console.error('Validation failed:', parsedBody.error)
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }
  try {
    const response = await activecampaign.updateDeal(dealId, parsedBody.data)
    return response
  }
  catch (err) {
    console.error('Deal updating error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to update deal',
    })
  }
})
