export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isDev = config.public.environment !== 'production'

  try {
    const query = getQuery(event)
    const pid = query.pid

    // Retrieve and process payment
    const payment = await alma.retrievePayment(pid)

    await alma.insertAlmaId(pid)

    // Process payment session
    await alma.handlePaymentSession(payment)
    console.log('Payment session handled successfully')

    // Update contact in Brevo
    if (!isDev && payment.customer?.email) {
      try {
        await brevo.updateContactListId(payment.customer.email, 14) // Payé
        console.log('Brevo contact updated successfully')
      }
      catch (brevoErr) {
        console.error('Failed to update Brevo contact:', brevoErr.message)
      }
    }

    setResponseStatus(event, 200)
  }
  catch (err) {
    console.error('Alma webhook error:', err)

    setResponseStatus(event, err.statusCode || 500)
    return {
      error: err.statusMessage || 'Internal server error',
      paymentId: getQuery(event).pid,
    }
  }
})
