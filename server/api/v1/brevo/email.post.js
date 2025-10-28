

export default defineEventHandler(async (event) => {
  const data = await readBody(event)
  try {
    // 1. Send the contact email to yourself
    await brevo.sendContactEmail(data)

    // 2. Send confirmation email to the user
    await brevo.sendConfirmationEmail(data)

    return { success: true }
  }
  catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error sending brevo email',
      err,
    })
  }
})
