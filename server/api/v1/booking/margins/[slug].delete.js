import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

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
  let query = supabase
    .from('voyage_margins')
    .delete()
    .eq('voyage_slug', slug)
    .eq('pax', Number(pax))
    .eq('year', Number(year))

  if (scope === 'cell') {
    query = seasonId ? query.eq('season_id', seasonId) : query.is('season_id', null)
  }

  const { error } = await query

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
