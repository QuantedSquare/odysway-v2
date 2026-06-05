import { defineEventHandler, getQuery, createError } from 'h3'
import dayjs from 'dayjs'

// Per-voyage date breakdown — fetched lazily by the dashboard when a panel is expanded.
// Reuses the v2 formula helpers from server/utils/margins.js (auto-imported as `margins`)
// so single-date and batch paths can't drift. The only local logic is the in-memory
// year-fallback resolver — we fetch all years once, then resolve per date in JS
// rather than re-querying the DB per row like the single-date util does.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { slug } = event.context.params
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug requis' })

  const { from, to } = getQuery(event)
  const dateFrom = from || dayjs().subtract(12, 'month').format('YYYY-MM-DD')
  const dateTo = to || dayjs().add(18, 'month').format('YYYY-MM-DD')

  // 1) Dates for this voyage in window
  const { data: travelDates, error: tdError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug, departure_date, return_date, margin_override_per_traveler, real_traveler_count_override, max_travelers, booked_seat')
    .eq('travel_slug', slug)
    .not('deleted', 'is', true)
    .not('is_test', 'is', true)
    .gte('departure_date', dateFrom)
    .lte('departure_date', dateTo)
    .order('departure_date', { ascending: true })

  if (tdError) throw createError({ statusCode: 500, statusMessage: tdError.message })
  if (!travelDates?.length) return { dates: [], totals: { estimated: 0, real: null, variance: null, finished_count: 0, total_count: 0, real_dates_count: 0 } }

  // 2) Bookings (paying seats) for those dates — small list, no chunking needed.
  const dateIds = travelDates.map(d => d.id)
  const { data: bookings, error: bookingsError } = await supabase
    .from('booked_dates')
    .select('travel_date_id, deal_id, booked_places')
    .in('travel_date_id', dateIds)
    .gt('booked_places', 0)
  if (bookingsError) throw createError({ statusCode: 500, statusMessage: bookingsError.message })

  // 3) Deals (pipeline 2) — small list scoped to actual bookings on this voyage.
  const dealIds = [...new Set((bookings || []).map(b => b.deal_id).filter(Boolean))]
  let deals = []
  if (dealIds.length) {
    const { data, error } = await supabase
      .from('activecampaign_deals')
      .select('id, pipeline_id, total_margin, flight_margin, insurance_commission, extra_margin_per_traveler, applied_promo_per_traveler, nb_traveler')
      .in('id', dealIds)
      .eq('pipeline_id', 2)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    deals = data || []
  }
  const dealsById = new Map(deals.map(d => [Number(d.id), d]))

  // 4) PAX margin table for this voyage — all years; we resolve per-date below.
  const { data: paxRows } = await supabase
    .from('voyage_margins')
    .select('pax, margin_per_traveler, year')
    .eq('voyage_slug', slug)

  // Build a Map<pax, Array<{year, margin_per_traveler}>> for in-memory fallback lookup.
  // We delegate the actual nearest-year selection to margins.pickNearestYearCandidate
  // so the rule (conservative tie-breaker) stays in one place.
  const paxYearMap = new Map()
  for (const r of paxRows || []) {
    if (r.margin_per_traveler == null) continue
    if (!paxYearMap.has(r.pax)) paxYearMap.set(r.pax, [])
    paxYearMap.get(r.pax).push({ year: r.year, margin_per_traveler: Number(r.margin_per_traveler) })
  }

  function resolvePaxMargin(pax, departureYear) {
    const best = margins.pickNearestYearCandidate(paxYearMap.get(pax) || [], departureYear)
    return best ? { value: best.margin_per_traveler, year: best.year } : null
  }

  // 5) Group bookings by date
  const bookingsByDate = new Map()
  for (const b of bookings || []) {
    if (!bookingsByDate.has(b.travel_date_id)) bookingsByDate.set(b.travel_date_id, [])
    bookingsByDate.get(b.travel_date_id).push(b)
  }

  // 6) Compute breakdown per date — v2 formula
  const today = dayjs()
  let totalEst = 0
  let totalReal = 0
  let totalRealCount = 0
  let totalFinished = 0

  const dates = travelDates.map((td) => {
    const dateBookings = bookingsByDate.get(td.id) || []
    const paidDealsForDate = dateBookings.map(b => dealsById.get(Number(b.deal_id))).filter(Boolean)
    const paidDealIds = new Set(paidDealsForDate.map(d => Number(d.id)))

    const computedRealPax = dateBookings
      .filter(b => paidDealIds.has(Number(b.deal_id)))
      .reduce((acc, b) => acc + Number(b.booked_places || 0), 0)
    const realPax = td.real_traveler_count_override != null
      ? Number(td.real_traveler_count_override)
      : computedRealPax

    const totals = margins.aggregateDealTotals(paidDealsForDate)

    let baseMargin = null
    let source = null
    let sourceYear = null
    if (td.margin_override_per_traveler != null) {
      baseMargin = Number(td.margin_override_per_traveler)
      source = 'override'
    }
    else if (realPax > 0) {
      const departureYear = td.departure_date
        ? new Date(td.departure_date).getFullYear()
        : new Date().getFullYear()
      const resolved = resolvePaxMargin(realPax, departureYear)
      if (resolved) {
        baseMargin = resolved.value
        source = 'pax'
        sourceYear = resolved.year
      }
    }

    const real = margins.computeRealMargin({
      baseMarginPerPax: baseMargin,
      realPax,
      additionalMargins: totals.additional_margins,
      promoDeductions: totals.promo_deductions,
    })
    const isFinished = td.return_date && dayjs(td.return_date).isBefore(today)

    totalEst += totals.estimated
    if (real != null) {
      totalReal += real
      totalRealCount++
    }
    if (isFinished) totalFinished++

    return {
      id: td.id,
      departure_date: td.departure_date,
      return_date: td.return_date,
      real_pax: realPax,
      booked_seat: td.booked_seat,
      max_travelers: td.max_travelers,
      estimated: totals.estimated,
      real,
      variance: real != null ? real - totals.estimated : null,
      is_finished: !!isFinished,
      has_config: baseMargin != null,
      source,
      source_year: sourceYear,
    }
  })

  return {
    dates,
    totals: {
      estimated: totalEst,
      real: totalRealCount > 0 ? totalReal : null,
      variance: totalRealCount > 0 ? totalReal - totalEst : null,
      finished_count: totalFinished,
      total_count: dates.length,
      real_dates_count: totalRealCount,
    },
  }
})
