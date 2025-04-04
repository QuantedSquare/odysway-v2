// UNUSED FOR NOW
export default defineEventHandler(async (event) => {
  console.log('========event=======', event)
  const data = await readBody(event)
  try {
    const res = await brevo.sendEmail(data.template, data.order, data.travel)
    return res.data
  }
  catch (err) {
    console.log('Error brevo update', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error sending slack notification', err,
    })
  }
})
