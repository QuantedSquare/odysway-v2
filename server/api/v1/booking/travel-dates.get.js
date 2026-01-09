import { defineEventHandler, getQuery } from 'h3'
import dayjs from 'dayjs'
import { createClient } from '@sanity/client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { slugs } = getQuery(event)

  const slugList = typeof slugs === 'string'
    ? slugs.split(',').map(s => s.trim()).filter(Boolean)
    : []

  if (!slugList.length) {
    return []
  }

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  // Verify requested slugs exist (and retrieve closingDays) to avoid useless DB hits
  const sanityVoyages = await sanityClient.fetch(
    '*[_type == "voyage" && slug.current in $slugs]{ _id, "slug": slug.current, closingDays }',
    { slugs: slugList },
  )
  if (!sanityVoyages?.length) return []

  const metaBySlug = sanityVoyages.reduce((acc, v) => {
    if (!v?.slug) return acc
    acc[v.slug] = {
      voyage_id: v._id,
      // Sanity schema initialValue is 30; keep a safe fallback for older docs.
      closingDays: Number.isFinite(Number(v.closingDays)) ? Number(v.closingDays) : 30,
    }
    return acc
  }, {})

  // Build a per-slug closing filter:
  // if closingDays = 30, we only keep dates with departure_date >= now + 30 days
  const now = dayjs()
  const toPostgrestTimestamp = date => new Date(date).toISOString().replace(/\.\d{3}Z$/, 'Z')
  const orFilters = sanityVoyages
    .filter(v => v?.slug)
    .map((v) => {
      const closingDays = metaBySlug[v.slug]?.closingDays ?? 30
      const threshold = toPostgrestTimestamp(now.add(closingDays, 'day').toDate())
      // PostgREST "or" syntax requires quoting string values
      return `and(travel_slug.eq.${JSON.stringify(v.slug)},departure_date.gte.${JSON.stringify(threshold)})`
    })
    .join(',')

  const { data, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat, displayed_booked_seat, departure_date, return_date, early_bird, last_minute, starting_price, max_travelers, min_travelers, status, displayed_status, displayed_badges')
    .or(orFilters)
    .eq('published', true)
    .eq('is_custom_travel', false)
    // Extra global guard to keep the scanned set small (even though each OR branch already has its own gte threshold)
    .gte('departure_date', new Date().toISOString())

  if (error) {
    console.error('travel-dates supabase error', error)
    return []
  }

  return data.map(date => ({
    ...date,
    voyage_id: metaBySlug[date.travel_slug]?.voyage_id,
    closingDays: metaBySlug[date.travel_slug]?.closingDays ?? 30,
    closing_date: dayjs(date.departure_date).subtract((metaBySlug[date.travel_slug]?.closingDays ?? 30), 'day').toDate(),
    departure_date: new Date(date.departure_date),
    early_bird: dayjs().isAfter(dayjs(date.departure_date).add(7, 'month')) ? date.early_bird : false,
    last_minute: dayjs(date.departure_date).diff(dayjs(), 'day') <= 31 ? date.last_minute : false,
  }))
})
