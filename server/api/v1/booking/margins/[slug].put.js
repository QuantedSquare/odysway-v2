import { defineEventHandler, readBody, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const body = await readBody(event)
  const rows = Array.isArray(body) ? body : body?.rows
  if (!Array.isArray(rows)) {
    throw createError({ statusCode: 400, statusMessage: 'Body doit être un tableau de { pax, margin_per_traveler }' })
  }

  const year = Number(getQuery(event).year)
  if (!year || Number.isNaN(year)) {
    throw createError({ statusCode: 400, statusMessage: 'year requis (query ?year=2026)' })
  }

  try {
    const data = await margins.upsertMarginForVoyage(slug, rows, bookingUser?.email, year)
    return data
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})
