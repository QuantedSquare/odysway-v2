export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('========alma request body=======', body)

  alma.createAlmaSession(body).then((almaSession) => {
    console.log('========almaSession response =======', almaSession)
    activecampaign.updateDeal(body.dealId, { currentStep: 'Passage sur la page de paiement Alma' })
    setResponseStatus(event, 200)
    return almaSession
  }).catch((err) => {
    console.log('Error creating alma session', err)
    throw createError({
      statusCode: 400,
      message: 'Error creating alma session',
    })
  })
})
