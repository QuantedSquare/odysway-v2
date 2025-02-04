import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Extract contact data from request body
    const { contact } = await readBody(event)

    // Validate input
    if (!contact || !contact.id) {
      throw createError({
        statusCode: 400,
        message: 'Invalid contact data',
      })
    }

    // Upsert contact into Supabase
    const result = await activecampaign.upsertContactIntoSupabase(contact.id)

    // Log successful upsert
    console.log('Contact upserted successfully:', result)

    return { success: true }
  }
  catch (err) {
    console.error('Contact update webhook error:', err)
    throw createError({
      statusCode: 500,
      message: 'Unexpected error in contact update process',
    })
  }
})
