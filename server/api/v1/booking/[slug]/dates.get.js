import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'slug requis',
    })
  }

  const { data, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('travel_slug', slug)
    .order('departure_date', { ascending: true })

  // console.log('SUPABASE RETURN: ', data, ' -- error: ', error)
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
  return data
})
