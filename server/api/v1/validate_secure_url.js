export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('Received request body:', body)

    if (!body.token) {
      throw createError({
        statusCode: 400,
        message: 'Token is required',
      })
    }

    const payload = verifyToken(body.token)

    if (!payload) {
      throw createError({
        statusCode: 401,
        message: 'Invalid token',
      })
    }

    return { payload }
  }
  catch (error) {
    console.error('Validate URL error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to validate token',
    })
  }
})
