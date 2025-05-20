import { defineEventHandler, readBody } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Check if the date is already booked
  const { data: bookedDate, error: bookedDateError } = await supabase
    .from('booked_dates')
    .select('is_option, travel_date_id')
    .eq('id', body.id)
    .single()
  if (bookedDateError) return { error: bookedDateError.message }
  if (bookedDate.is_option) return { error: 'La date est déjà réservée' }
  else {
    // Convert badges from string to array if needed

    // put an option 10 days after now
    const { data, error } = await supabase
      .from('booked_dates')
      .update({ is_option: true, expiracy_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) })
      .eq('id', body.id)
      .select('*')
      .single()

    // Update travel_dates.booked_seat
    const { data: allBooked, error: sumError } = await supabase
      .from('booked_dates')
      .select('booked_places')
      .eq('travel_date_id', bookedDate.travel_date_id)
    if (sumError) return { error: sumError.message }
    const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
    await supabase
      .from('travel_dates')
      .update({ booked_seat: totalBooked })
      .eq('id', bookedDate.travel_date_id)

    if (error) return { error: error.message }
    return data
  }
})
