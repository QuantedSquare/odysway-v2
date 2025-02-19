import { sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('========stripe post event=======', event)

  // const activecampaignData = {
  //   deal: {
  //     fields: [
  //       { customFieldId: 20, fieldValue: 'Passage sur la page de paiement Stripe' },
  //     ],
  //   },
  // }
  try {
    const redirectLink = await stripe.createCheckoutSession(body)
    console.log('redirectLink', redirectLink)
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
