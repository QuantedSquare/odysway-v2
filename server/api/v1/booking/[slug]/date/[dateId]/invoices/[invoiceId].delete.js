import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug, invoiceId } = event.context.params
  if (!dateId || !slug || !invoiceId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et invoiceId requis' })
  }

  const { data: invoice, error: fetchError } = await supabase
    .from('date_invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('travel_date_id', dateId)
    .eq('deleted', false)
    .single()

  if (fetchError || !invoice) {
    throw createError({ statusCode: 404, statusMessage: 'Facture introuvable' })
  }

  if (!bookingUser) {
    throw createError({ statusCode: 403, statusMessage: 'Non autorisé à supprimer cette facture' })
  }

  // Le PDF reste dans le bucket : une facture restaurée porte des montants
  // comptables et doit retrouver sa pièce justificative.
  const removed = await softDelete.remove('date_invoices', q => q.eq('id', invoiceId), {
    user: bookingUser,
    reason: softDelete.REASONS.MANUAL,
  })

  if (removed.error) {
    throw createError({ statusCode: 500, statusMessage: removed.error })
  }

  return { success: true }
})
