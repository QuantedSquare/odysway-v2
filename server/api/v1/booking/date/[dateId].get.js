import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  // ?includeDeleted=true : l'écran de restauration du BMS doit pouvoir charger
  // une date supprimée. Le funnel public, lui, ne doit jamais la voir.
  const { includeDeleted } = getQuery(event)
  const withDeleted = includeDeleted === 'true' || includeDeleted === '1'
  if (!dateId) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'DATE_NO_ID',
      step: 'init',
      origin: { field: 'dateId', received: null },
      message: 'dateId requis',
    })
  }
  let query = supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
  if (!withDeleted) query = query.eq('deleted', false)

  const { data, error } = await query.single()

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
