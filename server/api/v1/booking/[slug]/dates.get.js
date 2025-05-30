import { defineEventHandler } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params
  const { data, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('travel_slug', slug)

  if (error) return { error: error.message }
  return data
})
