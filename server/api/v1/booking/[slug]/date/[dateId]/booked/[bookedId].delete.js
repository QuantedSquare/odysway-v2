import { defineEventHandler } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { bookedId } = event.context.params
  const { error } = await supabase
    .from('booked_dates')
    .delete()
    .eq('id', bookedId)
  if (error) return { error: error.message }
  return { success: true }
})
