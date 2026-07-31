import { defineEventHandler, readBody, createError } from 'h3'

// Replace-all: the editor sends the voyage's complete season list.
// Seasons dropped from the payload are deleted, cascading to their voyage_margins
// rows — amounts attached to a removed period have no meaning left.
//
// Overlap and DD/MM validity are enforced in margins.replaceSeasonsForVoyage,
// which tags those errors with statusCode 400.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const body = await readBody(event)
  const seasons = Array.isArray(body) ? body : body?.seasons
  if (!Array.isArray(seasons)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body doit être un tableau de { label, start_month, start_day, end_month, end_day }',
    })
  }

  try {
    return await margins.replaceSeasonsForVoyage(slug, seasons, bookingUser?.email)
  }
  catch (err) {
    throw createError({ statusCode: err.statusCode || 500, statusMessage: err.message })
  }
})
