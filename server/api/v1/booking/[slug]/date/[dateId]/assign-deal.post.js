import { defineEventHandler, readBody, createError } from 'h3'

// When Assigning an activecampaign deal to a booked_date, we need to update the deal with the paiementLink, slug and redirection to date in the bms.
// Also update the booked_dates table with the booked_places, is_option and expiracy_date. depending if it's an option or not.

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const config = useRuntimeConfig()
  const bookingUser = getBookingUserOrNull(event)
  console.log('=====BookingUser=====', bookingUser)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  const { dealId, booked_places, is_option, expiracy_date, nbTravelers: bodyNbTravelers, alreadyPaid: bodyAlreadyPaid } = await readBody(event)
  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'dealId requis' })
  }
  const origin = config.public.siteURL
  const skipAcFetch = typeof bodyNbTravelers === 'number' && typeof bodyAlreadyPaid === 'number'
  console.log(`[assign-deal] START dealId=${dealId} dateId=${dateId} slug=${slug} skipAcFetch=${skipAcFetch}`)

  // Ensure the date exists and matches slug (avoid acting on wrong resource)
  const { data: travelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }

  // When client provides nbTravelers/alreadyPaid, skip the AC fetch (~300-400ms saved)
  let deal = null
  let nbTravelers, alreadyPaid

  if (skipAcFetch) {
    nbTravelers = bodyNbTravelers
    alreadyPaid = bodyAlreadyPaid
  }
  else {
    // Fallback: fetch from AC (BMS / manual assignment flow)
    const acFetchStart = Date.now()
    try {
      const [fetchedDeal, customFields] = await Promise.all([
        activecampaign.getDealById(dealId),
        activecampaign.getDealCustomFields(dealId),
      ])
      deal = { ...fetchedDeal.deal, ...customFields }
    }
    catch {
      console.error(`[assign-deal] AC fetch FAILED dealId=${dealId} after ${Date.now() - acFetchStart}ms`)
      throw createError({ statusCode: 502, statusMessage: 'Erreur lors de la récupération du deal AC' })
    }
    if (!deal) throw createError({ statusCode: 404, statusMessage: 'Deal introuvable' })
    nbTravelers = +deal.nbTravelers
    alreadyPaid = +deal.alreadyPaid
    console.log(`[assign-deal] AC fetch done dealId=${dealId} in ${Date.now() - acFetchStart}ms`)
  }

  if (!nbTravelers) throw createError({ statusCode: 400, statusMessage: 'Le deal ne contient pas nbTravelers' })

  // If user placed an option or already paid, he is counted as a booked traveler, otherwise he is just assigned to the deal temporarily
  const bookedPlaceCount = (alreadyPaid > 0 || is_option === true) ? (booked_places || Number(nbTravelers)) : 0
  // Insert into booked_dates
  const { data: bookedDate, error } = await supabase
    .from('booked_dates')
    .insert([{
      travel_date_id: dateId,
      deal_id: dealId,
      booked_places: bookedPlaceCount,
      is_option: is_option || null,
      expiracy_date: expiracy_date || null,
    }])
    .select('*')
    .single()
  if (bookedDate) {
    console.log(`[assign-deal] Supabase insert OK bookedId=${bookedDate.id} dealId=${dealId} in ${Date.now() - startTime}ms`)
  }
  const alreadyAssigned = error && error.message.includes('duplicate key value violates unique constraint')
  if (alreadyAssigned) {
    console.warn(`[assign-deal] Duplicate dealId=${dealId} dateId=${dateId}`)
    const { data: existingBookedDate, error: existingError } = await supabase
      .from('booked_dates')
      .select('deal_id, travel_dates(id, travel_slug)')
      .eq('deal_id', dealId)
      .single()
    if (existingError || !existingBookedDate?.travel_dates) {
      throw createError({ statusCode: 409, statusMessage: 'Deal déjà assigné' })
    }
    throw createError({
      statusCode: 409,
      statusMessage: 'Deal déjà assigné à une autre date',
      data: {
        redirectTo: `/booking-management/${existingBookedDate.travel_dates.travel_slug}/${existingBookedDate.travel_dates.id}`,
      },
    })
  }
  else if (error) {
    console.error(`[assign-deal] Supabase insert FAILED dealId=${dealId}`, error.message)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // Update travel_dates.booked_seat
  const { data: allBooked, error: sumError } = await supabase
    .from('booked_dates')
    .select('booked_places')
    .eq('travel_date_id', dateId)
  if (sumError) throw createError({ statusCode: 500, statusMessage: sumError.message })
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  const recomputeRes = await booking.updateTravelDate(dateId, totalBooked)
  if (recomputeRes?.error) throw createError({ statusCode: 500, statusMessage: recomputeRes.error })

  // If the deal has already paid, sync it with the departure record deal (pipeline 4)
  if (bookedPlaceCount > 0 && alreadyPaid > 0 && deal) {
    await departures.handlePaymentForDeparture(bookedDate, deal.title, deal.contact)
  }

  const { data: travel_date, error: slugError } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .single()
  if (slugError || !travel_date) throw createError({ statusCode: 500, statusMessage: slugError?.message || 'Erreur travel_date' })

  const data_to_update = {
    slug: travel_date.travel_slug,
    linkBms: `${origin}/booking-management/${travel_date.travel_slug}/${dateId}`,
  }
  if (is_option) {
    Object.assign(data_to_update, { stage: '27', currentStep: 'A posé une option' })
  }
  Object.assign(data_to_update, { paiementLink: `${origin}/checkout?type=balance&booked_id=${bookedDate.id}` })
  await activecampaign.updateDeal(dealId, data_to_update)

  await logDateActivity(dateId, bookingUser, 'deal_assigned', { deal_id: dealId, booked_places: bookedPlaceCount })

  console.log(`[assign-deal] DONE dealId=${dealId} bookedId=${bookedDate.id} totalTime=${Date.now() - startTime}ms`)
  return bookedDate
})
