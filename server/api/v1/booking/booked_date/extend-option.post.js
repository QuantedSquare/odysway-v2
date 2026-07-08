import { defineEventHandler, readBody, createError } from 'h3'

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_DAYS = 90

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: 'id requis' })
  }
  const days = Number(body.days)
  if (!Number.isInteger(days) || days <= 0 || days > MAX_DAYS) {
    throw createError({ statusCode: 400, statusMessage: `Durée invalide (1 à ${MAX_DAYS} jours)` })
  }

  // The booked_date must currently be an option to be extended.
  const { data: bookedDate, error: bookedDateError } = await supabase
    .from('booked_dates')
    .select('is_option, expiracy_date')
    .eq('id', body.id)
    .single()
  if (bookedDateError || !bookedDate) {
    throw createError({ statusCode: 404, statusMessage: bookedDateError?.message || 'Réservation introuvable' })
  }
  if (!bookedDate.is_option) {
    throw createError({ statusCode: 409, statusMessage: 'Cette réservation n\'est pas une option', data: { code: 'NOT_AN_OPTION' } })
  }

  // Extend from the later of now or the current expiry so the operator always
  // gains the full added duration and an option is never accidentally shortened.
  const now = Date.now()
  const currentExpiry = bookedDate.expiracy_date ? new Date(bookedDate.expiracy_date).getTime() : now
  const base = Math.max(now, currentExpiry)
  const newExpiracy = new Date(base + days * DAY_MS)

  const { data, error } = await supabase
    .from('booked_dates')
    .update({ expiracy_date: newExpiracy })
    .eq('id', body.id)
    .select('*')
    .single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
