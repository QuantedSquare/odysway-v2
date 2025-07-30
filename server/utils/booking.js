import supabase from './supabase'

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
  return allBooked
}

const updateTravelDate = async (travel_date_id, totalBooked) => {
  const { error } = await supabase
    .from('travel_dates')
    .update({ booked_seat: totalBooked })
    .eq('id', travel_date_id)
  if (error) {
    console.error('Supabase upsert error:', error)
    return { error: error.message }
  }
  return travel_date_id
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

export default {
  retrieveBooking,
  retrieveBookedDates,
  retrieveBookedDateByDealId,
  retrieveBookedPlacesByTravelDateId,
  updateTravelDate,
  deleteBookedDateByDealId,
}
