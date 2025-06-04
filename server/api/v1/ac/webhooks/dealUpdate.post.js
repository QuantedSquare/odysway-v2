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
    const { deal } = await readBody(event)

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
    const customData = await activecampaign.getCustomFieldData(deal.id)
    const customFields = activecampaign.handleCustomFields(customData.dealCustomFieldData)

    // Retrieve deal owner
    const owner = await activecampaign.retrieveOwner(deal.id)

    // Prepare upsert data with type safety and default values
    const upsertData = {
      id: deal.id,
      contact: contactData.data[0].id,
      title: deal.title,
      status: mapDealStatus(deal.status),
      stage: deal.stage_title,
      pipeline_id: deal.pipelineid,
      total_value: formatPrice(deal.value),
      price_per_traveler: +customFields.basePricePerTraveler / 100 || 0,
      nb_traveler: +customFields.nbTravelers || 0,
      nb_adults: +customFields.nbAdults || 0,
      nb_children: +customFields.nbChildren || 0,
      travel_type: customFields.travelType || null,
      indiv_room: customFields.indivRoom === 'Oui',
      rest_to_pay: +customFields.restToPay / 100 || 0,
      total_paid: +customFields.alreadyPaid / 100 || 0,
      margin_per_traveler: +customFields.marginPerTraveler / 100 || 0,
      flight_margin: +customFields.flightMargin / 100 || 0,
      total_margin: +customFields.totalMargin / 100 || 0,
      insurance_commission: +customFields.insuranceCommissionPrice / 100 || 0,
      insurance_choice: customFields.insurance || 'Aucune Assurance',
      promo_code: customFields.promoCode || null,
      insurance_price_per_traveler: +customFields.insuranceCommissionPerTraveler / 100 || 0,
      country: customFields.country || 'Non renseigné',
      is_couple: customFields.isCouple === 'Oui',
      lost_reason: customFields.reasonLost || customFields.otherReasonLost || null,
      applied_promo_per_traveler: +customFields.promoValue / 100 || 0,
      children_promo: +customFields.promoChildren / 100 || 80,
      // teen_promo: +customFields.promoTeen / 100 || 80,
      rest_to_pay_per_traveler: +customFields.restToPayPerTraveler / 100 || 0,
      iso: customFields.iso || null,
      // max_teen_age: +customFields.maxTeenAge || 18,
      max_children_age: +customFields.maxChildrenAge || 12,
      flight_ticket_price_per_traveler: +customFields.flightPrice / 100 || 0,
      departure_date: customFields.departureDate || null,
      return_date: customFields.returnDate || null,
      conversion_date: customFields.conversionDate || null,
      seller: owner,
      source: customFields.source || null,
      paiement_method: customFields.paiementMethod || null,
      created_at: deal.create_date_iso.includes('2023-12-19')
        ? (customFields.oldCreationDate || deal.create_date_iso)
        : deal.create_date_iso,
    }

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
  catch (err) {
    console.error('DealUpdate webhook error:', err)
    throw createError({
      statusCode: 500,
      message: 'Unexpected error in deal update process',
    })
  }
})
