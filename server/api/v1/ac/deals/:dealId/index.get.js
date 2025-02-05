export default defineEventHandler(async (event) => {
  const dealId = parseInt(event.context.params.dealId)
  if (!Number.isInteger(dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deal ID should be an integer',
    })
  }
  try {
    const reponse = await activecampaign.getDealById(dealId)
    const customFields = await activecampaign.getDealCustomFields(dealId)
    if (!reponse.deal || !customFields) {
      throw createError({
        statusCode: 404,
        message: 'Deal not found',
      })
    }
    console.log('deal', reponse.deal)
    console.log('customFields', customFields)
    return reponse.deal
  }
  catch (err) {
    console.log('Error getting one deal', err, dealId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting one deal', err,
    })
  }
})
