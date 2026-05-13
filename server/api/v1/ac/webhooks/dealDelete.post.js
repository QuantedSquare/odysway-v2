import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: 'Unauthorized' }
  }
  try {
    const body = await readBody(event)
    console.log('Deal delete webhook received', body)

    const dealId = body['deal[id]']
    if (!dealId) {
      throw createError({ statusCode: 400, message: 'Missing deal id' })
    }

    // Purge booked_dates + sync travel_dates seat count
    const bookedRow = await booking.retrieveBookedDateByDealId(dealId)
    if (bookedRow) {
      const travel_date_id = bookedRow.travel_date_id
      try {
        await booking.deleteBookedDateByDealId(dealId)
        const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id)
        const totalBooked = allBooked.reduce((acc, row) => acc + (row.booked_places || 0), 0)
        await booking.updateTravelDate(travel_date_id, totalBooked)
        await departures.cleanupDepartureDealIfEmpty(travel_date_id)
      }
      catch (err) {
        console.error('Error purging booking rows for deleted deal:', err)
      }
    }

    // Remove archived deal row
    const { error } = await supabase
      .from('activecampaign_deals')
      .delete()
      .eq('id', dealId)

    if (error) {
      console.error('Supabase delete error:', error)
      throw createError({ statusCode: 500, message: 'Failed to delete deal' })
    }

    return { success: true, deletedDealId: dealId }
  }
  catch (err) {
    console.error('DealDelete webhook error:', err)
    throw createError({ statusCode: 500, message: 'Unexpected error in deal delete process' })
  }
})
