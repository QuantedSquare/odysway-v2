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
// group voyages with an upcoming bookable departure that has fewer than
// MAX_SEATS_LEFT seats left. Each voyage appears only once (its soonest
// qualifying date), soonest departure first.
const MAX_SEATS_LEFT = 4

// Seats left as shown on the public voyage page (DatesPricesItem): the
// back-office override displayed_booked_seat wins when set.
const seatsLeft = (d) => {
  if (d.max_travelers === null || d.max_travelers === undefined) return null
  const booked = Number(d.displayed_booked_seat) > 0 ? Number(d.displayed_booked_seat) : Number(d.booked_seat || 0)
  return Number(d.max_travelers) - booked
}

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
    .select('travel_slug, booked_seat, max_travelers, displayed_booked_seat, departure_date')
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

  // Only dates with between 1 and MAX_SEATS_LEFT - 1 seats left. The status is
  // irrelevant: 'guaranteed' means min_travelers is reached, not that the date
  // is full — a date is full only when no seat is left.
  const candidates = rawDates.filter((d) => {
    if (!d.travel_slug) return false
    const left = seatsLeft(d)
    return left !== null && left > 0 && left < MAX_SEATS_LEFT
  })
  if (!candidates.length) return []

  // 2. Resolve the candidate voyages. Only published group voyages have a
  //    public voyage page: a « sur-mesure only » voyage (availabilityTypes =
  //    ['custom']) shows « voyage indisponible » even if it still has dates.
  const candidateSlugs = [...new Set(candidates.map(d => d.travel_slug))]
  const sanityVoyages = await sanityClient.fetch(
    `*[_type == "voyage" && slug.current in $slugs && 'groupe' in availabilityTypes]{ ${voyageProjection} }`,
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
  const picked = []
  const seen = new Set()

  for (const d of candidates) {
    const voyage = voyageBySlug[d.travel_slug]
    if (!voyage || seen.has(d.travel_slug)) continue
    const closingDays = Number.isFinite(Number(voyage.closingDays)) ? Number(voyage.closingDays) : 30
    if (dayjs(d.departure_date).diff(now, 'day') < closingDays) continue
    seen.add(d.travel_slug)
    // The card must show this departure, not the voyage's earliest one (which
    // may have plenty of seats left).
    picked.push({ ...voyage, lastMinuteDepartureDate: d.departure_date })
    if (picked.length >= maxVoyages) break
  }

  // 4. Voyages in soonest-departure order.
  return picked
})
