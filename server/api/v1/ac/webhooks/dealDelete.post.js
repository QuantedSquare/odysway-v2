import { createError } from 'h3'

const mapDealStatus = (status) => {
  const statusMap = {
    0: 'Ouvert',
    1: 'Gagné',
    default: 'Perdu',
  }
  return statusMap[status] || statusMap.default
}

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: 'Unauthorized' }
  }
  try {
    // Extract deal data from request body
    const body = await readBody(event)
    console.log('===========body', body, '========')

    const dealId = body['deal[id]']
    const contactId = body['deal[contactid]'] || body['contact[id]']

    console.log('===========dealId', dealId, '========')
    console.log('===========contactId', contactId, '========')
    if (!dealId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid deal data: missing deal id',
      })
    }
    if (!contactId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid deal data: missing contact id',
      })
    }

    // Retrieve custom field data
    const reponse = await activecampaign.getDealById(dealId)
    const customFields = await activecampaign.getDealCustomFields(dealId)
    const fetchedDeal = { ...reponse.deal, ...customFields }

    // Check if deal is moved to pipeline group 3 or status is 'Perdu'
    if (fetchedDeal.group === '3' || mapDealStatus(fetchedDeal.status) === 'Perdu') {
      // Fetch the row to get travel_date_id
      const { data: bookedRow, error: fetchError } = await supabase
        .from('booked_dates')
        .select('travel_date_id')
        .eq('deal_id', dealId)
        .single()

      console.log('======bookedRow=======', bookedRow, fetchError)
      if (fetchError || !bookedRow) return { error: 'Impossible de trouver la réservation à supprimer.' }
      const travel_date_id = bookedRow.travel_date_id

      // Delete from ActiveCampaign and Supabase
      await activecampaign.deleteDeal(dealId)
      const { error } = await supabase
        .from('booked_dates')
        .delete()
        .eq('deal_id', dealId)
      if (error) return { error: error.message }

      // Update travel_dates.booked_seat
      const { data: allBooked, error: sumError } = await supabase
        .from('booked_dates')
        .select('booked_places')
        .eq('travel_date_id', travel_date_id)
      if (sumError) return { error: sumError.message }
      const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
      await supabase
        .from('travel_dates')
        .update({ booked_seat: totalBooked })
        .eq('id', travel_date_id)

      return { success: true }
    }
  }
  catch (err) {
    console.error('DealDelete webhook error:', err)
    throw createError({
      statusCode: 500,
      message: 'Unexpected error in deal delete process',
    })
  }
})
