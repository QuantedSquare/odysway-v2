import { defineEventHandler, readBody, createError } from 'h3'

// Grille tarifaire d'Ulysse : paramètres du voyage, puis lignes d'une année × saison
// (coût d'achat, prix de vente, change, marge dérivée).
//
// Body : { settings?: { grid_model, purchase_currency, single_supplement, bank_fees_pct,
//                       target_margin_pct },
//          year, season_id?, rows: [{ pax, purchase_cost_per_traveler,
//                                     sale_price_per_traveler, fx_rate, margin_per_traveler }] }
//
// Réservé à Ulysse en pratique, mais ouvert aussi à la session BMS : l'écriture
// reste celle d'un opérateur authentifié. Voir server/utils/marginPricing.js.

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
    // Réglages d'abord : une grille enregistrée sans son modèle serait
    // impossible à réconcilier. L'inverse (réglages sans lignes) ne fausse rien.
    const settings = body.settings
      ? await marginPricing.upsertPricingSettings(slug, body.settings, bookingUser?.email)
      : null
    const rows = body.rows
      ? await marginPricing.upsertPricingRows(slug, body, bookingUser?.email)
      : []
    return { settings, rows }
  }
  catch (err) {
    throw createError({ statusCode: err.statusCode || 500, statusMessage: err.message })
  }
})
