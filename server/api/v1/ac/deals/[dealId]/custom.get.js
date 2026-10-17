// Tous les champs personnalisés d'un deal ActiveCampaign, bruts.
//
// SÉCURITÉ — la réponse contient `agentCost`, `marginPerTraveler`,
// `totalMargin`, `flightMargin`, `insuranceCommissionPerTraveler`,
// `alreadyPaid`, `restToPay`… soit l'essentiel de ce que la route
// [dealId]/index.get.js protège. Elle est donc soumise à la même garde :
// session back-office ou jeton de service Ulysse.
//
// Aucun appelant dans l'application à ce jour — /booking-management passe par
// [dealId]/inspect.get.js, plus complet (libellés, métadonnées de champs). À
// supprimer si rien ne s'y raccroche d'ici la prochaine revue.

export default defineEventHandler(async (event) => {
  requireCrmAccess(event)

  setResponseHeaders(event, {
    'cache-control': 'no-store, no-cache, must-revalidate, private',
    'pragma': 'no-cache',
  })

  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deal ID should be an integer',
    })
  }
  try {
    const customFields = await activecampaign.getDealCustomFields(dealId)
    return customFields
  }
  catch (err) {
    console.log('Error getting customFields', err, dealId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting customFields', err,
    })
  }
})
