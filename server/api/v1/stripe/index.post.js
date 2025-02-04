export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('========stripe post event=======', event)

  const activecampaignData = {
    deal: {
      fields: [
        { customFieldId: 20, fieldValue: 'Passage sur la page de paiement Stripe' },
      ],
    },
  }

  stripe.createStripeSession(body).then((stripeSession) => {
    console.log('========Stripe session response =======', stripeSession)
    ac.updateDeal(body.dealId, activecampaignData)
    setResponseStatus(event, 200)
    return stripeSession
  }).catch((err) => {
    console.log('Error creating stripe session', err)
    throw createError({
      statusCode: 400,
      message: 'Error creating stripe session',
    })
  })
})
