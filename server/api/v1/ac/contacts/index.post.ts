import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event): Promise<TypeClientData> => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  const parsedBody = await readValidatedBody(event, body => clientSchema.safeParse(body))
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }

  try {
    const response = await activecampaign.upsertContact(parsedBody.data)
    return response
  }
  catch (err) {
    console.error('Contact upsert error:', err)
    throw createError({
      statusCode: 500,
      message: err instanceof Error ? err.message : 'Failed to upsert contact',
    })
  }
})
