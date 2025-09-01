import { defineEventHandler, readBody } from 'h3'
import supabase from '~/server/utils/supabase'
import activecampaign from '~/server/utils/activecampaign'

// When Assigning an activecampaign deal to a booked_date, we need to update the deal with the paiementLink, slug and redirection to date in the bms.
// Also update the booked_dates table with the booked_places, is_option and expiracy_date. depending if it's an option or not.

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const { dealId, booked_places, is_option, expiracy_date } = await readBody(event)
  if (!dealId) return { error: 'dealId requis' }
  const config = useRuntimeConfig()
  const origin = config.public.siteURL
  // Fetch deal from ActiveCampaign
  let deal
  try {
    deal = await activecampaign.getDealCustomFields(dealId)
    console.log('=======deal RETRIEVED=======', deal)
  }
  catch {
    return { error: 'Erreur lors de la récupération du deal AC' }
  }
  if (!deal) return { error: 'Deal introuvable' }

  // Extract nbTravelers from deal
  const nbTravelers = +deal.nbTravelers
  const alreadyPaid = +deal.alreadyPaid
  if (!nbTravelers) return { error: 'Le deal ne contient pas le nombre de voyageurs (nbTravelers)' }

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
  console.log('=======data inserted=======', bookedDate)
  console.log('=======error=======', error)
  const alreadyAssigned = error && error.message.includes('duplicate key value violates unique constraint')
  if (alreadyAssigned) {
    const { data: existingBookedDate, error: existingError } = await supabase
      .from('booked_dates')
      .select('deal_id, travel_dates(id, travel_slug)')
      .eq('deal_id', dealId)
      .single()
    return { error: `/booking-management/${existingBookedDate.travel_dates.travel_slug}/${existingBookedDate.travel_dates.id}` }
  }
  else if (error) return { error: error.message }

  // Update travel_dates.booked_seat
  const { data: allBooked, error: sumError } = await supabase
    .from('booked_dates')
    .select('booked_places')
    .eq('travel_date_id', dateId)
  if (sumError) return { error: sumError.message }
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  await supabase
    .from('travel_dates')
    .update({ booked_seat: totalBooked })
    .eq('id', dateId)

  const { data: travel_date, error: slugError } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .single()
  console.log('=======travel_slug=======', travel_date)
  if (slugError) return { error: slugError.message }

  const data_to_update = {
    slug: travel_date.travel_slug,
    linkBms: `${origin}/booking-management/${travel_date.travel_slug}/${dateId}`,
  }
  if (deal.group === '2') {
    Object.assign(data_to_update, { paiementLink: `https://odysway.com/checkout?type=balance&booked_id=${bookedDate.id}` })
  }
  else {
    Object.assign(data_to_update, { paiementLink: `https://odysway.com/checkout?type=balance&booked_id=${bookedDate.id}` })
  }
  const travel_slug_updated = await activecampaign.updateDeal(dealId, data_to_update)
  console.log('=======travel_slug updated=======', travel_slug_updated)
  return bookedDate
})
