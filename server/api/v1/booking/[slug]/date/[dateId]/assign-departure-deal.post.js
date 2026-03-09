import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  const { dealId } = await readBody(event)
  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'dealId requis' })
  }

  // Ensure the date exists and matches slug
  const { data: travelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug, departure_id')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }

  // Update departure_id on the travel_dates row
  const { error: updateError } = await supabase
    .from('travel_dates')
    .update({ departure_id: dealId })
    .eq('id', dateId)
  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return { departure_id: dealId }
})
