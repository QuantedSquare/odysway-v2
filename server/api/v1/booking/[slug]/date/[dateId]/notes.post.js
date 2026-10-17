import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const bookingUser = requireCrmAccess(event)
  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const { content } = await readBody(event)
  if (!content || !content.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Le contenu est requis' })
  }

  await booking.requireActiveTravelDate(dateId, slug)

  const { data, error } = await supabase
    .from('date_notes')
    .insert([{
      travel_date_id: dateId,
      author_email: bookingUser?.email || 'unknown',
      author_name: bookingUser?.name || null,
      author_picture: bookingUser?.picture || null,
      content: content.trim(),
    }])
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
