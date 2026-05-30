import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug, invoiceId } = event.context.params
  if (!dateId || !slug || !invoiceId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et invoiceId requis' })
  }

  const { data: invoice, error: fetchError } = await supabase
    .from('date_invoices')
    .select('storage_path, file_name')
    .eq('id', invoiceId)
    .eq('travel_date_id', dateId)
    .single()

  if (fetchError || !invoice) {
    throw createError({ statusCode: 404, statusMessage: 'Facture introuvable' })
  }

  const { data: signedUrl, error: signedUrlError } = await supabase
    .storage
    .from('date-invoices')
    .createSignedUrl(invoice.storage_path, 60)

  if (signedUrlError) {
    throw createError({ statusCode: 500, statusMessage: signedUrlError.message })
  }

  return { url: signedUrl.signedUrl, fileName: invoice.file_name }
})
