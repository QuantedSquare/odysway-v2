export default defineEventHandler(async (event) => {
  const session = await readBody(event)
  try {
    activecampaign.optionNotification(session)
  }
  catch (err) {
    console.log('Error slack notification', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error sending slack notification', err,
    })
  }
})
