export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.contactId)
  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Contact ID should be an integer',
    })
  }
  try {
    const reponse = await activecampaign.getClientById(id)
    return reponse.contact
  }
  catch (err) {
    console.log('Error getting client', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting client', err,
    })
  }
})
