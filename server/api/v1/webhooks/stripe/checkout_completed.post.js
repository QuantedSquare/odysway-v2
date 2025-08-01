import { stripeCLI } from '@/server/utils/stripeCLI'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, 'utf8')
  console.log('Body from webhook in checkout_completed.post.js', body)

  const stripeSignature = getHeader(event, 'stripe-signature')
  console.log('stripeSignature in checkout_completed.post.js', stripeSignature)

  if (!stripeSignature) {
    throw createError({
      statusCode: 400,
      message: 'Unauthorized',
    })
  }

  let stripeEvent
  try {
    stripeEvent = stripeCLI.webhooks.constructEvent(
      body,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SIGNATURE,
    )
    console.log('=======stripeEvent=========', stripeEvent)
  }
  catch (err) {
    console.log('Error stripeEvent', err)
    throw createError({
      statusCode: 400,
      message: 'Error verifying webhook signature',
    })
  }

  // If payment_status not equal to paid, it means that the customer choose to pay by bank transfer or do nothing
  if (stripeEvent.type === 'checkout.session.completed' && stripeEvent.data.object.payment_status === 'paid') {
    // Récupéré le dealId dans les metadata (On passe l'order dedans)
    try {
      console.log('--------------GOING INTO HANDLE PAYMENT SESSION--------------')
      setResponseStatus(event, 200)
      await stripe.handlePaymentSession(stripeEvent.data.object, 'CB')
      // sendinBlue.updateContactListId(body.data.object.customer_details.email, 14) // Payé
    }
    catch (err) {
      console.log('Error payment', err)
      throw createError({
        statusCode: 400,
        message: 'Error payment',
      })
    }
  }
})
