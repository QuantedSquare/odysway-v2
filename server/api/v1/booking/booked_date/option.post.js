import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: 'id requis' })
  }
  if (body.booked_places === undefined || body.booked_places === null) {
    throw createError({ statusCode: 400, statusMessage: 'booked_places requis' })
  }

  // Check if the date is already booked
  const { data: bookedDate, error: bookedDateError } = await supabase
    .from('booked_dates')
    .select('is_option, travel_date_id')
    .eq('id', body.id)
    .single()
  if (bookedDateError || !bookedDate) {
    throw createError({ statusCode: 404, statusMessage: bookedDateError?.message || 'Réservation introuvable' })
  }
  if (bookedDate.is_option) {
    throw createError({ statusCode: 409, statusMessage: 'La date est déjà réservée' })
  }
  else {
    // Convert badges from string to array if needed

    // put an option 7 days after now
    const { data, error } = await supabase
      .from('booked_dates')
      .update({ is_option: true, expiracy_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), booked_places: body.booked_places })
      .eq('id', body.id)
      .select('*')
      .single()

    // Update travel_dates.booked_seat
    const { data: allBooked, error: sumError } = await supabase
      .from('booked_dates')
      .select('booked_places')
      .eq('travel_date_id', bookedDate.travel_date_id)
    if (sumError) throw createError({ statusCode: 500, statusMessage: sumError.message })
    const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
    const recomputeRes = await booking.updateTravelDate(bookedDate.travel_date_id, totalBooked)
    if (recomputeRes?.error) throw createError({ statusCode: 500, statusMessage: recomputeRes.error })

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
  }
})
