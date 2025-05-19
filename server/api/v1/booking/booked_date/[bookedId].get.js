import { defineEventHandler } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { bookedId } = event.context.params
  const { data, error } = await supabase
    .from('booked_dates')
    .select('*')
    .eq('id', bookedId)
    .single()

  if (error) return {}
  return data
})
