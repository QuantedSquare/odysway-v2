export default defineEventHandler(async (event) => {
  const { bookedId } = getQuery(event)
  console.log('bookedId:', bookedId)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .single()

  if (error) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'ALMA_BOOKED_DATE_NOT_FOUND',
      step: 'payment',
      origin: { field: 'bookedId', received: bookedId, endpoint: 'booked_dates' },
      message: 'Impossible de récupérer le deal depuis booked_dates',
    })
  }
  const deal_id = data.deal_id
  const body = await readBody(event)
  Object.assign(body, { dealId: deal_id, booked_id: bookedId })
  console.log('========ALMA REQUEST BODY=======', body)

  if (!body.dealId) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'ALMA_NO_DEALID',
      step: 'payment',
      origin: { field: 'dealId', received: null },
      message: 'dealId is required',
    })
  }

  try {
    const almaSession = await alma.createAlmaSession(body)
    console.log('========ALMA SESSION=======', almaSession)
    console.log('========UPDATE THE DEAL=======')
    await activecampaign.updateDeal(body.dealId, { currentStep: 'Passage sur la page de paiement Alma' }) // no need waiting for AC update
    setResponseStatus(event, 200)
    return almaSession
  }
  catch (err) {
    console.log('Error creating alma session', err)
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'ALMA_SESSION_CREATE_FAILED',
      step: 'payment',
      origin: { endpoint: 'alma.createAlmaSession' },
      message: `Échec de création de la session Alma (dealId=${body.dealId}): ${err.message}`,
    })
  }
})
