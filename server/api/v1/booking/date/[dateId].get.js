import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  // ?includeDeleted=true : le back-office doit pouvoir charger une date
  // supprimée pour la restaurer. Le funnel public, lui, ne doit jamais la voir.
  const { includeDeleted } = getQuery(event)
  const withDeleted = (includeDeleted === 'true' || includeDeleted === '1') && !!getCrmAccessOrNull(event)
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

  const { data, error } = await query.maybeSingle()

  // Une vraie erreur (timeout, panne Supabase…) n'est pas une date inexistante :
  // la renvoyer en 404 « Date introuvable » masquait les pannes dans les rapports.
  if (error) {
    throw funnelReporter.funnelCreateError({
      statusCode: 503,
      code: 'DATE_FETCH_FAILED',
      step: 'init',
      origin: { field: 'dateId', received: dateId, endpoint: `/booking/date/${dateId}` },
      message: `Lecture de la date impossible : ${error.message}`,
    })
  }
  if (!data) {
    throw funnelReporter.funnelCreateError({
      statusCode: 404,
      code: 'DATE_NOT_FOUND',
      step: 'init',
      origin: { field: 'dateId', received: dateId, endpoint: `/booking/date/${dateId}` },
      message: 'Date introuvable',
    })
  }
  return data
})
