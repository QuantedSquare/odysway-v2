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

  try {
    // Fetch invitee details from Calendly API
    const inviteeData = await $fetch(invitee_uri, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    console.log('inviteeData', inviteeData)
    if (!inviteeData?.resource) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invitee not found',
      })
    }

    const invitee = inviteeData.resource

    // Extract email and phone from questions_and_answers
    let phone = null
    if (invitee.questions_and_answers) {
      const phoneQuestion = invitee.questions_and_answers.find(
        qa => qa.question.toLowerCase().includes('phone') || qa.question.toLowerCase().includes('téléphone'),
      )
      if (phoneQuestion) {
        phone = phoneQuestion.answer
      }
    }

    // Return invitee information
    return {
      email: invitee.email,
      phone: phone || invitee.phone_number || null,
      name: invitee.name,
      timezone: invitee.timezone,
      created_at: invitee.created_at,
    }
  }
  catch (err) {
    console.error('Error fetching Calendly invitee:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Error fetching invitee data',
    })
  }
})
