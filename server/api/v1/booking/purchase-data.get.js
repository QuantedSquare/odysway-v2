/**
 * API Endpoint: Get Purchase Data for GTM Tracking
 *
 * Fetches all necessary data for GTM purchase event from booked_dates
 * Used on confirmation page after successful payment
 *
 * Query params:
 * - booked_id: ID from booked_dates table
 *
 * Returns:
 * - transactionId: Stripe/Alma transaction ID
 * - paymentType: 'CB', 'alma', or 'virement'
 * - totalValue: Total paid amount
 * - optinNewsletter: Newsletter opt-in status
 * - userData: User information (id, email, phone, country)
 * - dynamicDealValues: Deal values (nbAdults, nbChildren, insurance, etc.)
 */

export default defineEventHandler(async (event) => {
  const { booked_id } = getQuery(event)

  if (!booked_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'booked_id is required',
    })
  }

  try {
    // Fetch booked_date data
    const { data: bookedDate, error: bookedError } = await supabase
      .from('booked_dates')
      .select('deal_id, transaction_id, payment_type, is_option')
      .eq('id', booked_id)
      .single()

    if (bookedError || !bookedDate) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Booked date not found',
      })
    }

    // Don't track purchase for options
    if (bookedDate.is_option) {
      return {
        isOption: true,
      }
    }

    // Fetch deal data from ActiveCampaign
    const [dealData, customFields] = await Promise.all([
      activecampaign.getDealById(bookedDate.deal_id),
      activecampaign.getDealCustomFields(bookedDate.deal_id),
    ])

    if (!dealData?.deal) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Deal not found in ActiveCampaign',
      })
    }

    const deal = { ...dealData.deal, ...customFields }

    // Fetch contact data from ActiveCampaign
    const { contact } = await activecampaign.getClientById(deal.contact)

    if (!contact) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Contact not found in ActiveCampaign',
      })
    }

    // Extract country from phone number
    const { getCountryFromPhone } = useGtmTracking()
    const userCountry = getCountryFromPhone(contact.phone) || 'Unknown'

    // Build response with all necessary data for GTM tracking
    return {
      isOption: false,
      transactionId: bookedDate.transaction_id || bookedDate.deal_id,
      paymentType: bookedDate.payment_type || 'CB',
      totalValue: (deal.totalTravelPrice || 0) / 100, // Convert from cents
      optinNewsletter: deal.optin_newsletter === 'Oui',
      userData: {
        userId: contact.id,
        userMail: contact.email,
        userPhone: contact.phone,
        userCountry,
      },
      dynamicDealValues: {
        nbAdults: parseInt(deal.nbAdults) || 0,
        nbChildren: parseInt(deal.nbChildren) || 0,
        nbTravelers: parseInt(deal.nbTravelers) || 0,
        insurance: deal.insurance !== 'Aucune Assurance' ? deal.insurance : null,
        insuranceCommissionPrice: parseInt(deal.insuranceCommissionPrice) || 0,
        indivRoom: deal.indivRoom === 'Oui',
        extensionPrice: parseInt(deal.extensionPrice) || 0,
      },
    }
  }
  catch (err) {
    console.error('Error fetching purchase data:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Error fetching purchase data',
    })
  }
})
