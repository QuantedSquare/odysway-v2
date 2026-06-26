export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { bookedId } = getQuery(event)
  console.log('bookedId:', bookedId)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .single()

  if (error) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'STRIPE_BOOKED_DATE_NOT_FOUND',
      step: 'payment',
      origin: { field: 'bookedId', received: bookedId, endpoint: 'booked_dates' },
      message: 'Impossible de récupérer le deal depuis booked_dates',
    })
  }
  const deal_id = data.deal_id
  console.log('stripe checkout body:', body)
  console.log('dealId:', deal_id)
  Object.assign(body, { dealId: deal_id })
  try {
    console.log('updateDeal', deal_id)
    const obj = { currentStep: 'CB - Sur Stripe Checkout' }
    if (body.paymentType === 'deposit' || body.paymentType === 'full') {
      Object.assign(obj, { stage: '17' })
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
