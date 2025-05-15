import { defineEventHandler, readBody } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const body = await readBody(event)

  // Only allow editable fields
  const updateFields = {}
  const allowed = [
    'published', 'displayed_status', 'departure_date', 'return_date',
    'max_travelers', 'min_travelers', 'booked_seat', 'include_flight',
    'flight_price', 'badges', 'starting_price',
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
