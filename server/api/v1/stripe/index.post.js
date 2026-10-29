export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { bookedId } = getQuery(event)
  console.log('bookedId:', bookedId)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .eq('deleted', false)
    .single()

  if (error) {
    // On refuse d'ouvrir une NOUVELLE session de paiement sur une réservation
    // supprimée. À ne pas confondre avec le webhook entrant (server/utils/stripe.js),
    // qui lui ressuscite la ligne : un paiement déjà encaissé fait foi.
    const deleted = await booking.isBookedDateDeleted(bookedId)
    throw funnelReporter.funnelCreateError({
      statusCode: deleted ? 410 : 400,
      code: deleted ? 'STRIPE_BOOKED_DATE_DELETED' : 'STRIPE_BOOKED_DATE_NOT_FOUND',
      step: 'payment',
      origin: { field: 'bookedId', received: bookedId, endpoint: 'booked_dates' },
      message: deleted
        ? 'Cette réservation a été supprimée, le lien de paiement n\'est plus valide'
        : 'Impossible de récupérer le deal depuis booked_dates',
    })
  }
  const deal_id = data.deal_id
  console.log('stripe checkout body:', body)
  console.log('dealId:', deal_id)
  Object.assign(body, { dealId: deal_id })
  // « +1 qui fait baisser la marge » : refus (409, affiché par le tunnel) ou
  // supplément ajouté au deal AVANT que la session ne lise ses montants.
  if (body.paymentType === 'deposit' || body.paymentType === 'full') {
    await plusUn.appliquerAuPaiement({ bookedId, dealId: deal_id })
  }
  try {
    console.log('updateDeal', deal_id)
    const obj = { currentStep: 'CB - Sur Stripe Checkout' }
    if (body.paymentType === 'deposit' || body.paymentType === 'full') {
      // « Paiement CB non achevé » de la pipeline du deal (prospect ou portage).
      // L'étape 17 des Prospects posée sur un voyageur le renvoyait en pipeline 1
      // (CYC-01 du Docteur d'Ulysse) : rien pour un voyageur.
      const { deal } = await activecampaign.getDealById(deal_id).catch(() => ({ deal: null }))
      const stage = pipelines.etapePaiementNonAcheve(deal?.group)
      if (stage) Object.assign(obj, { stage })
    }
    activecampaign.updateDeal(deal_id, obj)

    const redirectLink = await stripe.createCheckoutSession(body)
    return redirectLink
  }
  catch (err) {
    console.error('create checkout session error:', err)
    throw funnelReporter.funnelCreateError({
      statusCode: 500,
      code: 'STRIPE_SESSION_CREATE_FAILED',
      step: 'payment',
      origin: { endpoint: 'stripe.createCheckoutSession', statusCode: 500 },
      message: `Échec de création de la session Stripe (dealId=${deal_id}, type=${body?.paymentType})`,
    })
  }
})
