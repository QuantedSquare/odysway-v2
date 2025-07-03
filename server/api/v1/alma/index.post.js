export default defineEventHandler(async (event) => {
  const { bookedId } = getQuery(event)
  console.log('bookedId:', bookedId)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting deal from booked_dates',
    })
  }
  const deal_id = data.deal_id
  const body = await readBody(event)
  Object.assign(body, { dealId: deal_id })
  console.log('========ALMA REQUEST BODY=======', body)

  if (!body.dealId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dealId is required',
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
    throw createError({
      statusCode: 400,
      statusMessage: 'Error creating alma session',
      data: { details: err.message },
    })
  }
})
