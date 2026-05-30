import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { data, error } = await supabase
    .from('voyage_margins')
    .select('voyage_slug, pax')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // Group by slug → { voyage_slug, configured_pax_count, configured_pax: [int] }
  const bySlug = new Map()
  for (const row of data || []) {
    const entry = bySlug.get(row.voyage_slug) || { voyage_slug: row.voyage_slug, configured_pax: [] }
    entry.configured_pax.push(row.pax)
    bySlug.set(row.voyage_slug, entry)
  }

  return Array.from(bySlug.values()).map(e => ({
    voyage_slug: e.voyage_slug,
    configured_pax_count: e.configured_pax.length,
    configured_pax: e.configured_pax.sort((a, b) => a - b),
  }))
})
