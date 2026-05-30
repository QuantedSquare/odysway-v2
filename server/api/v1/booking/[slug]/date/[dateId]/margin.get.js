import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  // Sanity-check the date belongs to this slug.
  const { data: travelDate, error: tdError } = await supabase
    .from('travel_dates')
    .select('id')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()

  if (tdError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }

  try {
    const breakdown = await margins.computeMarginForDate(dateId)
    return breakdown
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})
