export default defineEventHandler(async (event) => {
  const data = await readBody(event)
  console.log('========data=======', data)
  const newsletterData = {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    listName: data.listName,
    state: data.state,
    listIds: data.listIds,
  }
  try {
    brevo.updateContact(data.email, newsletterData)
  }
  catch (err) {
    console.log('Error brevo update', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error sending brevo update', err,
    })
  }
})
