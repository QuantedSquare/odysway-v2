import { defineEventHandler, readBody } from 'h3'
import supabase from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const { dealId } = await readBody(event)
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
  if (!nbTravelers) return { error: 'Le deal ne contient pas le nombre de voyageurs (nbTravelers)' }

  // Insert into booked_dates
  const { data, error } = await supabase
    .from('booked_dates')
    .insert([{
      travel_date_id: dateId,
      deal_id: dealId,
      booked_places: Number(nbTravelers),
      is_option: null,
      expiracy_date: null,
    }])
    .select('*')
    .single()
  if (error) return { error: error.message }
  return data
})
