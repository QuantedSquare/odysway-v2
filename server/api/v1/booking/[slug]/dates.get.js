import { defineEventHandler, createError, getQuery, setResponseHeaders } from 'h3'

// Deux réponses selon l'appelant (readsFullTravelDates) :
//  - back-office : toutes les colonnes, toutes les dates du voyage (brouillons
//    et dates de test compris), la corbeille sur ?includeDeleted ;
//  - public en production (page voyage) : dates publiées et réelles, réduites à
//    PUBLIC_VOYAGE_DATES_COLUMNS (server/utils/travelDateVisibility.js).
export default defineEventHandler(async (event) => {
  const { slug } = event.context.params
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'slug requis',
    })
  }

  // ?includeDeleted=true alimente la Corbeille du BMS. Par défaut on ne renvoie
  // que les dates actives, et jamais les supprimées au public.
  const { includeDeleted } = getQuery(event)
  const fullAccess = readsFullTravelDates(event)
  const withDeleted = (includeDeleted === 'true' || includeDeleted === '1') && fullAccess

  // La réponse dépend de l'appelant : la version complète ne doit jamais être
  // retenue par un cache partagé puis resservie à un anonyme.
  if (fullAccess) setResponseHeaders(event, { 'cache-control': 'private, no-store' })

  let query = supabase
    .from('travel_dates')
    .select(fullAccess ? '*' : PUBLIC_VOYAGE_DATES_COLUMNS.join(','))
    .eq('travel_slug', slug)
    .order('departure_date', { ascending: true })
  if (!withDeleted) query = query.eq('deleted', false)
  if (!fullAccess) query = query.eq('published', true).eq('is_test', false)

  const { data, error } = await query

  // console.log('SUPABASE RETURN: ', data, ' -- error: ', error)
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
  return data
})
