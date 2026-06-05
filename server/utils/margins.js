import supabase from './supabase'

// =========================================================================
// Voyage-level margin table (Pattern A: margin per pax × year)
// =========================================================================

// If `year` is omitted, returns all years sorted by year DESC then pax ASC
// — useful for the editor that wants to show every saison side by side.
const getMarginForVoyage = async (voyageSlug, year = null) => {
  let q = supabase
    .from('voyage_margins')
    .select('pax, margin_per_traveler, year, updated_at, updated_by')
    .eq('voyage_slug', voyageSlug)
    .order('year', { ascending: false })
    .order('pax', { ascending: true })

  if (year != null) q = q.eq('year', Number(year))

  const { data, error } = await q
  if (error) throw error
  return data || []
}

const upsertMarginForVoyage = async (voyageSlug, rows, editorEmail, year) => {
  if (!Array.isArray(rows)) throw new Error('rows must be an array')
  if (year == null) throw new Error('year is required')

  const payload = rows
    .filter(r => Number.isInteger(r.pax) && r.pax > 0)
    .map(r => ({
      voyage_slug: voyageSlug,
      pax: r.pax,
      year: Number(year),
      margin_per_traveler: r.margin_per_traveler !== null && r.margin_per_traveler !== '' ? Number(r.margin_per_traveler) : null,
      updated_at: new Date().toISOString(),
      updated_by: editorEmail || null,
    }))

  if (!payload.length) return []

  const { data, error } = await supabase
    .from('voyage_margins')
    .upsert(payload, { onConflict: 'voyage_slug,pax,year' })
    .select()

  if (error) throw error
  return data
}

// =========================================================================
// Margin computation per travel date
// =========================================================================

// There is no FK constraint between booked_dates.deal_id and activecampaign_deals.id,
// so PostgREST can't infer the relationship. We do the join manually in two queries.

const getPayingBookingsForDate = async (travelDateId) => {
  const { data: bookings, error: bookingsError } = await supabase
    .from('booked_dates')
    .select('deal_id, booked_places')
    .eq('travel_date_id', travelDateId)
    .gt('booked_places', 0)

  if (bookingsError) throw bookingsError
  return bookings || []
}

const getDealsByIds = async (dealIds) => {
  if (!dealIds.length) return []
  const { data, error } = await supabase
    .from('activecampaign_deals')
    .select('id, pipeline_id, total_value, total_margin, flight_margin, insurance_commission, extra_margin_per_traveler, applied_promo_per_traveler, nb_traveler')
    .in('id', dealIds)
    .eq('pipeline_id', 2)

  if (error) throw error
  return data || []
}

// Single-pass aggregation over the deals array — returns every total the v2
// formula needs. Per-pax fields use THIS deal's nb_traveler (not the global
// real_pax) so mixed-size deals stay correct.
//
// Used by computeMarginForDate (single-date) and the dashboard batch endpoint.
const aggregateDealTotals = (deals) => {
  return deals.reduce((acc, d) => {
    const dealPax = Number(d.nb_traveler || 0)
    acc.estimated += Number(d.total_margin || 0)
    acc.ca += Number(d.total_value || 0)
    acc.additional_margins
      += Number(d.flight_margin || 0)
      + Number(d.insurance_commission || 0)
      + Number(d.extra_margin_per_traveler || 0) * dealPax
    acc.promo_deductions += Number(d.applied_promo_per_traveler || 0) * dealPax
    return acc
  }, { estimated: 0, ca: 0, additional_margins: 0, promo_deductions: 0 })
}

// Pure v2 formula: takes already-aggregated deal totals + base margin info,
// returns the real margin. Single source of truth used by the per-date util
// and the batch dashboard endpoint.
const computeRealMargin = ({ baseMarginPerPax, realPax, additionalMargins, promoDeductions }) => {
  if (baseMarginPerPax == null) return null
  return baseMarginPerPax * realPax + additionalMargins - promoDeductions
}

const getTotalInvoicesForDate = async (travelDateId) => {
  const { data, error } = await supabase
    .from('date_invoices')
    .select('amount')
    .eq('travel_date_id', travelDateId)

  if (error) throw error
  return (data || []).reduce((acc, r) => acc + Number(r.amount || 0), 0)
}

/**
 * Resolves the base "margin per traveler" for a date:
 * 1. travel_dates.margin_override_per_traveler (Pattern B) — wins if set
 * 2. voyage_margins[voyage_slug, pax=realPax, year=departureYear]
 * 3. fallback: nearest year with a row at this pax (any direction).
 *    Tie-breaker: prefer the older year (conservative — historical costs are safer).
 * 4. null — no config available
 *
 * Returns { value, source: 'override' | 'pax' | null, source_year?: number }
 */
