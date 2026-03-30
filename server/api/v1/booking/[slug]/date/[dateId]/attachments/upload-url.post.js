import { defineEventHandler, readBody, createError } from 'h3'
import crypto from 'node:crypto'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const { fileName, fileSize, mimeType } = await readBody(event)
  if (!fileName || !fileSize || !mimeType) {
    throw createError({ statusCode: 400, statusMessage: 'fileName, fileSize et mimeType requis' })
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw createError({ statusCode: 400, statusMessage: 'Type de fichier non autorisé' })
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier trop volumineux (max 10 Mo)' })
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

  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${dateId}/${crypto.randomUUID()}-${sanitizedName}`

  const { data: signedUrl, error: signedUrlError } = await supabase
    .storage
    .from('date-attachments')
    .createSignedUploadUrl(storagePath)

  if (signedUrlError) {
    throw createError({ statusCode: 500, statusMessage: signedUrlError.message })
  }

  const { data: attachment, error: insertError } = await supabase
    .from('date_attachments')
    .insert([{
      travel_date_id: dateId,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      storage_path: storagePath,
      uploaded_by: bookingUser?.email || 'unknown',
    }])
    .select('*')
    .single()

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  return {
    uploadUrl: signedUrl.signedUrl,
    token: signedUrl.token,
    attachment,
  }
})
