import { defineEventHandler, getQuery } from 'h3'
import dayjs from 'dayjs'
import { createClient } from '@sanity/client'

// Same projection the homepage uses for its curated carousels so the returned
// voyages render identically in VoyageCardWithDates.
const voyageProjection = `
  _id,
  "slug": slug.current,
  image,
  imageCard,
  rating,
  comments,
  title,
  availabilityTypes,
  duration,
  pricing,
  closingDays,
  destinations[]->{ _id, title },
  experienceType->{ _id, title },
  categories[]->{ _id, title },
  monthlyAvailability
`

// "Dernières places" carousel: instead of a hand-picked Sanity list, surface the
// voyages whose next bookable departure is the closest in time and still has
// seats left. Each voyage appears only once (its soonest qualifying date).
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { limit } = getQuery(event)
  const maxVoyages = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 12

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: false,
  })

  // 1. Pull all upcoming published departures, soonest first.
  const { data: rawDates, error } = await supabase
    .from('travel_dates')
    .select('travel_slug, booked_seat, max_travelers, displayed_booked_seat, displayed_max_travelers, custom_display, displayed_status, status, departure_date')
    .eq('published', true)
    .eq('is_custom_travel', false)
    .eq('deleted', false)
    .eq('is_test', false)
    .gte('departure_date', new Date().toISOString())
    .order('departure_date', { ascending: true })

  if (error) {
    console.error('last-minute-voyages supabase error', error)
    return []
  }
  if (!rawDates?.length) return []

  // Seats left, honouring the displayed_* overrides when custom_display is on.
  const hasSeatsLeft = (d) => {
    const useDisplayed = d.custom_display
    const max = useDisplayed ? d.displayed_max_travelers : d.max_travelers
    const booked = useDisplayed ? d.displayed_booked_seat : d.booked_seat
    // No known cap -> treat as bookable rather than hiding it.
    if (max == null) return true
    return Number(max) - Number(booked || 0) > 0
  }

  // Explicitly "Complet" dates are never last-minute candidates.
  const isFull = d => d.displayed_status === 'full' || d.status === 'full'

  const candidates = rawDates.filter(d => d.travel_slug && !isFull(d) && hasSeatsLeft(d))
  if (!candidates.length) return []

  // 2. Resolve closingDays (and confirm existence) for the candidate voyages.
  const candidateSlugs = [...new Set(candidates.map(d => d.travel_slug))]
  const sanityVoyages = await sanityClient.fetch(
    `*[_type == "voyage" && slug.current in $slugs]{ ${voyageProjection} }`,
    { slugs: candidateSlugs },
  )
  if (!sanityVoyages?.length) return []

  const voyageBySlug = sanityVoyages.reduce((acc, v) => {
    if (v?.slug) acc[v.slug] = v
    return acc
  }, {})

  // 3. Keep only bookable dates (departure beyond the voyage's closing window),
  //    then dedupe to the soonest qualifying date per voyage. rawDates is already
  //    sorted ascending, so the first hit per slug is the closest one.
  const now = dayjs()
  const seen = new Set()
  const orderedSlugs = []

  for (const d of candidates) {
    const voyage = voyageBySlug[d.travel_slug]
    if (!voyage || seen.has(d.travel_slug)) continue
    const closingDays = Number.isFinite(Number(voyage.closingDays)) ? Number(voyage.closingDays) : 30
    if (dayjs(d.departure_date).diff(now, 'day') < closingDays) continue
    seen.add(d.travel_slug)
    orderedSlugs.push(d.travel_slug)
    if (orderedSlugs.length >= maxVoyages) break
  }

  // 4. Return the voyages in soonest-departure order.
  return orderedSlugs.map(slug => voyageBySlug[slug]).filter(Boolean)
})
