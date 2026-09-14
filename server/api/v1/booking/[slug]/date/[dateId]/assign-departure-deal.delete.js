import { defineEventHandler, createError } from 'h3'

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

  const travelDate = await booking.requireActiveTravelDate(dateId, slug)

  // Détacher un dossier déjà absent ne journalise pas un détachement fictif.
  if (!travelDate.departure_id) {
    return { departure_id: null, unchanged: true }
  }

  const { error: updateError } = await supabase
    .from('travel_dates')
    .update({ departure_id: null })
    .eq('id', dateId)
  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  await logDateActivity(dateId, bookingUser, 'departure_removed', { previous_departure_id: travelDate.departure_id || null })

  return { departure_id: null }
})
