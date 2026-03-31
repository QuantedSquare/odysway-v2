import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const { limit = 20, offset = 0 } = getQuery(event)

  const { data: travelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('id')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }

  const { data, error } = await supabase
    .from('date_activity_log')
    .select('*')
    .eq('travel_date_id', dateId)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || []
})