const resolveBaseMarginPerPax = async (travelDate, realPax) => {
  if (travelDate.margin_override_per_traveler !== null && travelDate.margin_override_per_traveler !== undefined) {
    return { value: Number(travelDate.margin_override_per_traveler), source: 'override' }
  }

  if (realPax <= 0) return { value: null, source: null }

  const departureYear = travelDate.departure_date
    ? new Date(travelDate.departure_date).getFullYear()
    : new Date().getFullYear()

  // Fetch all configured years for this slug+pax (typically 1-3 rows), then pick
  // the nearest year in JS. Cheaper than two range queries + merge.
  const { data: candidates } = await supabase
    .from('voyage_margins')
    .select('margin_per_traveler, year')
    .eq('voyage_slug', travelDate.travel_slug)
    .eq('pax', realPax)
    .not('margin_per_traveler', 'is', null)

  const best = pickNearestYearCandidate(candidates || [], departureYear)
  if (best) {
    return { value: Number(best.margin_per_traveler), source: 'pax', source_year: best.year }
  }

  return { value: null, source: null }
}

// Nearest year with conservative tie-breaker (prefer older year on equal distance).
// Used by both the per-date util and the batch dashboard endpoint to stay in sync.
const pickNearestYearCandidate = (candidates, targetYear) => {
  if (!candidates.length) return null
  return [...candidates].sort((a, b) => {
    const da = Math.abs(a.year - targetYear)
    const db = Math.abs(b.year - targetYear)
    if (da !== db) return da - db
    return a.year - b.year
  })[0]
}

/**
 * Full margin computation for a date. Returns the structured breakdown.
 *
 * real_margin = (base_margin_per_pax × real_pax)
 *             + flight_margin                 (sum over deals)
 *             + insurance_commission          (sum over deals)
 *             + extra_margin_per_traveler × nb_traveler   (sum over deals)
 *             − applied_promo_per_traveler × nb_traveler  (sum over deals)
 */
const computeMarginForDate = async (travelDateId) => {
  const { data: travelDate, error: tdError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug, departure_date, return_date, margin_override_per_traveler, real_traveler_count_override')
    .eq('id', travelDateId)
    .single()

  if (tdError || !travelDate) throw new Error('Travel date not found')

  const bookings = await getPayingBookingsForDate(travelDateId)
  const dealIds = bookings.map(b => b.deal_id).filter(Boolean)
  const deals = await getDealsByIds(dealIds)
  const paidDealIds = new Set(deals.map(d => Number(d.id)))
  const computedRealPax = bookings
    .filter(b => paidDealIds.has(Number(b.deal_id)))
    .reduce((acc, b) => acc + Number(b.booked_places || 0), 0)

  const realPax = travelDate.real_traveler_count_override !== null && travelDate.real_traveler_count_override !== undefined
    ? Number(travelDate.real_traveler_count_override)
    : computedRealPax

  const totals = aggregateDealTotals(deals)

  // Independent of each other and of `totals` — parallelize.
  const [totalInvoices, baseMargin] = await Promise.all([
    getTotalInvoicesForDate(travelDateId),
    resolveBaseMarginPerPax(travelDate, realPax),
  ])

  const real = computeRealMargin({
    baseMarginPerPax: baseMargin.value,
    realPax,
    additionalMargins: totals.additional_margins,
    promoDeductions: totals.promo_deductions,
  })

  const isFinished = travelDate.return_date && new Date(travelDate.return_date) < new Date()

  return {
    estimated: totals.estimated,
    real,
    real_pax: realPax,
    computed_real_pax: computedRealPax,
    base_margin_per_pax: baseMargin.value,
    base_margin_source: baseMargin.source,
    base_margin_source_year: baseMargin.source_year ?? null,
    additional_margins: totals.additional_margins,
    promo_deductions: totals.promo_deductions,
    ca: totals.ca,
    total_invoices: totalInvoices,
    is_finished: !!isFinished,
    margin_override_per_traveler: travelDate.margin_override_per_traveler !== null
      ? Number(travelDate.margin_override_per_traveler)
      : null,
    real_traveler_count_override: travelDate.real_traveler_count_override !== null
      ? Number(travelDate.real_traveler_count_override)
      : null,
  }
}

const updateMarginOverride = async (travelDateId, { margin_override_per_traveler, real_traveler_count_override }) => {
  const update = {}
  if (margin_override_per_traveler !== undefined) {
    update.margin_override_per_traveler = margin_override_per_traveler === null || margin_override_per_traveler === ''
      ? null
      : Number(margin_override_per_traveler)
  }
  if (real_traveler_count_override !== undefined) {
    update.real_traveler_count_override = real_traveler_count_override === null || real_traveler_count_override === ''
      ? null
      : Number(real_traveler_count_override)
  }

  if (!Object.keys(update).length) return null

  const { data, error } = await supabase
    .from('travel_dates')
    .update(update)
    .eq('id', travelDateId)
    .select('id, margin_override_per_traveler, real_traveler_count_override')
    .single()

  if (error) throw error
  return data
}

export default {
  getMarginForVoyage,
  upsertMarginForVoyage,
  computeMarginForDate,
  updateMarginOverride,
  // Pure helpers exposed for the batch dashboard endpoint to keep the v2 formula
  // and year-fallback rule in one place. Single-date and batch paths both compose these.
  aggregateDealTotals,
  computeRealMargin,
  pickNearestYearCandidate,
}
