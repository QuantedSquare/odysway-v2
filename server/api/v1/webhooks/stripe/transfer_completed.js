import { stripeCLI } from '@/server/utils/stripeCLI'

// https://docs.stripe.com/payments/bank-transfers/accept-a-payment?payment-ui=direct-api&country=ue&lang=node&shell=true&api=true#test-your-integration
// Use this link if you want to emulate a bank transfer. Need to be connected to stripe, on the test environnement.
// Use the stripe cli at the bottom. Define the customer id of the transfer (need to initiate a transfer at the end of the funnel, then retrieve the id on stripe dashboard, payment will be on hold)

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, false)
  console.log('Body from webhook in transfer_completed.js', body)

  const stripeSignature = getHeader(event, 'stripe-signature')
  console.log('stripeSignature in transfer_completed.js', stripeSignature)

  if (!stripeSignature) {
    throw createError({
      statusCode: 400,
      message: 'No stripe signature found',
    })
  }

  let stripeEvent
  try {
    stripeEvent = stripeCLI.webhooks.constructEvent(
      body, stripeSignature, process.env.STRIPE_WEBHOOK_TRANSFER_SIGNATURE,
    )
    console.log('=======stripeEvent=========', stripeEvent)
  }
  catch (err) {
    console.log('Error stripeEvent', err)
    throw createError({
      statusCode: 400,
      message: 'Error stripeEvent in transfer_completed.js',
    })
  }

  // If payment_status not equal to paid, it means that the customer choose to pay by bank transfer or do nothing
  if (stripeEvent.type === 'payment_intent.succeeded') {
    console.log('!!!!! payment type !!!!!', stripeEvent.data.object.charges.data)
    console.log('???? CHECK type ????', stripeEvent.data.object.charges.data[0].payment_method_details.type)
    if (stripeEvent.data.object.charges.data[0].payment_method_details.type !== 'customer_balance') {
      console.log('!!!!!! payment type is not a bank transfer !!!!!')
      setResponseStatus(event, 200)
    }
    else {
      console.log('========== payment type is a bank transfer =========')
      try {
        console.log('========== handlePaymentSession with this session object =========', stripeEvent.data.object)
        await stripe.handlePaymentSession(stripeEvent.data.object, 'Virement')
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
