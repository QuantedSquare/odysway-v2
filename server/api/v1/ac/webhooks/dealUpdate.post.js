import { createError } from 'h3'

// Helper functions
const formatPrice = (price) => {
  if (!price) return 0
  return +price.replace('€', '').replace('.', '').replace(',', '.')
}

const mapDealStatus = (status) => {
  const statusMap = {
    0: 'Ouvert',
    1: 'Gagné',
    2: 'Perdu',
    3: 'Supprimé',
  }
  return statusMap[status] ?? 'Inconnu'
}

const toBool = (val) => {
  if (val === undefined || val === null || val === '') return null
  return val === 'Oui' || val === true || val === 'true' || val === '1'
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
    const isoDate = body['deal[create_date_iso]']
    const owner = body['deal[owner]']
    const mdate = body['deal[mdate]'] || body['deal[modified_timestamp]'] || null

    // Idempotency guard — skip if (dealId, mdate) tuple already processed
    if (mdate) {
      const eventId = `deal-${dealId}-${mdate}`
      const { data: existing } = await supabase
        .from('ac_processed_events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle()
      if (existing) {
        console.log('Webhook already processed, skipping:', eventId)
        return { success: true, skipped: true, reason: 'duplicate event' }
      }
      // Best-effort record (ignore conflict in parallel races)
      await supabase.from('ac_processed_events').upsert({ id: eventId })
    }

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

    // Ignore all deals belonging to the "Gestions Départs" pipeline (ID 4)
    // — those are internal departure record deals managed separately.
    const pipelineId = body['deal[group]']
    if (pipelineId === '4') {
      return { success: true, skipped: true, reason: 'Gestions Départs pipeline' }
    }

    // Fetch and process contact information
    const contactData = await activecampaign.upsertContactIntoSupabase(contactId)
    if (!contactData) {
      throw createError({
        statusCode: 404,
        message: 'Contact not found',
      })
    }

    // Retrieve custom field data
    const reponse = await activecampaign.getDealById(dealId)
    const customFields = await activecampaign.getDealCustomFields(dealId)
    const fetchedDeal = { ...reponse.deal, ...customFields }

    // Handle destructive/cleanup flows
    if (fetchedDeal.group === '3') {
      // Fetch the row to get travel_date_id
      const bookedRow = await booking.retrieveBookedDateByDealId(dealId)

      console.log('======bookedRow=======', bookedRow)
      if (!bookedRow) {
        console.log('No booked_dates found for dealId:', dealId)
        // Still delete from ActiveCampaign even if no booked_dates found
        try {
          await activecampaign.deleteDeal(dealId)
          console.log('Deal deleted from ActiveCampaign successfully even if no booked_dates found')
        }
        catch (acError) {
          console.error('Error deleting deal from ActiveCampaign:', acError)
        }
        return { success: true, message: 'Deal deleted from ActiveCampaign, no booked_dates found' }
      }
      else {
        const travel_date_id = bookedRow.travel_date_id

        // Delete from ActiveCampaign and Supabase
        try {
          console.log('Attempting to delete deal from ActiveCampaign with dealId:', dealId)
          const deleteResult = await activecampaign.deleteDeal(dealId)
          console.log('Deal deleted from ActiveCampaign successfully, result:', deleteResult)
        }
        catch (acError) {
          console.error('Error deleting deal from ActiveCampaign:', acError)
          console.error('Error details:', {
            message: acError.message,
            dealId: dealId,
          })
        // Continue with Supabase cleanup even if ActiveCampaign deletion fails
        }

        console.log('Attempting to delete deal from Supabase with dealId:', dealId)
        try {
          await booking.deleteBookedDateByDealId(dealId)
          console.log('Deal deleted from Supabase successfully')

          // Update travel_dates.booked_seat
          console.log('Attempting to update travel_dates.booked_seat with travel_date_id:', travel_date_id)
          const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id)
          const totalBooked = allBooked.reduce((acc, row) => acc + (row.booked_places || 0), 0)
          await booking.updateTravelDate(travel_date_id, totalBooked)
          console.log('Booked places updated successfully, travel_date_id:', travel_date_id)

          // Remove departure record deal if no paying clients remain
          await departures.cleanupDepartureDealIfEmpty(travel_date_id)
        }
        catch (bookingError) {
          console.error('Error in booking operations:', bookingError)
          // Continue with the process even if booking operations fail
        }
      }
      return { success: true }
    }
    else if (['Perdu', 'Supprimé'].includes(mapDealStatus(fetchedDeal.status))) {
      // Only update Supabase (do not delete ActiveCampaign deal)
      const bookedRow = await booking.retrieveBookedDateByDealId(dealId)

      console.log('======bookedRow=======', bookedRow)
      if (!bookedRow) {
        console.log('No booked_dates found for dealId:', dealId)
      }
      else {
        const travel_date_id = bookedRow.travel_date_id

        console.log('Attempting to delete deal from Supabase with dealId:', dealId)
        try {
          await booking.deleteBookedDateByDealId(dealId)
          console.log('Deal deleted from Supabase successfully')

          // Update travel_dates.booked_seat
          console.log('Attempting to update travel_dates.booked_seat with travel_date_id:', travel_date_id)
          const allBooked = await booking.retrieveBookedPlacesByTravelDateId(travel_date_id)
          const totalBooked = allBooked.reduce((acc, row) => acc + (row.booked_places || 0), 0)
          await booking.updateTravelDate(travel_date_id, totalBooked)
          console.log('Booked places updated successfully, travel_date_id:', travel_date_id)

          // Remove departure record deal if no paying clients remain
          await departures.cleanupDepartureDealIfEmpty(travel_date_id)
        }
        catch (bookingError) {
          console.error('Error in booking operations:', bookingError)
          // Continue with the process even if booking operations fail
        }
      }
    }

    // Prepare upsert data with type safety and default values
    const upsertData = {
      id: dealId,
      contact: contactId,
      title: fetchedDeal.title,
      status: mapDealStatus(fetchedDeal.status),
      stage: fetchedDeal.stage_title,
      stage_id: fetchedDeal.stage || null,
      pipeline_id: fetchedDeal.pipelineid,
      owner_id: owner || null,
      currency: fetchedDeal.currency || null,
      win_probability: fetchedDeal.winProbability != null ? +fetchedDeal.winProbability : null,
      next_date: fetchedDeal.nextdate || null,
      next_task_id: fetchedDeal.nexttaskid || null,
      total_value: formatPrice(fetchedDeal.value),
      price_per_traveler: +fetchedDeal.basePricePerTraveler / 100 || 0,
      nb_traveler: +fetchedDeal.nbTravelers || 0,
      nb_adults: +fetchedDeal.nbAdults || 0,
      nb_children: +fetchedDeal.nbChildren || 0,
      nb_under_age: +fetchedDeal.nbUnderAge || 0,
      nb_teen: +fetchedDeal.nbTeen || 0,
      travel_type: fetchedDeal.travelType || null,
      indiv_room: toBool(fetchedDeal.indivRoom),
      indiv_room_price: +fetchedDeal.indivRoomPrice / 100 || 0,
      deposit_price: +fetchedDeal.depositPrice / 100 || 0,
      extension_price: +fetchedDeal.extensionPrice / 100 || 0,
      agent_cost: +fetchedDeal.agentCost / 100 || 0,
      rest_to_pay: +fetchedDeal.restToPay / 100 || 0,
      total_paid: +fetchedDeal.alreadyPaid / 100 || 0,
      margin_per_traveler: +fetchedDeal.marginPerTraveler / 100 || 0,
      flight_margin: +fetchedDeal.flightMargin / 100 || 0,
      total_margin: +fetchedDeal.totalMargin / 100 || 0,
      insurance_commission: +fetchedDeal.insuranceCommissionPrice / 100 || 0,
      insurance_choice: fetchedDeal.insurance || 'Aucune Assurance',
      insurance_price_per_traveler: +fetchedDeal.insuranceCommissionPerTraveler / 100 || 0,
      is_cap_exploraction: toBool(fetchedDeal.isCapExploraction),
      promo_code: fetchedDeal.promoCode || null,
      applied_promo_per_traveler: +fetchedDeal.promoValue / 100 || 0,
      children_promo: +fetchedDeal.promoChildren / 100 || 80,
      promo_earlybird: +fetchedDeal.promoEarlybird / 100 || 0,
      got_earlybird: toBool(fetchedDeal.gotEarlybird),
      promo_last_minute: +fetchedDeal.promoLastMinute / 100 || 0,
      got_last_minute: toBool(fetchedDeal.gotLastMinute),
      country: fetchedDeal.country || 'Non renseigné',
      iso: fetchedDeal.iso || null,
      zone_chapka: +fetchedDeal.zoneChapka || null,
      is_couple: toBool(fetchedDeal.isCouple),
      lost_reason: fetchedDeal.reasonLost || fetchedDeal.otherReasonLost || null,
      rest_to_pay_per_traveler: +fetchedDeal.restToPayPerTraveler / 100 || 0,
      max_children_age: +fetchedDeal.maxChildrenAge || 12,
      include_flight: toBool(fetchedDeal.includeFlight),
      flight_ticket_bought: toBool(fetchedDeal.flightTicketBought),
      flight_ticket_price_per_traveler: +fetchedDeal.flightPrice / 100 || 0,
      departure_date: fetchedDeal.departureDate || null,
      return_date: fetchedDeal.returnDate || null,
      forecasted_closing_date: fetchedDeal.forecastedClosingDate || null,
      conversion_date: fetchedDeal.conversionDate || null,
      seller: owner,
      source: fetchedDeal.source || null,
      acquisition_source: fetchedDeal.acquisitionSource || null,
      other_acquisition_source: fetchedDeal.otherAcquisitionSource || null,
      utm: fetchedDeal.utm || null,
      slug: fetchedDeal.slug || null,
      current_step: fetchedDeal.currentStep || null,
      link_bms: fetchedDeal.linkBms || null,
      paiement_method: fetchedDeal.paiementMethod || null,
      created_at: fetchedDeal.oldCreationDate || isoDate,
      mdate: mdate || null,
      updated_at: mdate || new Date().toISOString(),
    }

    await activecampaign.recalculatTotalValues(dealId)
    console.log('[dealUpdate] before upsert gate', {
      hasContactData: !!contactData,
      hasDataArray: !!contactData?.data,
      dataLength: contactData?.data?.length,
      contactEmail: contactData?.contact?.email,
      dealId,
      contactId,
    })
    console.log('[dealUpdate] upsertData preview', {
      id: upsertData.id,
      contact: upsertData.contact,
      status: upsertData.status,
      pipeline_id: upsertData.pipeline_id,
      total_value: upsertData.total_value,
    })
    if (contactData.data && contactData.data.length > 0 && contactData.contact.email !== 'ottmann.alex@gmail.com' && contactData.contact.email !== 'test@gmail.com') {
      // Upsert deal data to Supabase
      const { error, data: upsertedData } = await supabase
        .from('activecampaign_deals')
        .upsert(upsertData)
        .select()

      // Log any upsert errors
      if (error) {
        console.error('Supabase upsert error:', error)
        throw createError({
          statusCode: 500,
          message: 'Failed to upsert deal data',
        })
      }

      // Log successful upsert
      console.log('Deal upserted successfully:', upsertedData)

      return { success: true }
    }
  }
  catch (err) {
    console.error('DealUpdate webhook error:', err)
    throw createError({
      statusCode: 500,
      message: 'Unexpected error in deal update process',
    })
  }
})
