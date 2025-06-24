export default defineEventHandler((event) => {
  const query = getQuery(event)
  const pid = query.pid

  alma.retrieveAlmaIds().then(async (ids) => {
    if (ids.includes(pid)) {
      console.log('Payment already handled')
      setResponseStatus(event, 200, 'Payment already handled')
    }
    else {
      const { data } = await supabase
        .from('alma_ids')
        .insert([{ id: pid }])
        .select()
      console.log('Alma Paiement, inserted id in supabase:', data)

      alma.retrievePayment(pid).then((payment) => {
        alma.handlePaymentSession(payment)
        brevo.updateContactListId(payment.customer.email, 14) // Payé
      }).catch((err) => {
        throw createError({
          statusCode: 400,
          statusMessage: 'Error retrieving payment', err,
        })
      })
    }
  })
})
