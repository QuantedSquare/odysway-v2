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
    if (!reponse.deal) {
      throw createError({
        statusCode: 404,
        message: 'Deal not found',
      })
    }
    console.log('deal', reponse.deal)
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
