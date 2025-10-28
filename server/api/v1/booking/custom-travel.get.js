import { defineEventHandler } from 'h3'


export default defineEventHandler(async (event) => {
  const { data: customTravels, error } = await supabase
    .from('travel_dates')
    .select('*, booked_dates(*)')
    .eq('is_custom_travel', true)
  console.log('!! travels', customTravels)
  if (error) {
    return []
  }
  // fetch deal for each booked_date =>  use deal_id
  const enrichedCustomTravels = await Promise.all(customTravels.map(async (travel) => {
    const retrievedDeals = await Promise.all(travel.booked_dates.map(async (date) => {
      const deal = await $fetch(`/api/v1/ac/deals/${date.deal_id}`)
      console.log('!! deal', deal)
      return { ...date, deal }
    }))
    return { ...travel, booked_dates: retrievedDeals }
  }))
  console.log('!! enrichedCustomTravels', enrichedCustomTravels)
  return enrichedCustomTravels
})
