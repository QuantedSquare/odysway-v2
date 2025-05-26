export default defineEventHandler(async (event) => {
  // Validate contact ID
  const id = parseInt(event.context.params.contactId)
  console.log('id:', id)
  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      message: 'Contact ID must be an integer',
    })
  }
  try {
    // Fetch all deals for the contact
    const response = await activecampaign.getAllDeal(id)
    console.log('Deals:', response)
    // Validate deals exist
    if (!response || response.deals.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No deals found for this contact',
      })
    }

    return response.deals
  }
  catch (err) {
    console.error(`Error fetching deals for contact ${id}:`, err)
    throw createError({
      statusCode: 500,
      message: 'Failed to retrieve deals',
    })
  }
})
