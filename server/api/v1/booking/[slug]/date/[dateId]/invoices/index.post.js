import { defineEventHandler, readBody, createError } from 'h3'

// Create a date_invoices row WITHOUT an attached file (~5% exception cases like
// cash tips, supplier with no invoice paper, etc.). For the standard case with
// a PDF/image, use POST /invoices/upload-url which handles the storage flow.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const { amount, label } = await readBody(event)
  if (amount === undefined || amount === null || amount === '' || Number.isNaN(Number(amount))) {
    throw createError({ statusCode: 400, statusMessage: 'amount requis (montant en EUR)' })
  }
  if (!label || !label.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'label requis (description identifiante)' })
  }

  // Sanity-check the date belongs to this slug.
  const { data: travelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('id')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }

  const { data: invoice, error: insertError } = await supabase
    .from('date_invoices')
    .insert([{
      travel_date_id: dateId,
      amount: Number(amount),
      label: label.trim(),
      uploaded_by: bookingUser?.email || 'unknown',
    }])
    .select('*')
    .single()

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  return { invoice }
})
