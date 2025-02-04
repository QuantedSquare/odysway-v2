export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('========_requestBody=======', body)
  const activecampaignData = {
    deal: {
      fields: [
        { customFieldId: 20, fieldValue: 'Passage sur la page de paiement Alma' },
      ],
    },
  }

  alma.createAlmaSession(body).then((almaSession) => {
    console.log('========almaSession response =======', almaSession)
    activecampaign.updateDeal(body.dealId, activecampaignData)
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
