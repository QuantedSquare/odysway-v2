import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'slug requis',
    })
  }

  // ?includeDeleted=true sert la corbeille du back-office : la route est
  // publique, les dates supprimées ne le sont pas.
  const { includeDeleted } = getQuery(event)
  const withDeleted = (includeDeleted === 'true' || includeDeleted === '1') && !!getCrmAccessOrNull(event)

  let query = supabase
    .from('travel_dates')
    .select('*')
    .eq('travel_slug', slug)
    .order('departure_date', { ascending: true })
  if (!withDeleted) query = query.eq('deleted', false)

  const { data, error } = await query

  // console.log('SUPABASE RETURN: ', data, ' -- error: ', error)
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
  return data
})
