import { defineEventHandler, getQuery } from 'h3'

// Le navigateur garde, par date de départ, la dernière réservation commencée
// (localStorage) ; les boutons de date la reprennent si cette route répond vrai.
// Une réservation déjà réglée ne se reprend plus : le poste d'une commerciale
// qui inscrit plusieurs clientes sur le même départ rouvrait sinon le dossier
// réglé de la précédente (deal 16997, 12/10/2026). Le bouton ouvre alors une
// inscription neuve.
export default defineEventHandler(async (event) => {
  const { booked_id } = getQuery(event)

  // Check if booking exists in Supabase
  const { data: bookedDate, error: supabaseError } = await supabase
    .from('booked_dates')
    .select('deal_id, transaction_id')
    .eq('id', booked_id)
    .eq('deleted', false)
    .single()

  if (supabaseError || !bookedDate) {
    return false
  }

  // Check if deal exists in ActiveCampaign
  try {
    const { deal } = await activecampaign.getDealById(bookedDate.deal_id)
    if (!deal) return false
    const reglee = await titulaireReservation.reglee({ dealId: bookedDate.deal_id, transactionId: bookedDate.transaction_id, deal })
    return !reglee
  }
  catch {
    // If the deal doesn't exist in ActiveCampaign, return false
    return false
  }
})
