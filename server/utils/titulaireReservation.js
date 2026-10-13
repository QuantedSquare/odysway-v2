// Titulaire d'une réservation : la ligne booked_dates, son deal AC et le contact
// principal de ce deal. Sert aux contrôles de reprise (repriseReservation.js) du
// tunnel : reprise d'une réservation, mise à jour du deal, pose d'une option.
//
// LECTURE SEULE.

/** Le deal d'une réservation est-il déjà réglé ? `deal` évite de relire un deal tout juste lu. */
const reglee = async ({ dealId, transactionId, deal = null }) => {
  if (transactionId) return true
  const [lu, champs] = await Promise.all([
    deal ? Promise.resolve({ deal }) : activecampaign.getDealById(dealId),
    activecampaign.getDealCustomFields(dealId),
  ])
  return repriseReservation.estReglee({ alreadyPaid: champs?.alreadyPaid, group: lu?.deal?.group })
}

/** `null` : réservation supprimée, introuvable ou sans deal. */
const lire = async (bookedId) => {
  const { data: ligne, error } = await supabase
    .from('booked_dates')
    .select('id, deal_id, travel_date_id, transaction_id')
    .eq('id', bookedId)
    .eq('deleted', false)
    .maybeSingle()
  if (error) throw new Error(`booked_dates illisible : ${error.message}`)
  if (!ligne?.deal_id) return null

  const [{ deal }, champs] = await Promise.all([
    activecampaign.getDealById(ligne.deal_id),
    activecampaign.getDealCustomFields(ligne.deal_id),
  ])
  const contact = deal?.contact ? (await activecampaign.getClientById(deal.contact))?.contact : null
  return {
    bookedId: ligne.id,
    dealId: ligne.deal_id,
    travelDateId: ligne.travel_date_id,
    titulaire: {
      email: contact?.email || '',
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
    },
    reglee: repriseReservation.estReglee({
      alreadyPaid: champs?.alreadyPaid,
      transactionId: ligne.transaction_id,
      group: deal?.group,
    }),
  }
}

/** Verdict de reprise de `bookedId` par la personne saisie. `null` : réservation introuvable. */
const verifier = async (bookedId, saisie) => {
  const lu = await lire(bookedId)
  if (!lu) return null
  return {
    ...repriseReservation.analyser({ titulaire: lu.titulaire, saisie, reglee: lu.reglee }),
    dealId: lu.dealId,
    travelDateId: lu.travelDateId,
    reglee: lu.reglee,
  }
}

export default { reglee, lire, verifier }
