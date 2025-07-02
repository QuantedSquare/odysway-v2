export default defineEventHandler(async (event) => {
  const body = await readBody(event)
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
