export default defineEventHandler(async (event) => {
  const stripeSignature = getRequestHeader(event, 'stripe-signature')
  console.log('stripeSignature', stripeSignature)
  if (!stripeSignature || stripeSignature !== process.env.STRIPE_WEBHOOK_SIGNATURE) {
    return
  }
  const body = await readBody(event)
  console.log('body from strike webhook', body)
  // If payment_status not equal to paid, it means that the customer choose to pay by bank transfer or do nothing
  if (body.type === 'checkout.session.completed' && body.data.object.payment_status === 'paid') {
    // Récupéré le dealId dans les metadata (On passe l'order dedans)
    try {
      stripe.handlePaymentSession(body.data.object, 'CB')
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
