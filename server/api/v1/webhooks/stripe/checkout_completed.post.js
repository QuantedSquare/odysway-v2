
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
    // Bank transfer (customer_balance) payments emit BOTH checkout.session.completed
    // AND payment_intent.succeeded. transfer_completed.js owns those — skip here to
    // avoid booking the same payment twice (once as CB, once as Virement).
    const paymentIntentId = stripeEvent.data.object.payment_intent
    if (paymentIntentId) {
      const paymentIntent = await stripeCLI.paymentIntents.retrieve(paymentIntentId)
      const latestCharge = paymentIntent.latest_charge
        ? await stripeCLI.charges.retrieve(paymentIntent.latest_charge)
        : null
      const paymentMethodType = latestCharge?.payment_method_details?.type
      if (paymentMethodType === 'customer_balance') {
        console.log('Bank transfer session — handled by transfer_completed.js, skipping')
        setResponseStatus(event, 200)
        return
      }
    }

    // Idempotency: ensure we never process the same Stripe event twice
    const { error: insertError } = await supabase
      .from('stripe_processed_events')
      .insert({ id: stripeEvent.id })
    if (insertError) {
      console.log('Duplicate webhook event, skipping:', stripeEvent.id)
      return
    }

    // Récupéré le dealId dans les metadata (On passe l'order dedans)
    try {
      console.log('--------------GOING INTO HANDLE PAYMENT SESSION--------------')
      await stripe.handlePaymentSession(stripeEvent.data.object, 'CB')
      // sendinBlue.updateContactListId(body.data.object.customer_details.email, 14) // Payé
    }
    catch (err) {
      console.error('Error processing payment for event', stripeEvent.id, err)
      await $fetch(process.env.SLACK_URL_PAIEMENTS, {
        method: 'post',
        body: {
          blocks: [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:fire: *Webhook CB payment processing failed* — event \`${stripeEvent.id}\`\n${err?.message || err}`,
            },
          }],
        },
      }).catch(() => {})
    }
  }
  setResponseStatus(event, 200)
})
