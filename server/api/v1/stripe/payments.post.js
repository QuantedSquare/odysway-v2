export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body.type === 'checkout.session.completed') {
    // Récupéré le dealId dans les metadata (On passe l'order dedans)
    try {
      stripe.handlePaymentSession(body.data.object)
      brevo.updateContactListId(body.data.object.customer_details.email, 14) // Payé
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
