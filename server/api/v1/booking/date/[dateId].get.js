import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'

// Deux réponses selon l'appelant (readsFullTravelDates) :
//  - back-office : toutes les colonnes, la date supprimée sur ?includeDeleted ;
//  - public en production (tunnel de commande) : PUBLIC_CHECKOUT_DATE_COLUMNS
//    (server/utils/travelDateVisibility.js), dates de test exclues. Les dates
//    non publiées restent lisibles : les départs privés et sur-mesure se
//    réservent par /checkout?date_id=.
export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  // ?includeDeleted=true : l'écran de restauration du BMS doit pouvoir charger
  // une date supprimée. Le funnel public, lui, ne doit jamais la voir.
  const { includeDeleted } = getQuery(event)
  const fullAccess = readsFullTravelDates(event)
  const withDeleted = (includeDeleted === 'true' || includeDeleted === '1') && fullAccess
  if (!dateId) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'DATE_NO_ID',
      step: 'init',
      origin: { field: 'dateId', received: null },
      message: 'dateId requis',
    })
  }
  // La réponse dépend de l'appelant : la version complète ne doit jamais être
  // retenue par un cache partagé puis resservie à un anonyme.
  if (fullAccess) setResponseHeaders(event, { 'cache-control': 'private, no-store' })

  let query = supabase
    .from('travel_dates')
    .select(fullAccess ? '*' : PUBLIC_CHECKOUT_DATE_COLUMNS.join(','))
    .eq('id', dateId)
  if (!withDeleted) query = query.eq('deleted', false)
  if (!fullAccess) query = query.eq('is_test', false)

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
