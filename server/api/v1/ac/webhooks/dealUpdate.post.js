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
    const isoDate = body['deal[create_date_iso]']
    const owner = body['deal[owner]']

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

    if (fetchedDeal.group === '3') {
      await activecampaign.deleteDeal(dealId)
      const { error, data } = await supabase.from('activecampaign_deals').delete().match({ id: dealId }).select()
      console.log('Delete supabaseDeal OK', data)

      const { error: errorBookedDates, data: dataBookedDates } = await supabase.from('booked_dates').delete().match({ deal_id: dealId }).select()
      console.log('Delete bookedDates OK', dataBookedDates)

      return { success: true }
    }

    // Retrieve deal owner
    // const owner = await activecampaign.retrieveOwner(dealId)

    // Prepare upsert data with type safety and default values
    const upsertData = {
      id: dealId,
      contact: contactId,
      title: fetchedDeal.title,
      status: mapDealStatus(fetchedDeal.status),
      stage: fetchedDeal.stage_title,
      pipeline_id: fetchedDeal.pipelineid,
      total_value: formatPrice(fetchedDeal.value),
      price_per_traveler: +fetchedDeal.basePricePerTraveler / 100 || 0,
      nb_traveler: +fetchedDeal.nbTravelers || 0,
      nb_adults: +fetchedDeal.nbAdults || 0,
      nb_children: +fetchedDeal.nbChildren || 0,
      travel_type: fetchedDeal.travelType || null,
      indiv_room: fetchedDeal.indivRoom === 'Oui',
      rest_to_pay: +fetchedDeal.restToPay / 100 || 0,
      total_paid: +fetchedDeal.alreadyPaid / 100 || 0,
      margin_per_traveler: +fetchedDeal.marginPerTraveler / 100 || 0,
      flight_margin: +fetchedDeal.flightMargin / 100 || 0,
      total_margin: +fetchedDeal.totalMargin / 100 || 0,
      insurance_commission: +fetchedDeal.insuranceCommissionPrice / 100 || 0,
      insurance_choice: fetchedDeal.insurance || 'Aucune Assurance',
      promo_code: fetchedDeal.promoCode || null,
      insurance_price_per_traveler: +fetchedDeal.insuranceCommissionPerTraveler / 100 || 0,
      country: fetchedDeal.country || 'Non renseigné',
      is_couple: fetchedDeal.isCouple === 'Oui',
      lost_reason: fetchedDeal.reasonLost || fetchedDeal.otherReasonLost || null,
      applied_promo_per_traveler: +fetchedDeal.promoValue / 100 || 0,
      children_promo: +fetchedDeal.promoChildren / 100 || 80,
      // teen_promo: +fetchedDeal.promoTeen / 100 || 80,
      rest_to_pay_per_traveler: +fetchedDeal.restToPayPerTraveler / 100 || 0,
      iso: fetchedDeal.iso || null,
      // max_teen_age: +fetchedDeal.maxTeenAge || 18,
      max_children_age: +fetchedDeal.maxChildrenAge || 12,
      flight_ticket_price_per_traveler: +fetchedDeal.flightPrice / 100 || 0,
      departure_date: fetchedDeal.departureDate || null,
      return_date: fetchedDeal.returnDate || null,
      conversion_date: fetchedDeal.conversionDate || null,
      seller: owner,
      source: fetchedDeal.source || null,
      paiement_method: fetchedDeal.paiementMethod || null,
      created_at: isoDate.includes('2023-12-19')
        ? (fetchedDeal.oldCreationDate || isoDate)
        : isoDate,
    }

    await activecampaign.recalculatTotalValues(dealId)
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
