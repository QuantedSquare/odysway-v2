import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.id) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'OPTION_NO_ID', step: 'option_booking', origin: { field: 'id', received: null }, message: 'id requis' })
  }
  if (body.booked_places === undefined || body.booked_places === null) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'OPTION_NO_BOOKED_PLACES', step: 'option_booking', origin: { field: 'booked_places', received: body.booked_places ?? null }, message: 'booked_places requis' })
  }

  // Check if the date is already booked
  const { data: bookedDate, error: bookedDateError } = await supabase
    .from('booked_dates')
    .select('is_option, travel_date_id')
    .eq('id', body.id)
    .single()
  if (bookedDateError || !bookedDate) {
    throw funnelReporter.funnelCreateError({ statusCode: 404, code: 'OPTION_BOOKED_DATE_NOT_FOUND', step: 'option_booking', origin: { field: 'id', received: body.id }, message: bookedDateError?.message || 'Réservation introuvable' })
  }
  if (bookedDate.is_option) {
    // Expected business case (already-optioned) — tagged so the backstop hook
    // skips it; the client handles this message explicitly.
    throw createError({ statusCode: 409, statusMessage: 'La date est déjà réservée', data: { code: 'OPTION_ALREADY_PLACED' } })
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
