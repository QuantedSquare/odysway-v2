const config = useRuntimeConfig()
const isDev = config.public.environment !== 'production'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const pid = query.pid

    if (!pid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment ID (pid) is required',
      })
    }

    // On pourrait gérér cette vérification dans retrieveAlmaIds
    const ids = await alma.retrieveAlmaIds()

    if (ids && ids.includes(pid)) {
      console.log('Payment already handled in supabase:', pid)
      setResponseStatus(event, 200)
    }

    // Insert payment ID to prevent duplicate processing
    const { data, error } = await supabase
      .from('alma_ids')
      .insert([{ id: pid }])
      .select()

    console.log('insertion alma id in alma_ids', data)

    if (error) {
      console.error('Error inserting alma ID:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Database error',
      })
    }

    console.log('Alma Payment, inserted id in supabase:', data)

    // Retrieve and process payment
    const payment = await alma.retrievePayment(pid)
    console.log('retrieved payment', payment)

    if (!payment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Payment not found',
      })
    }

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
    return {
      message: 'Payment processed successfully',
      paymentId: pid,
      status: payment.state,
    }
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
