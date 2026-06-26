import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  if (!dateId) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'DATE_NO_ID',
      step: 'init',
      origin: { field: 'dateId', received: null },
      message: 'dateId requis',
    })
  }
  const { data, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .single()

  if (error || !data) {
    throw funnelReporter.funnelCreateError({
      statusCode: 404,
      code: 'DATE_NOT_FOUND',
      step: 'init',
      origin: { field: 'dateId', received: dateId, endpoint: `/booking/date/${dateId}` },
      message: error?.message || 'Date introuvable',
    })
  }
  return data
})
