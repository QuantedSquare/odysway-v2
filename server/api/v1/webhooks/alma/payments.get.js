export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isDev = config.public.environment !== 'production'

  try {
    const query = getQuery(event)
    const pid = query.pid

    if (!pid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment ID (pid) is required',
      })
    }

    // Retrieve and process payment
    const payment = await alma.retrievePayment(pid)

    if (!payment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Payment not found',
      })
    }

    const almaIdSupabase = await alma.retrieveAlmaId(pid)

    if (almaIdSupabase) {
      console.log('Payment already handled in supabase:', pid)
    }
    else {
      // Insert payment ID to prevent duplicate processing
      const { data, error } = await supabase
        .from('alma_ids')
        .insert([{ id: pid }])
        .select()
      if (error) {
        console.error('Error inserting alma ID:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Database error',
        })
      }
      console.log('Alma Paiement, inserted id in supabase:', data)
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
