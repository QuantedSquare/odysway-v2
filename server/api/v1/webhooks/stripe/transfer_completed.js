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
  if (stripeEvent.type === 'payment_intent.succeeded') {
    console.log('!!!!! payment type !!!!!', stripeEvent.data.object.charges.data)
    console.log('???? CHECK type ????', stripeEvent.data.object.charges.data[0].payment_method_details.type)
    if (stripeEvent.data.object.charges.data[0].payment_method_details.type !== 'customer_balance') {
      setResponseStatus(event, 200)
    }
    else {
      try {
        stripe.handlePaymentSession(stripeEvent.data.object, 'Virement')
        setResponseStatus(event, 200)
      }
      catch (err) {
        console.log('Error in payment succeeded webhook', err)
        throw createError({
          statusCode: 400,
          message: 'Error stripeEvent',
        })
      }
    }
  }
})
