import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const travelDate = await booking.requireActiveTravelDate(dateId, slug)

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
