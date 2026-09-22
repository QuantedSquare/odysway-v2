// Lecture d'un deal ActiveCampaign par son identifiant.
//
// SÉCURITÉ — les ids de deal AC sont des entiers séquentiels : cette route est
// adressable par énumération. Elle rend donc deux réponses différentes :
//
//  - avec session back-office (`booking_token`) ou jeton de service Ulysse :
//    le payload complet — champs natifs, champs personnalisés (marges, coût
//    d'achat, commissions, montants payés) et le contact du client ;
//  - sans : la seule projection publique (server/utils/dealVisibility.js), qui
//    suffit à la redirection des anciens liens `/paiement?orderId=` et ne
//    contient ni identité client ni donnée financière interne.
//
// Le tunnel de commande ne passe plus par ici : il lit
// /ac/deals/deal-from-bms?bookedId=<uuid>, porté par le `booked_id` que le
// client détient déjà dans son URL de checkout.
//
// Cette route est en lecture seule. Le `recalculatTotalValues` qu'elle appelait
// avant chaque réponse écrivait dans AC (PUT) sur simple GET anonyme : un tiers
// pouvait faire recalculer n'importe quel deal du CRM, et un crawler le faisait
// sans le vouloir. Le recalcul appartient aux écritures — il reste dans
// update-with-bms.post.ts, qui l'exécute après chaque mise à jour.

export default defineEventHandler(async (event) => {
  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deal ID should be an integer',
    })
  }

  const crmUser = getCrmAccessOrNull(event)

  // Payload CRM : jamais retenu par un CDN ou un proxy.
  setResponseHeaders(event, {
    'cache-control': 'no-store, no-cache, must-revalidate, private',
    'pragma': 'no-cache',
  })

  try {
    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(dealId),
      activecampaign.getDealCustomFields(dealId),
    ])

    if (!fetchedDeal?.deal || !customFields) {
      throw createError({
        statusCode: 404,
        message: 'Deal not found',
      })
    }

    const fullDeal = { ...fetchedDeal.deal, ...customFields }

    if (!crmUser) return toPublicDeal(fullDeal)

    const { contact } = await activecampaign.getClientById(fetchedDeal.deal.contact)
    return {
      ...fullDeal,
      contact: {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
      },
    }
  }
  catch (err) {
    // Le 404 levé ci-dessus garde son statut. Une erreur venue d'ofetch, elle,
    // est réécrite : son message porte l'URL et la réponse d'ActiveCampaign.
    if (isError(err)) throw err
    console.log('Error getting one deal', err, dealId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting one deal', err,
    })
  }
})
