import { defineEventHandler } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params
  console.log('===========slug in dates.get.js===========', slug)
  const { data, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('travel_slug', slug)
  console.log('SUPABASE RETURN: ', data, ' -- error: ', error)
  if (error) return { error: error.message }
  return data
})
