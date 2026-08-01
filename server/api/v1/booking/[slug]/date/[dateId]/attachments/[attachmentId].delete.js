import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)
console.log('bookingUser', bookingUser)
  const { dateId, slug, attachmentId } = event.context.params
  if (!dateId || !slug || !attachmentId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et attachmentId requis' })
  }

  const { data: attachment, error: fetchError } = await supabase
    .from('date_attachments')
    .select('*')
    .eq('id', attachmentId)
    .eq('travel_date_id', dateId)
    .eq('deleted', false)
    .single()

  if (fetchError || !attachment) {
    throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable' })
  }

  if (bookingUser?.email !== attachment.uploaded_by && bookingUser?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Non autorisé à supprimer ce fichier' })
  }

  // L'objet Storage n'est PAS supprimé : une pièce jointe restaurée doit
  // retrouver son fichier, pas un 404. Le nettoyage du bucket relève du futur
  // job de purge, qui devra vider le Storage avant de supprimer les lignes.
  const removed = await softDelete.remove('date_attachments', q => q.eq('id', attachmentId), {
    user: bookingUser,
    reason: softDelete.REASONS.MANUAL,
  })

  if (removed.error) {
    throw createError({ statusCode: 500, statusMessage: removed.error })
  }

  return { success: true }
})
