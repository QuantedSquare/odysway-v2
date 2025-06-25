export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('========alma request body=======', body)

  if (!body.dealId || !body.paymentType || body.paymentType !== 'full') {
    throw createError({
      statusCode: 400,
      statusMessage: 'dealId is missing or paymentType is not full',
    })
  }

  try {
    const almaSession = await alma.createAlmaSession(body)
    console.log('========alma Session response=======', almaSession)
    console.log('========UPDATE THE DEAL=======')
    await activecampaign.updateDeal(body.dealId, { currentStep: 'Passage sur la page de paiement Alma' })
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
