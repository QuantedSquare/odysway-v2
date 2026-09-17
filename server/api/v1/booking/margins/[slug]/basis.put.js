import { defineEventHandler, readBody, createError } from 'h3'

// Bascule d'un voyage : sa marge devient dérivée du coût d'achat, ou redevient
// saisie. Body : { margin_basis: 'purchase_cost' | 'entered' }.
//
// Ulysse ne l'appelle qu'après une réconciliation sans écart inexpliqué ;
// marginPricing.setMarginBasis refuse en plus toute ligne restée sans coût.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  // Ulysse s'annonce par un jeton de service ; sinon on retombe sur la session
  // booking_token habituelle. Voir getUlysseServiceUser pour la liste des
  // endpoints qui l'acceptent.
  const bookingUser = getUlysseServiceUser(event)
    ?? (isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event))

  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const body = await readBody(event) || {}

  try {
    return await marginPricing.setMarginBasis(slug, body.margin_basis, bookingUser?.email)
  }
  catch (err) {
    throw createError({ statusCode: err.statusCode || 500, statusMessage: err.message })
  }
})
