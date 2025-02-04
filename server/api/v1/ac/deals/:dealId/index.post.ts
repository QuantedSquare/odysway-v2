import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event): Promise<TypeDeal> => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  const parsedBody = await readValidatedBody(event, body => UpdateDealSchema.safeParse(body))
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }
  const dealId = event.context.params?.dealId
  if (!dealId) {
    throw createError({
      statusCode: 400,
      message: 'Deal ID is required',
    })
  }
  try {
    const response = await activecampaign.updateDeal(dealId, parsedBody.data)
    return response
  }
  catch (err) {
    console.error('Deal updating error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to update deal',
    })
  }
})
