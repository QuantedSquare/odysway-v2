import { defineEventHandler, readBody } from 'h3'


export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const body = await readBody(event)

  // Only allow editable fields
  const updateFields = {}
  const allowed = [
    'published', 'is_indiv_travel', 'displayed_status', 'departure_date', 'return_date',
    'max_travelers', 'min_travelers', 'booked_seat', 'include_flight',
    'flight_price', 'badges', 'starting_price',
    'early_bird', 'last_minute',
    // Custom display fields
    'custom_display',
    'displayed_min_travelers',
    'displayed_max_travelers',
    'displayed_booked_seat',
    'displayed_include_flight',
    'displayed_badges',
    'displayed_starting_price',
    'displayed_last_minute',
    'displayed_early_bird',
  ]
  for (const key of allowed) {
    if (body[key] !== undefined) updateFields[key] = body[key]
  }
  // Convert badges from string to array if needed

  const { data, error } = await supabase
    .from('travel_dates')
    .update(updateFields)
    .eq('id', dateId)
    .select('*')
    .single()

  if (error) return { error: error.message }
  return data
})
