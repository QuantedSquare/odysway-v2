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

// Tuning knobs, editable in Sanity (homePage > Dernières places). Defaults are
// the ones agreed with the PO: only push departures that already have at least
// one traveller on board and few seats left.
const DEFAULTS = {
  minBookedSeats: 1,
  maxRemainingSeats: 5,
  maxDaysUntilDeparture: null, // null = no horizon limit
  maxVoyages: 12,
}

// Sanity fallback for voyages whose closingDays was never filled in.
const FALLBACK_CLOSING_DAYS = 30

const toNonNegativeInt = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback
}

// "Dernières places" carousel: instead of a hand-picked Sanity list, surface the
// departures worth pushing — a group departure that is still bookable, already
// has travellers registered, and only has a handful of seats left. Each voyage
// appears once, with the soonest departure that matches those criteria.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: false,
  })

  // 1. Pull all upcoming published departures (soonest first) and the CMS
  //    settings for the section in parallel.
  const [{ data: rawDates, error }, cmsSettings] = await Promise.all([
    supabase
      .from('travel_dates')
      .select('travel_slug, departure_date, return_date, booked_seat, max_travelers, min_travelers, displayed_booked_seat, displayed_max_travelers, displayed_min_travelers, displayed_starting_price, starting_price, custom_display, displayed_status, status, early_bird, last_minute')
      .eq('published', true)
      .eq('is_custom_travel', false)
      .eq('deleted', false)
      .eq('is_test', false)
      .gte('departure_date', new Date().toISOString())
      .order('departure_date', { ascending: true }),
    sanityClient.fetch(`*[_type == "homePage"][0].lastMinute{
      minBookedSeats,
      maxRemainingSeats,
      maxDaysUntilDeparture,
      maxVoyages,
      "excludedSlugs": excludedVoyages[]->slug.current
    }`).catch((err) => {
      console.error('last-minute-voyages sanity settings error', err)
      return null
    }),
  ])

  if (error) {
    console.error('last-minute-voyages supabase error', error)
    return []
  }
  if (!rawDates?.length) return []

  // Query params win over the CMS so the section stays testable without an edit.
  const settings = {
    minBookedSeats: toNonNegativeInt(query.minBooked, toNonNegativeInt(cmsSettings?.minBookedSeats, DEFAULTS.minBookedSeats)),
    maxRemainingSeats: toNonNegativeInt(query.maxLeft, toNonNegativeInt(cmsSettings?.maxRemainingSeats, DEFAULTS.maxRemainingSeats)),
    maxDaysUntilDeparture: toNonNegativeInt(query.maxDays, toNonNegativeInt(cmsSettings?.maxDaysUntilDeparture, DEFAULTS.maxDaysUntilDeparture)),
    maxVoyages: Math.max(1, toNonNegativeInt(query.limit, toNonNegativeInt(cmsSettings?.maxVoyages, DEFAULTS.maxVoyages))),
  }
  const excludedSlugs = (cmsSettings?.excludedSlugs || []).filter(Boolean)

  // 2. Keep the departures that are actually pushable, before hitting Sanity.
  const candidates = rawDates.filter((date) => {
    if (!date.travel_slug || excludedSlugs.includes(date.travel_slug)) return false
    // Sold out, or flagged "Garanti (Complet)" by the BMS.
    if (isDateFull(date)) return false
    const { booked, seatsLeft } = resolveSeatCounts(date)
    // Nobody on board yet: nothing to push, the departure isn't taking off.
    if (booked < settings.minBookedSeats) return false
    // Unknown cap (no max_travelers) can't qualify as "dernières places".
    if (seatsLeft === null || seatsLeft > settings.maxRemainingSeats) return false
    return true
  })
  if (!candidates.length) return []

  // 3. Resolve the voyages in Sanity. Only group departures qualify: a voyage
  //    that is custom-only has no bookable page (it renders the "voyage
  //    indisponible" state), which is how offline trips kept showing up here.
  const candidateSlugs = [...new Set(candidates.map(d => d.travel_slug))]
  const sanityVoyages = await sanityClient.fetch(
    `*[_type == "voyage" && slug.current in $slugs && "groupe" in availabilityTypes]{ ${voyageProjection} }`,
    { slugs: candidateSlugs },
  )
  if (!sanityVoyages?.length) return []

  const voyageBySlug = sanityVoyages.reduce((acc, v) => {
    if (v?.slug) acc[v.slug] = v
    return acc
  }, {})

  // 4. Drop the dates that are past their booking window (and beyond the CMS
  //    horizon when one is set), then dedupe to the soonest qualifying date per
  //    voyage. rawDates is already sorted ascending, so the first hit per slug
  //    is the closest one.
  const now = dayjs()
  const seen = new Set()
  const picked = []

  for (const date of candidates) {
    const voyage = voyageBySlug[date.travel_slug]
    if (!voyage || seen.has(date.travel_slug)) continue
    const closingDays = Number.isFinite(Number(voyage.closingDays)) ? Number(voyage.closingDays) : FALLBACK_CLOSING_DAYS
    const daysUntilDeparture = dayjs(date.departure_date).diff(now, 'day')
    if (daysUntilDeparture < closingDays) continue
    if (settings.maxDaysUntilDeparture !== null && daysUntilDeparture > settings.maxDaysUntilDeparture) continue
    seen.add(date.travel_slug)
    picked.push({ voyage, date })
    if (picked.length >= settings.maxVoyages) break
  }

  // 5. Return the voyages in soonest-departure order, each carrying the exact
  //    departure the carousel is pushing (seat counts already resolved against
  //    the displayed_* layer) so the card can't fall back to another date.
  return picked.map(({ voyage, date }) => {
    const { max, booked, min, seatsLeft } = resolveSeatCounts(date)
    return {
      ...voyage,
      lastMinuteDate: {
        departure_date: date.departure_date,
        return_date: date.return_date,
        booked_seat: booked,
        max_travelers: max,
        min_travelers: min,
        seats_left: seatsLeft,
        starting_price: resolveStartingPrice(date),
        status: resolveDateStatus(date),
        early_bird: date.early_bird,
        last_minute: date.last_minute,
      },
    }
  })
})
