import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.travel_slug) {
    throw createError({ statusCode: 400, statusMessage: 'travel_slug requis' })
  }
  if (!body?.departure_date || !body?.return_date) {
    throw createError({ statusCode: 400, statusMessage: 'departure_date et return_date requis' })
  }

  // Only allow insertable fields
  const insertData = {}
  const allowed = [
    'travel_slug',
    'published',
    'is_indiv_travel',
    'is_custom_travel',
    'departure_date',
    'return_date',
    'max_travelers',
    'min_travelers',
    'booked_seat',
    'include_flight',
    'flight_price',
    'badges',
    'starting_price',
    'early_bird',
    'last_minute',
    'status',
    'displayed_status',
    'displayed_booked_seat',
    'displayed_badges',
  ]
  for (const key of allowed) {
    if (body[key] !== undefined) insertData[key] = body[key]
  }

  if (!('booked_seat' in insertData)) insertData.booked_seat = 0
  if (!('published' in insertData)) insertData.published = false
  if (!insertData.displayed_status && insertData.status) insertData.displayed_status = insertData.status
  // if (typeof insertData.badges === 'string') {
  //   insertData.badges = insertData.badges.split(',').map(b => b.trim()).filter(Boolean)
  // }

  const { data, error } = await supabase
    .from('travel_dates')
    .insert([insertData])
    .select('*')
    .single()
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
  return data
})
