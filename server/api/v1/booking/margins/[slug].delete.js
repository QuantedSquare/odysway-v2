import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const { pax, year, season_id: seasonId, scope } = getQuery(event)
  if (!pax) {
    throw createError({ statusCode: 400, statusMessage: 'pax requis (query param)' })
  }
  if (!year) {
    throw createError({ statusCode: 400, statusMessage: 'year requis (query param)' })
  }

  // scope=cell removes a single cell — the given season, or the season-less
  // default row when season_id is omitted. The default scope removes the whole
  // pax tier for the year (every season + the default), which is what the
  // editor's row trash icon means by "supprimer le palier".
  // Soft delete : la ligne reste, mais margins.upsertMarginForVoyage lève la
  // pierre tombale (...softDelete.clear()) dès qu'une valeur est ressaisie, donc
  // retaper une marge « remarche » sans étape de restauration explicite.
  const removed = await softDelete.remove('voyage_margins', (query) => {
    let q = query
      .eq('voyage_slug', slug)
      .eq('pax', Number(pax))
      .eq('year', Number(year))
    if (scope === 'cell') {
      q = seasonId ? q.eq('season_id', seasonId) : q.is('season_id', null)
    }
    return q
  }, { user: bookingUser, reason: softDelete.REASONS.MANUAL })

  if (removed.error) {
    throw createError({ statusCode: 500, statusMessage: removed.error })
  }

  return { success: true, softDeleted: removed.count }
})
