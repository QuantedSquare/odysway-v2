import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  // Sanity-check the date belongs to this slug.
  const { data: existing, error: existingError } = await supabase
    .from('travel_dates')
    .select('id, margin_override_per_traveler, real_traveler_count_override')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()

  if (existingError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }

  const body = await readBody(event)
  try {
    const updated = await margins.updateMarginOverride(dateId, body)

    const changes = {}
    for (const key of ['margin_override_per_traveler', 'real_traveler_count_override']) {
      if (body[key] !== undefined && existing[key] !== updated[key]) {
        changes[key] = { old: existing[key], new: updated[key] }
      }
    }
    if (Object.keys(changes).length) {
      await logDateActivity(dateId, bookingUser, 'updated', changes)
    }

    return updated
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})
