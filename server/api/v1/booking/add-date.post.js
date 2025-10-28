import { defineEventHandler, readBody } from 'h3'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const insertData = { ...body }
  // if (typeof insertData.badges === 'string') {
  //   insertData.badges = insertData.badges.split(',').map(b => b.trim()).filter(Boolean)
  // }
  if (!('booked_seat' in insertData)) insertData.booked_seat = 0

  const { data, error } = await supabase
    .from('travel_dates')
    .insert([insertData])
    .select('*')
    .single()
  if (error) return { error: error.message }
  return data
})
