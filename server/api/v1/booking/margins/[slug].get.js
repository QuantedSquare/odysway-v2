import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const { year } = getQuery(event)
  const yearNum = year ? Number(year) : null

  // The editor needs all three to render a year: the pax rows, the recurring
  // seasons that become columns, and the voyage settings (mode + child delta).
  // Returned together so the page loads in a single request.
  try {
    const [rows, seasons, settings] = await Promise.all([
      margins.getMarginForVoyage(slug, yearNum),
      margins.getSeasonsForVoyage(slug),
      margins.getSettingsForVoyage(slug),
    ])
    return { rows, seasons, settings }
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})
