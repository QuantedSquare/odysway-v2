export default defineEventHandler(async (event) => {
  console.log('========event=======', event)
  const data = await readBody(event)
  const newsletterData = {
    email: data.contactEmail,
    firstName: data.firstName,
    listName: data.listName,
    state: data.listName
  }
  try {
    sendinBlue.updateContact(newsletterData)

  } catch (err) {
    console.log('Error sendinblue update', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error sending slack notification', err,
    })
  }
})  