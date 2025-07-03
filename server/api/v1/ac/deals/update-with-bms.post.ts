import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event): Promise<TypeDeal> => {
  const { bookedId } = getQuery(event)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting deal from booked_dates',
    })
  }
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  const dealId = data.deal_id
  if (!dealId) {
    throw createError({
      statusCode: 400,
      message: 'Deal ID is required',
    })
  }
  if (!Number.isInteger(+dealId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deal ID should be an integer',
    })
  }
  const parsedBody = await readValidatedBody(event, body => UpdateDealSchema.safeParse(body))
  console.log('===========Parsed body ============:', parsedBody)
  if (!parsedBody.success) {
    console.error('Validation failed:', parsedBody.error)
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${parsedBody.error.message}`,
    })
  }
  try {
    console.log('===========Updating deal after parsing ============:', dealId, parsedBody.data)
    const response = await activecampaign.updateDeal(dealId, parsedBody.data)
    activecampaign.recalculatTotalValues(dealId)
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
