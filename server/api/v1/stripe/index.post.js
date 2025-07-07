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
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting deal from booked_dates',
    })
  }
  const deal_id = data.deal_id
  console.log('stripe checkout body:', body)
  console.log('dealId:', deal_id)
  Object.assign(body, { dealId: deal_id })
  try {
    activecampaign.updateDeal(deal_id, { currentStep: 'Passage sur la page de paiement Stripe' })

    const redirectLink = await stripe.createCheckoutSession(body)
    return redirectLink
  }
  catch (err) {
    console.error('create checkout session error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to create checkout session',
    })
  }
})
