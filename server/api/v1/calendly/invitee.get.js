/**
 * API Endpoint: Fetch Calendly Invitee Details
 *
 * Fetches invitee information from Calendly API using the invitee URI
 * Used to get user email and phone after they schedule an event
 *
 * Query params:
 * - invitee_uri: The Calendly invitee URI from the event payload
 *
 * Returns:
 * - email: Invitee email
 * - phone: Invitee phone (if provided)
 * - name: Invitee name
 */

export default defineEventHandler(async (event) => {
  const { invitee_uri } = getQuery(event)

  if (!invitee_uri) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invitee_uri is required',
    })
  }

  // Validate that the invitee_uri is a Calendly API URL
  if (!invitee_uri.startsWith('https://api.calendly.com/')) {
    console.error('Invalid invitee URI format:', invitee_uri)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid invitee_uri format. Expected Calendly API URL.',
    })
  }

  try {
    // Log the invitee URI for debugging
    console.log('Fetching Calendly invitee from URI:', invitee_uri)

    // Fetch invitee details from Calendly API
    // The invitee_uri is the full API URL (e.g., https://api.calendly.com/scheduled_events/{uuid}/invitees/{uuid})
    const inviteeData = await $fetch(invitee_uri, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Calendly API response:', JSON.stringify(inviteeData, null, 2))

    if (!inviteeData?.resource) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invitee not found',
      })
    }

    const invitee = inviteeData.resource

    // Return invitee information
    return {
      email: invitee.email || null,
      phone: invitee.text_reminder_number || null,
      name: invitee.name || null,
      timezone: invitee.timezone || null,
      created_at: invitee.created_at || null,
      uri: invitee.uri || null,
    }
  }
  catch (err) {
    console.error('Error fetching Calendly invitee:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Error fetching invitee data from Calendly',
    })
  }
})
