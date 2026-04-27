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

  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

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
    'co_filling',
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

  // Track "save" click: server-side timestamp + editor
  updateFields.updated_at = new Date().toISOString()
  if (bookingUser?.email) {
    updateFields.last_editor = bookingUser.email
  }

  // Fetch current values for activity diff
  const { data: current } = await supabase
    .from('travel_dates')
    .select(allowed.join(','))
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()

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

  // Log activity with diff of changed fields
  if (current) {
    const changes = {}
    for (const key of Object.keys(updateFields)) {
      if (key === 'updated_at' || key === 'last_editor') continue
      if (JSON.stringify(current[key]) !== JSON.stringify(updateFields[key])) {
        changes[key] = { old: current[key], new: updateFields[key] }
      }
    }
    if (Object.keys(changes).length) {
      await logDateActivity(dateId, bookingUser, 'updated', changes)
    }
  }

  // Keep automated status and booked_seat in sync
  // co_filling change requires full recalculation; threshold changes only need status recompute
  if ('co_filling' in updateFields) {
    const recomputeRes = await booking.recomputeBookedSeatAndStatus(dateId)
    if (recomputeRes?.error) {
      console.error('Booked seat recompute failed', recomputeRes.error)
    }
  }
  else {
    const statusRes = await booking.recomputeStatusOnly(dateId)
    if (statusRes?.error) {
      console.error('Status recompute failed', statusRes.error)
    }
  }
  return data
})
