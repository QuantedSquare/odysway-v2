export default defineEventHandler(async (event) => {
  const parsed = await readValidatedBody(event, body => brevoEmailSchema.safeParse(body))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: `Validation failed: ${parsed.error.message}`,
    })
  }
  const data = parsed.data
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
