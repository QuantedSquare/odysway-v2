import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event): Promise<TypeDeal> => {
  const { bookedId } = getQuery(event)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .single()

  if (error) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'UPDATE_BMS_BOOKED_DATE_NOT_FOUND',
      step: 'unknown',
      origin: { field: 'bookedId', received: bookedId, endpoint: 'booked_dates' },
      message: 'Impossible de récupérer le deal depuis booked_dates',
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
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'UPDATE_BMS_NO_DEALID',
      step: 'unknown',
      origin: { field: 'dealId', received: null },
      message: 'Deal ID is required',
    })
  }
  if (!Number.isInteger(+dealId)) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'UPDATE_BMS_DEALID_NOT_INT',
      step: 'unknown',
      origin: { field: 'dealId', received: dealId, expected: 'entier' },
      message: 'Deal ID should be an integer',
    })
  }
  const parsedBody = await readValidatedBody(event, body => UpdateDealSchema.safeParse(body))
  if (!parsedBody.success) {
    console.error('Validation failed:', parsedBody.error)
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'UPDATE_BMS_ZOD_VALIDATION',
      step: 'unknown',
      origin: funnelReporter.zodToOrigin(parsedBody.error),
      message: `Validation de mise à jour échouée — ${funnelReporter.zodIssuesSummary(parsedBody.error)}`,
    })
  }
  try {
    const response = await activecampaign.updateDeal(dealId, parsedBody.data)
    activecampaign.recalculatTotalValues(dealId)
    return response
  }
  catch (err) {
    console.error('Deal updating error:', err)
    throw funnelReporter.funnelCreateError({
      statusCode: 500,
      code: 'UPDATE_BMS_FAILED',
      step: 'unknown',
      origin: { endpoint: 'activecampaign.updateDeal' },
      message: 'Échec de mise à jour du deal',
    })
  }
})
