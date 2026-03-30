import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug, attachmentId } = event.context.params
  if (!dateId || !slug || !attachmentId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et attachmentId requis' })
  }

  const { data: attachment, error: fetchError } = await supabase
    .from('date_attachments')
    .select('*')
    .eq('id', attachmentId)
    .eq('travel_date_id', dateId)
    .single()

  if (fetchError || !attachment) {
    throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable' })
  }

  if (bookingUser?.email !== attachment.uploaded_by && bookingUser?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Non autorisé à supprimer ce fichier' })
  }

  const { error: storageError } = await supabase
    .storage
    .from('date-attachments')
    .remove([attachment.storage_path])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
  }

  const { error: deleteError } = await supabase
    .from('date_attachments')
    .delete()
    .eq('id', attachmentId)

  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: deleteError.message })
  }

  return { success: true }
})
