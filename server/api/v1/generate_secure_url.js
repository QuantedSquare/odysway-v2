export default defineEventHandler(async (event) => {
  try {
    const { params } = await readBody(event)

    if (!params) {
      throw createError({
        statusCode: 400,
        message: 'Missing parameters',
      })
    }

    const token = generateSecureToken(params)

    if (!token) {
      throw createError({
        statusCode: 500,
        message: 'Failed to generate token',
      })
    }

    return { params: token }
  }
  catch (error) {
    console.error('Generate URL error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate secure URL',
    })
  }
})
