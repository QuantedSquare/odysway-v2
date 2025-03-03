import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event): Promise<TypeDeal> => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  const parsedBody = await readValidatedBody(event, body => DealSchema.safeParse(body))
  if (!parsedBody.success) {
    console.error('Deal creation validation error:', parsedBody.error)
    console.log('error on', parsedBody.data)
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }

  try {
    const response = await activecampaign.createDeal(parsedBody.data)
    return response
  }
  catch (err) {
    console.error('Deal creation error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to create deal',
    })
  }
})
