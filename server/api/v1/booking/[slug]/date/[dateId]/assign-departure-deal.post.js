import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  // Ulysse s'annonce par un jeton de service ; sinon on retombe sur la session
  // booking_token habituelle. Voir getUlysseServiceUser pour la liste des
  // endpoints qui l'acceptent.
  const bookingUser = getUlysseServiceUser(event)
    ?? (isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event))

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  const { dealId } = await readBody(event)
  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'dealId requis' })
  }

  // Ensure the date exists and matches slug
  const travelDate = await booking.requireActiveTravelDate(dateId, slug)

  // Rejouer la même assignation (double clic, nouvelle tentative après un
  // délai d'attente) ne réécrit rien et n'ajoute pas de ligne au journal.
  if (travelDate.departure_id && String(travelDate.departure_id) === String(dealId)) {
    return { departure_id: travelDate.departure_id, unchanged: true }
  }

  // Update departure_id on the travel_dates row
  const { error: updateError } = await supabase
    .from('travel_dates')
    .update({ departure_id: dealId })
    .eq('id', dateId)
  if (updateError) {
    // travel_dates porte UNIQUE(departure_id) : ce dossier est déjà celui d'une
    // autre date. C'est un conflit à résoudre par l'opérateur, pas une panne.
    if (updateError.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Ce dossier de départ est déjà rattaché à une autre date' })
    }
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  await logDateActivity(dateId, bookingUser, 'departure_assigned', { departure_deal_id: dealId })

  return { departure_id: dealId }
})
