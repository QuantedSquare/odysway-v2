export default defineEventHandler(async (event) => {
  // Only handle GET requests
  if (event.method !== 'GET') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  // Validate email query parameter
  const { slug } = getQuery(event)
  console.log('slug', slug)
  if (!slug) {
    try {
      // Fetch client by email
      const dates = await booking.retrieveBooking()
      // Validate client exists
      console.log('dates', dates)
      // if (!client.contacts || client.contacts.length === 0) {
      //   throw createError({
      //     statusCode: 404,
      //     message: 'No client found',
      //   })
      // }

      return dates
    }
    catch (err) {
      console.error('Error getting client:', err)
      throw createError({
        statusCode: 500,
        message: 'Failed to retrieve client',
      })
    }
  }
  else {
    try {
      const date = await booking.retrieveBooking(slug)

      console.log('date with query', slug, date)
      return date
    }
    catch (err) {
      console.error('Error getting client:', err)
      throw createError({
        statusCode: 500,
        message: 'Failed to retrieve client',
      })
    }
  }
})
