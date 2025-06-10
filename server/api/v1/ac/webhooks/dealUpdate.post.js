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
  try {
    // Extract deal data from request body
    const body = await readBody(event)
    console.log('===========body', body, '========')
    const { deal } = body
    console.log('===========deal body', deal, '========')
    // Validate input
    if (!deal || !deal.id) {
      throw createError({
        statusCode: 400,
        message: 'Invalid deal data',
      })
    }

    // Fetch and process contact information
    const contactData = await activecampaign.upsertContactIntoSupabase(deal.contactid)
    if (!contactData) {
      throw createError({
        statusCode: 404,
        message: 'Contact not found',
      })
    }

    // Retrieve custom field data
    const reponse = await activecampaign.getDealById(deal.id)
    const customFields = await activecampaign.getDealCustomFields(deal.id)
    const fetchedDeal = { ...reponse.deal, ...customFields }

    // Retrieve deal owner
    const owner = await activecampaign.retrieveOwner(deal.id)

    // Prepare upsert data with type safety and default values
    const upsertData = {
      id: deal.id,
      contact: contactData.data[0].id,
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
      created_at: fetchedDeal.create_date_iso.includes('2023-12-19')
        ? (fetchedDeal.oldCreationDate || fetchedDeal.create_date_iso)
        : fetchedDeal.create_date_iso,
    }

    // Upsert deal data to Supabase
    const { error, data: upsertedData } = await supabase
      .from('activecampaign_deals')
      .upsert(upsertData)
      .select()

    await activecampaign.recalculatTotalValues(deal.id)
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
  catch (err) {
    console.error('DealUpdate webhook error:', err)
    throw createError({
      statusCode: 500,
      message: 'Unexpected error in deal update process',
    })
  }
})
