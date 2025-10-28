import { defineEventHandler, readBody } from 'h3'


export default defineEventHandler(async (event) => {
  const travelDateId = event.context.params.travelDateId
  const body = await readBody(event)
  // Required fields
  const required = ['title', 'email', 'departure_date', 'return_date', 'destination', 'starting_price']
  for (const field of required) {
    if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
      return { error: `Champ obligatoire manquant: ${field}` }
    }
  }
  // Parse destination(s)
  let iso = ''
  let zoneChapka = ''
  let country = ''
  if (Array.isArray(body.destination) && body.destination.length > 0) {
    iso = body.destination[0].iso
    zoneChapka = body.destination[0].chapka
    country = body.destination[0].title
  }
  // Prepare update data
  const updateData = {
    title: body.title,
    description: body.description || '',
    user_email: body.email,
    departure_date: body.departure_date,
    return_date: body.return_date,
    destination: body.destination.map(d => d.title),
    starting_price: Number(body.starting_price),
    include_flight: !!body.include_flight,
    flight_price: body.flight_price ? Number(body.flight_price) : 0,
    extension_price: body.extension_price ? Number(body.extension_price) : 0,
    reduction_price: body.reduction_price ? Number(body.reduction_price) : 0,
    iso,
    zone_chapka: zoneChapka,
    country,
  }
  const { data, error } = await supabase
    .from('travel_dates')
    .update(updateData)
    .eq('id', travelDateId)
    .select('*')
    .single()
  if (error) return { error: error.message }
  return { success: true, travel_date: data }
})
