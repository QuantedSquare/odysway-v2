import { defineEventHandler, getQuery } from 'h3'



export default defineEventHandler(async (event) => {
  const { booked_id } = getQuery(event)

  // Check if booking exists in Supabase
  const { data: bookedDate, error: supabaseError } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', booked_id)
    .single()

  if (supabaseError || !bookedDate) {
    return false
  }

  // Check if deal exists in ActiveCampaign
  try {
    const { deal } = await activecampaign.getDealById(bookedDate.deal_id)
    return !!deal
  }
  catch {
    // If the deal doesn't exist in ActiveCampaign, return false
    return false
  }
})
