export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('stripe checkout body:', body)
  try {
    activecampaign.updateDeal(body.dealId, { currentStep: 'Passage sur la page de paiement Stripe' })

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
