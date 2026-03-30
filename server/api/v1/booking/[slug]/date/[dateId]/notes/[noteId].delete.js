import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug, noteId } = event.context.params
  if (!dateId || !slug || !noteId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et noteId requis' })
  }

  const { data: note, error: noteError } = await supabase
    .from('date_notes')
    .select('*')
    .eq('id', noteId)
    .eq('travel_date_id', dateId)
    .single()

  if (noteError || !note) {
    throw createError({ statusCode: 404, statusMessage: 'Note introuvable' })
  }

  if (bookingUser?.email !== note.author_email && bookingUser?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Non autorisé à supprimer cette note' })
  }

  const { error } = await supabase
    .from('date_notes')
    .delete()
    .eq('id', noteId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
