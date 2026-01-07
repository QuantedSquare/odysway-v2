import { defineEventHandler, readBody, createError } from 'h3'

// When Assigning an activecampaign deal to a booked_date, we need to update the deal with the paiementLink, slug and redirection to date in the bms.
// Also update the booked_dates table with the booked_places, is_option and expiracy_date. depending if it's an option or not.

export default defineEventHandler(async (event) => {
  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  const { dealId, booked_places, is_option, expiracy_date } = await readBody(event)
  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'dealId requis' })
  }
  const config = useRuntimeConfig()
  const origin = config.public.siteURL

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

  // Fetch deal from ActiveCampaign
  let deal
  try {
    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(dealId),
      activecampaign.getDealCustomFields(dealId),
    ])
    deal = { ...fetchedDeal.deal, ...customFields }
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Erreur lors de la récupération du deal AC' })
  }
  if (!deal) throw createError({ statusCode: 404, statusMessage: 'Deal introuvable' })

  // Extract nbTravelers from deal
  const nbTravelers = +deal.nbTravelers
  const alreadyPaid = +deal.alreadyPaid
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
  const alreadyAssigned = error && error.message.includes('duplicate key value violates unique constraint')
  if (alreadyAssigned) {
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
  else if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Update travel_dates.booked_seat
  const { data: allBooked, error: sumError } = await supabase
    .from('booked_dates')
    .select('booked_places')
    .eq('travel_date_id', dateId)
  if (sumError) throw createError({ statusCode: 500, statusMessage: sumError.message })
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  const recomputeRes = await booking.updateTravelDate(dateId, totalBooked)
  if (recomputeRes?.error) throw createError({ statusCode: 500, statusMessage: recomputeRes.error })

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
  if (deal.group === '2') {
    Object.assign(data_to_update, { paiementLink: `${origin}/checkout?type=balance&booked_id=${bookedDate.id}` })
  }
  else {
    Object.assign(data_to_update, { paiementLink: `${origin}/checkout?type=balance&booked_id=${bookedDate.id}` })
  }
  await activecampaign.updateDeal(dealId, data_to_update)
  return bookedDate
})
