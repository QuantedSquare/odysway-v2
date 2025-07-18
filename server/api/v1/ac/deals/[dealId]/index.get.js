export default defineEventHandler(async (event) => {
  const dealId = parseInt(event.context.params.dealId)
  if (!Number.isInteger(dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deal ID should be an integer',
    })
  }
  try {
    // Recalculate total values before sending datas
    await activecampaign.recalculatTotalValues(dealId)

    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(dealId),
      activecampaign.getDealCustomFields(dealId),
    ])
    // const reponse = await activecampaign.getDealById(dealId)
    // const customFields = await activecampaign.getDealCustomFields(dealId)
    const { contact } = await activecampaign.getClientById(fetchedDeal.deal.contact)
    if (!fetchedDeal.deal || !customFields) {
      throw createError({
        statusCode: 404,
        message: 'Deal not found',
      })
    }
    return {
      ...fetchedDeal.deal,
      ...customFields,
      contact: {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
      },
    }
  }
  catch (err) {
    console.log('Error getting one deal', err, dealId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting one deal', err,
    })
  }
})
