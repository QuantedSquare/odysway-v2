import { defineEventHandler, readBody } from 'h3'
import supabase from '~/server/utils/supabase'
import activecampaign from '~/server/utils/activecampaign'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const { dealId, booked_places, is_option, expiracy_date } = await readBody(event)
  if (!dealId) return { error: 'dealId requis' }

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
  const { data, error } = await supabase
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
  if (error) return { error: error.message }

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

  return data
})
