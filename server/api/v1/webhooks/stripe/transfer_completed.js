
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
      message: 'Unauthorized',
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

  if (stripeEvent.type === 'payment_intent.succeeded') {
    const paymentIntent = stripeEvent.data.object
    const latestCharge = paymentIntent.latest_charge
      ? await stripeCLI.charges.retrieve(paymentIntent.latest_charge)
      : null
    const paymentMethodType = latestCharge?.payment_method_details?.type

    if (paymentMethodType !== 'customer_balance') {
      console.log('Payment type is not a bank transfer, skipping')
    }
    else {
      // Idempotency: ensure we never process the same Stripe event twice
      const { error: insertError } = await supabase
        .from('stripe_processed_events')
        .insert({ id: stripeEvent.id })
      if (insertError) {
        console.log('Duplicate webhook event, skipping:', stripeEvent.id)
        setResponseStatus(event, 200)
        return
      }

      console.log('========== payment type is a bank transfer =========')
      try {
        await stripe.handlePaymentSession(paymentIntent, 'Virement')
      }
      catch (err) {
        console.error('Error processing bank transfer for event', stripeEvent.id, err)
        await $fetch(process.env.SLACK_URL_PAIEMENTS, {
          method: 'post',
          body: {
            blocks: [{
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `:fire: *Webhook Virement payment processing failed* — event \`${stripeEvent.id}\`\n${err?.message || err}`,
              },
            }],
          },
        }).catch(() => {})
      }
    }
  }
  setResponseStatus(event, 200)
})
