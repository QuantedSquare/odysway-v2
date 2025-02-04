export default defineEventHandler(async (event) => {
  const dealId = parseInt(event.context.params.dealId)
  if (!Number.isInteger(dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deal ID should be an integer',
    })
  }
  try {
    const customFields = await activecampaign.getDealCustomFields(dealId)
    return customFields
  }
  catch (err) {
    console.log('Error getting customFields', err, dealId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting customFields', err,
    })
  }
})
