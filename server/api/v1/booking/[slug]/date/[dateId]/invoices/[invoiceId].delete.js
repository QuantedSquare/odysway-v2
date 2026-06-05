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
    .single()

  if (fetchError || !invoice) {
    throw createError({ statusCode: 404, statusMessage: 'Facture introuvable' })
  }

  if (!bookingUser) {
    throw createError({ statusCode: 403, statusMessage: 'Non autorisé à supprimer cette facture' })
  }

  // Only attempt storage removal for invoices that have an attached file —
  // exception-case rows (no file) have no storage_path.
  if (invoice.storage_path) {
    const { error: storageError } = await supabase
      .storage
      .from('date-invoices')
      .remove([invoice.storage_path])

    if (storageError) {
      console.error('Error deleting invoice from storage:', storageError)
    }
  }

  const { error: deleteError } = await supabase
    .from('date_invoices')
    .delete()
    .eq('id', invoiceId)

  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: deleteError.message })
  }

  return { success: true }
})
