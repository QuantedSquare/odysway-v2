import { stripeCLI } from '@/server/utils/stripeCLI'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, false)
  console.log('Body from webhook', body)

  const stripeSignature = getHeader(event, 'stripe-signature')
  console.log('stripeSignature', stripeSignature)

  if (!stripeSignature) {
    return
  }

  let stripeEvent
  try {
    stripeEvent = stripeCLI.webhooks.constructEvent(
      body, stripeSignature, process.env.STRIPE_WEBHOOK_SIGNATURE,
    )
    console.log('=======stripeEvent=========', stripeEvent)
  }
  catch (err) {
    console.log('Error stripeEvent', err)
    throw createError({
      statusCode: 400,
      message: 'Error stripeEvent',
    })
  }

  // If payment_status not equal to paid, it means that the customer choose to pay by bank transfer or do nothing
  if (stripeEvent.type === 'checkout.session.completed' && stripeEvent.data.object.payment_status === 'paid') {
    // Récupéré le dealId dans les metadata (On passe l'order dedans)
    try {
      console.log('--------------GOING INTO HANDLE PAYMENT SESSION--------------')
      await stripe.handlePaymentSession(stripeEvent.data.object, 'CB')
      // sendinBlue.updateContactListId(body.data.object.customer_details.email, 14) // Payé
      setResponseStatus(event, 200)
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
