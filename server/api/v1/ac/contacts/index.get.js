export default defineEventHandler(async (event) => {
  // Only handle GET requests
  if (event.method !== 'GET') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  // Validate email query parameter
  const { email } = getQuery(event)
  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'Email is required',
    })
  }

  try {
    // Fetch client by email
    const client = await activecampaign.getClientByEmail(email)
    // Validate client exists
    if (!client.contacts || client.contacts.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No client found',
      })
    }

    return client.contacts[0]
  }
  catch (err) {
    console.error('Error getting client:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to retrieve client',
    })
  }
})
