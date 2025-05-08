import axios from 'axios'
import dayjs from 'dayjs'
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
  const { error, data } = await supabase.from('booked_dates').select().eq('travel_date_id', travel_date_id)
  if (error) console.error('Supabase upsert error:', error)
  return data
}

export default {
  retrieveBooking,
  retrieveBookedDates,
}
