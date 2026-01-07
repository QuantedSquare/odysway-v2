import supabase from './supabase'

const computeTravelDateStatus = ({ booked_seat, min_travelers, max_travelers }) => {
  const booked = Number(booked_seat || 0)
  const min = Number(min_travelers || 0)
  const max = Number(max_travelers || 0)

  if (max > 0 && booked >= max) return 'guaranteed'
  if (min > 0 && booked >= min) return 'confirmed'
  return 'soon_confirmed'
}

const retrieveBooking = async (slug) => {
  const query = supabase.from('travel_dates').select()
  try {
    if (slug) {
      const { error, data } = await query.eq('travel_slug', slug).single()
      if (error) console.error('Supabase upsert error:', error)
      return data
    }
    else {
      const { error, data } = await query
      if (error) console.error('Supabase upsert error:', error)
      return data
    }
  }
  catch (err) {
    console.error('Contact upsert error:', err)
    throw createError({
      statusCode: 400,
      message: 'Error upserting contact',
    })
  }
}

const retrieveBookedDates = async (travel_date_id) => {
  const { error, data } = await supabase
    .from('booked_dates')
    .select()
    .eq('travel_date_id', travel_date_id)
  if (error) console.error('Supabase retrieve error:', error)
  return data
}

const retrieveBookedDateById = async (bookedId) => {
  const { data: bookedRow, error: fetchError } = await supabase
    .from('booked_dates')
    .select('travel_date_id, deal_id')
    .eq('id', bookedId)
    .single()
  if (fetchError) {
    console.error('Supabase retrieve error:', fetchError)
    return { error: fetchError.message }
  }
  return bookedRow
}

const retrieveBookedDateByDealId = async (dealId) => {
  const { error, data } = await supabase
    .from('booked_dates')
    .select('travel_date_id')
    .eq('deal_id', dealId)
    .single()
  if (error) {
    console.error('Supabase retrieve error:', error)
    return { error: error.message }
  }
  return data
}

const retrieveBookedPlacesByTravelDateId = async (travel_date_id) => {
  const { error: sumError, data: allBooked } = await supabase
    .from('booked_dates')
    .select('booked_places')
    .eq('travel_date_id', travel_date_id)
  if (sumError) {
    console.error('Supabase sum error:', sumError)
    return { error: sumError.message }
  }
  return allBooked || []
}

const updateTravelDate = async (travel_date_id, totalBooked) => {
  // Fetch min/max (status is derived from these + booked_seat)
  const { data: row, error: fetchError } = await supabase
    .from('travel_dates')
    .select('id, min_travelers, max_travelers')
    .eq('id', travel_date_id)
    .single()

  if (fetchError || !row) {
    console.error('Supabase retrieve error:', fetchError)
    return { error: fetchError?.message || 'travel_dates not found' }
  }

  const nextStatus = computeTravelDateStatus({
    booked_seat: totalBooked,
    min_travelers: row.min_travelers,
    max_travelers: row.max_travelers,
  })

  const { error } = await supabase
    .from('travel_dates')
    .update({ booked_seat: totalBooked, status: nextStatus })
    .eq('id', travel_date_id)

  if (error) {
    console.error('Supabase upsert error:', error)
    return { error: error.message }
  }
  return { id: travel_date_id, booked_seat: totalBooked, status: nextStatus }
}

const recomputeBookedSeatAndStatus = async (travel_date_id) => {
  const allBooked = await retrieveBookedPlacesByTravelDateId(travel_date_id)
  if (allBooked?.error) return { error: allBooked.error }
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  return await updateTravelDate(travel_date_id, totalBooked)
}

const recomputeStatusOnly = async (travel_date_id) => {
  const { data: row, error } = await supabase
    .from('travel_dates')
    .select('id, booked_seat, min_travelers, max_travelers, status')
    .eq('id', travel_date_id)
    .single()
  if (error || !row) return { error: error?.message || 'travel_dates not found' }

  const nextStatus = computeTravelDateStatus(row)
  if (row.status === nextStatus) return { id: travel_date_id, status: row.status, updated: false }

  const { error: updateError } = await supabase
    .from('travel_dates')
    .update({ status: nextStatus })
    .eq('id', travel_date_id)
  if (updateError) return { error: updateError.message }
  return { id: travel_date_id, status: nextStatus, updated: true }
}

const deleteBookedDateByDealId = async (dealId) => {
  const { error } = await supabase
    .from('booked_dates')
    .delete()
    .eq('deal_id', dealId)
  if (error) {
    console.error('Supabase delete error:', error)
    return { error: error.message }
  }
  return dealId
}

const deleteBookedDateById = async (bookedId) => {
  const { error } = await supabase
    .from('booked_dates')
    .delete()
    .eq('id', bookedId)
  if (error) {
    console.error('Supabase delete error:', error)
    return { error: error.message }
  }
  return bookedId
}

export default {
  retrieveBooking,
  retrieveBookedDates,
  retrieveBookedDateByDealId,
  retrieveBookedDateById,
  retrieveBookedPlacesByTravelDateId,
  updateTravelDate,
  recomputeBookedSeatAndStatus,
  recomputeStatusOnly,
  deleteBookedDateByDealId,
  deleteBookedDateById,
}
