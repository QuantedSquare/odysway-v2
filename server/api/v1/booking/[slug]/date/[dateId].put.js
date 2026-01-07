import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'slug et dateId requis',
    })
  }
  const body = await readBody(event)

  // Only allow editable fields
  const updateFields = {}
  const allowed = [
    'published', 'is_indiv_travel', 'departure_date', 'return_date',
    'max_travelers', 'min_travelers', 'include_flight',
    'flight_price', 'badges', 'starting_price',
    'early_bird', 'last_minute',
    // Custom display fields
    'displayed_booked_seat',
    'displayed_status',
  ]
  for (const key of allowed) {
    if (body[key] !== undefined) updateFields[key] = body[key]
  }

  if (!Object.keys(updateFields).length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Aucun champ à mettre à jour',
    })
  }

  // Convert badges from string to array if needed
  const { data, error } = await supabase
    .from('travel_dates')
    .update(updateFields)
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .select('*')
    .single()

  if (error || !data) {
    throw createError({
      statusCode: error ? 500 : 404,
      statusMessage: error ? error.message : 'Date introuvable',
    })
  }

  // Keep automated status in sync if thresholds changed
  const statusRes = await booking.recomputeStatusOnly(dateId)
  if (statusRes?.error) {
    // Non-blocking: the primary update succeeded; we just couldn't recompute status.
    console.error('Status recompute failed', statusRes.error)
  }
  return data
})
