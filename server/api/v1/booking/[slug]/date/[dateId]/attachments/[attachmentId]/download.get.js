import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug, attachmentId } = event.context.params
  if (!dateId || !slug || !attachmentId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et attachmentId requis' })
  }

  const { data: attachment, error: fetchError } = await supabase
    .from('date_attachments')
    .select('storage_path, file_name')
    .eq('id', attachmentId)
    .eq('travel_date_id', dateId)
    .single()

  if (fetchError || !attachment) {
    throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable' })
  }

  const { data: signedUrl, error: signedUrlError } = await supabase
    .storage
    .from('date-attachments')
    .createSignedUrl(attachment.storage_path, 60)

  if (signedUrlError) {
    throw createError({ statusCode: 500, statusMessage: signedUrlError.message })
  }

  return { url: signedUrl.signedUrl, fileName: attachment.file_name }
})
