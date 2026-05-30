import { defineEventHandler, getQuery, createError } from 'h3'
import dayjs from 'dayjs'

// Aggregate-only dashboard: returns per-voyage totals + globals, no per-date breakdown.
// Per-date detail is fetched lazily via /booking/margins/dashboard/[slug] on expand.
//
// Default window: 12 months back → 18 months ahead. Override via ?from=YYYY-MM-DD&to=YYYY-MM-DD.
// All money values are EUR (not cents). Variance = real - estimated.

const chunk = (arr, size) => {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// PostgREST caps responses at 1000 rows by default — loop with .range() until short page.
const fetchAllPaginated = async (buildQuery, pageSize = 1000) => {
  const out = []
  for (let page = 0; ; page++) {
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, error } = await buildQuery().range(from, to)
    if (error) throw error
    if (!data?.length) break
    out.push(...data)
    if (data.length < pageSize) break
  }
  return out
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { from, to } = getQuery(event)
  const dateFrom = from || dayjs().subtract(12, 'month').format('YYYY-MM-DD')
  const dateTo = to || dayjs().add(18, 'month').format('YYYY-MM-DD')

  // 1) Travel dates in window — treat NULL deleted/is_test as false (default).
  const travelDates = await fetchAllPaginated(() =>
    supabase
      .from('travel_dates')
      .select('id, travel_slug, departure_date, return_date, margin_override_per_traveler')
      .not('deleted', 'is', true)
      .not('is_test', 'is', true)
      .gte('departure_date', dateFrom)
      .lte('departure_date', dateTo),
  )

  if (!travelDates.length) {
    return { voyages: [], globals: emptyGlobals(), window: { from: dateFrom, to: dateTo } }
  }

  // 2) Booked dates with paying seats — chunked .in() with small chunks to keep URL short.
  const dateIds = travelDates.map(d => d.id)
  const bookingsChunks = await Promise.all(
    chunk(dateIds, 100).map(ids =>
      fetchAllPaginated(() =>
        supabase
          .from('booked_dates')
          .select('travel_date_id, deal_id, booked_places')
          .in('travel_date_id', ids)
          .gt('booked_places', 0),
      ),
    ),
  )
  const bookings = bookingsChunks.flat()

  // 3) All paying deals (pipeline 2) — paginated, no .in() filter to avoid URL overflow.
  //    Data per row is tiny (id + 3 numerics) so even ~10k rows is sub-MB.
  const allPaidDeals = await fetchAllPaginated(() =>
    supabase
      .from('activecampaign_deals')
      .select('id, total_margin, flight_margin, insurance_commission')
      .eq('pipeline_id', 2),
  )
  const dealsById = new Map(allPaidDeals.map(d => [Number(d.id), d]))

  // 4) Voyage margins config — just need to know which slugs have at least one PAX row.
  const { data: voyageMarginRows } = await supabase
    .from('voyage_margins')
    .select('voyage_slug')
  const slugsWithConfig = new Set((voyageMarginRows || []).map(r => r.voyage_slug))

  // 5) Index bookings by travel_date_id
  const bookingsByDate = new Map()
  for (const b of bookings) {
    if (!bookingsByDate.has(b.travel_date_id)) bookingsByDate.set(b.travel_date_id, [])
    bookingsByDate.get(b.travel_date_id).push(b)
  }

  // 6) Per-voyage aggregation
  const today = dayjs()
  const voyagesMap = new Map()
  let gEst = 0
  let gFinished = 0
  let gTotal = 0

  for (const td of travelDates) {
    const dateBookings = bookingsByDate.get(td.id) || []
    let dateEstimated = 0
    for (const b of dateBookings) {
      const deal = dealsById.get(Number(b.deal_id))
      if (deal) dateEstimated += Number(deal.total_margin || 0)
    }

    const isFinished = td.return_date && dayjs(td.return_date).isBefore(today)
    const hasConfig = td.margin_override_per_traveler != null || slugsWithConfig.has(td.travel_slug)

    if (!voyagesMap.has(td.travel_slug)) {
      voyagesMap.set(td.travel_slug, {
        voyage_slug: td.travel_slug,
        total_count: 0,
        finished_count: 0,
        configured_dates_count: 0,
        estimated: 0,
      })
    }
    const v = voyagesMap.get(td.travel_slug)
    v.total_count++
    if (isFinished) v.finished_count++
    if (hasConfig) v.configured_dates_count++
    v.estimated += dateEstimated

    gEst += dateEstimated
    if (isFinished) gFinished++
    gTotal++
  }

  const voyages = Array.from(voyagesMap.values()).map(v => ({
    voyage_slug: v.voyage_slug,
    has_pax_config: slugsWithConfig.has(v.voyage_slug),
    totals: {
      estimated: v.estimated,
      finished_count: v.finished_count,
      total_count: v.total_count,
      configured_dates_count: v.configured_dates_count,
    },
  }))

  return {
    voyages,
    globals: {
      total_estimated: gEst,
      finished_count: gFinished,
      total_dates_count: gTotal,
    },
    window: { from: dateFrom, to: dateTo },
  }
})

function emptyGlobals() {
  return { total_estimated: 0, finished_count: 0, total_dates_count: 0 }
}
