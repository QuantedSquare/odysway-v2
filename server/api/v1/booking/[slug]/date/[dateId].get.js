import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const { data, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .single()

  if (error) return {}
  return data
})
