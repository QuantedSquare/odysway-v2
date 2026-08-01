import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  // ?includeDeleted=true alimente la Corbeille du BMS.
  const { includeDeleted } = getQuery(event)
  const withDeleted = includeDeleted === 'true' || includeDeleted === '1'

  await booking.requireActiveTravelDate(dateId, slug, { includeDeleted: true })

  let query = supabase
    .from('date_notes')
    .select('*')
    .eq('travel_date_id', dateId)
    .order('created_at', { ascending: true })
  if (!withDeleted) query = query.eq('deleted', false)

  const { data, error } = await query

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || []
})
