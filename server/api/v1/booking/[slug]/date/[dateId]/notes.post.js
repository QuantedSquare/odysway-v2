import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)
  console.log('bookingUser', bookingUser)
  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const { content } = await readBody(event)
  if (!content || !content.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Le contenu est requis' })
  }

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
    .from('date_notes')
    .insert([{
      travel_date_id: dateId,
      author_email: bookingUser?.email || 'unknown',
      author_name: bookingUser?.name || null,
      content: content.trim(),
    }])
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
