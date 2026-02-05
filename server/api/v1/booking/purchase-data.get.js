/**
 * API Endpoint: Get Purchase Data for GTM Tracking
 *
 * Fetches all necessary data for GTM purchase event from booked_dates and ActiveCampaign
 * Used on confirmation page after successful payment
 *
 * Query params:
 * - booked_id: ID from booked_dates table
 *
 * Returns:
 * - transactionId: Stripe/Alma transaction ID (parsed from AC deal notes)
 * - paymentType: 'CB', 'alma', or 'Virement'
 * - totalValue: Total paid amount
 * - optinNewsletter: Newsletter opt-in status (checked via contact list membership)
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
    // Fetch booked_date data (only has is_option and deal_id)
    const { data: bookedDate, error: bookedError } = await supabase
      .from('booked_dates')
      .select('deal_id, is_option')
      .eq('id', booked_id)
      .single()
    console.log('bookedDate', bookedDate)
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

    /**
   * Extract country from phone number based on country code
   * @param {string} phone - Full phone number with country code (e.g., '+33612345678')
   * @returns {string} - Country name or null
   */
    const getCountryFromPhone = (phone) => {
      if (!phone) return null

      const countryMap = {
        '+33': 'France',
        '+32': 'Belgium',
        '+1': 'Canada/USA',
        '+41': 'Switzerland',
        '+44': 'United Kingdom',
        '+39': 'Italy',
        '+34': 'Spain',
        '+49': 'Germany',
        '+352': 'Luxembourg',
        '+31': 'Netherlands',
      }

      // Find matching country code
      for (const [code, country] of Object.entries(countryMap)) {
        if (phone.startsWith(code)) {
          return country
        }
      }

      return null
    }
    const userCountry = getCountryFromPhone(contact.phone) || 'Unknown'

    // Check newsletter opt-in via contact list membership (List ID 18 = "Optin Newsletter")
    // TODO: Check if this is correct
    const hasNewsletterOptin = contact.contactLists?.some(list => list.list === '18') || false

    // Fetch deal notes to extract transaction ID and payment type
    // Notes format: "Paiement CB - pi_3Sx7ovAYZjtHS4WQ2DKAdLek - Alex & Yuzu - email@example.com - 510€"
    const notesResponse = await $fetch(`${process.env.ACTIVE_CAMPAIGN_URL}/deals/${bookedDate.deal_id}/notes`, {
      headers: {
        'Api-Token': process.env.ACTIVE_CAMPAIGN_API_KEY,
      },
    })

    // Find the most recent payment note (starts with "Paiement")
    let transactionId = bookedDate.deal_id
    let paymentType = 'CB'

    if (notesResponse?.notes) {
      // Sort notes by date (most recent first)
      const sortedNotes = [...notesResponse.notes].sort((a, b) => {
        return new Date(b.cdate) - new Date(a.cdate)
      })

      // Find first payment note
      const paymentNote = sortedNotes.find(note => note.note?.startsWith('Paiement'))

      if (paymentNote) {
        // Parse payment note: "Paiement CB - pi_xxx - Name - email - amount"
        const noteParts = paymentNote.note.split(' - ')
        if (noteParts.length >= 2) {
          // Extract payment type (e.g., "Paiement CB" -> "CB")
          paymentType = noteParts[0].replace('Paiement ', '').trim()
          // Extract transaction ID (second part)
          transactionId = noteParts[1].trim()
        }
      }
    }

    // Build response with all necessary data for GTM tracking
    return {
      isOption: false,
      transactionId: (transactionId.startsWith('pi_') || transactionId.startsWith('al')) ? transactionId : bookedDate.deal_id,
      paymentType,
      totalValue: (deal.totalTravelPrice || 0) / 100, // Convert from cents to euros
      optinNewsletter: hasNewsletterOptin,
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
        insurance: deal.insurance && deal.insurance !== 'Aucune Assurance' ? deal.insurance : null,
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
