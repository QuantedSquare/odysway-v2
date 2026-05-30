import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug, invoiceId } = event.context.params
  if (!dateId || !slug || !invoiceId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et invoiceId requis' })
  }

  const body = await readBody(event)
  const update = {}
  if (body.amount !== undefined) {
    if (body.amount === null || body.amount === '' || Number.isNaN(Number(body.amount))) {
      throw createError({ statusCode: 400, statusMessage: 'amount invalide' })
    }
    update.amount = Number(body.amount)
  }
  if (body.label !== undefined) {
    update.label = body.label || null
  }

  if (!Object.keys(update).length) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun champ à mettre à jour' })
  }

  const { data, error } = await supabase
    .from('date_invoices')
    .update(update)
    .eq('id', invoiceId)
    .eq('travel_date_id', dateId)
    .select('*')
    .single()

  if (error || !data) {
    throw createError({
      statusCode: error ? 500 : 404,
      statusMessage: error ? error.message : 'Facture introuvable',
    })
  }

  return data
})
