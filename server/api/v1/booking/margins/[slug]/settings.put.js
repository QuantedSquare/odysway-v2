import { defineEventHandler, readBody, createError } from 'h3'

// Per-voyage margin settings: how the voyage is configured (pax table / per-date
// override / excluded from tracking) and the child margin delta.

export default defineEventHandler(async (event) => {
  const bookingUser = requireCrmAccess(event)

  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const body = await readBody(event) || {}

  try {
    return await margins.upsertSettingsForVoyage(slug, body, bookingUser?.email)
  }
  catch (err) {
    throw createError({ statusCode: err.statusCode || 500, statusMessage: err.message })
  }
})
