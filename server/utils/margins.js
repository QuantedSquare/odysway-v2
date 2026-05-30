import supabase from './supabase'

// =========================================================================
// Voyage-level margin table (Pattern A: margin per pax)
// =========================================================================

const getMarginForVoyage = async (voyageSlug) => {
  const { data, error } = await supabase
    .from('voyage_margins')
    .select('pax, margin_per_traveler, updated_at, updated_by')
    .eq('voyage_slug', voyageSlug)
    .order('pax', { ascending: true })

  if (error) throw error
  return data || []
}

const upsertMarginForVoyage = async (voyageSlug, rows, editorEmail) => {
  // rows: [{ pax, margin_per_traveler }]
  if (!Array.isArray(rows)) throw new Error('rows must be an array')

  const payload = rows
    .filter(r => Number.isInteger(r.pax) && r.pax > 0)
    .map(r => ({
      voyage_slug: voyageSlug,
      pax: r.pax,
      margin_per_traveler: r.margin_per_traveler !== null && r.margin_per_traveler !== '' ? Number(r.margin_per_traveler) : null,
      updated_at: new Date().toISOString(),
      updated_by: editorEmail || null,
    }))

  if (!payload.length) return []

  const { data, error } = await supabase
    .from('voyage_margins')
    .upsert(payload, { onConflict: 'voyage_slug,pax' })
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
  // Get all booked_dates rows with confirmed seats (paying clients) on this date.
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
    .select('id, pipeline_id, total_margin, flight_margin, insurance_commission')
    .in('id', dealIds)
    .eq('pipeline_id', 2)

  if (error) throw error
  return data || []
}

const getRealPaxForDate = async (travelDateId) => {
  // Real pax = sum of booked_places on this date for deals confirmed as "Voyageurs".
  const bookings = await getPayingBookingsForDate(travelDateId)
  if (!bookings.length) return 0

  const dealIds = bookings.map(b => b.deal_id).filter(Boolean)
  const paidDeals = await getDealsByIds(dealIds)
  const paidDealIds = new Set(paidDeals.map(d => Number(d.id)))

  return bookings
    .filter(b => paidDealIds.has(Number(b.deal_id)))
    .reduce((acc, b) => acc + Number(b.booked_places || 0), 0)
}

const getDealsForDate = async (travelDateId) => {
  // All paying deals on this travel date with the margin columns we need.
  const bookings = await getPayingBookingsForDate(travelDateId)
  if (!bookings.length) return []

  const dealIds = bookings.map(b => b.deal_id).filter(Boolean)
  return getDealsByIds(dealIds)
}

const computeEstimatedMargin = (deals) => {
  return deals.reduce((acc, d) => acc + Number(d.total_margin || 0), 0)
}

const computeAdditionalMargins = (deals) => {
  return deals.reduce(
    (acc, d) => acc + Number(d.flight_margin || 0) + Number(d.insurance_commission || 0),
    0,
  )
}

/**
 * Resolves the base "margin per traveler" for a date:
 * 1. travel_dates.margin_override_per_traveler (Pattern B) — wins if set
 * 2. voyage_margins[voyage_slug, real_pax] (Pattern A)
 * 3. null — no config available
 *
 * Returns { value, source: 'override' | 'pax' | null }
 */
const resolveBaseMarginPerPax = async (travelDate, realPax) => {
  if (travelDate.margin_override_per_traveler !== null && travelDate.margin_override_per_traveler !== undefined) {
    return { value: Number(travelDate.margin_override_per_traveler), source: 'override' }
  }

  if (realPax <= 0) return { value: null, source: null }

  const { data } = await supabase
    .from('voyage_margins')
    .select('margin_per_traveler')
    .eq('voyage_slug', travelDate.travel_slug)
    .eq('pax', realPax)
    .maybeSingle()

  if (data && data.margin_per_traveler !== null) {
    return { value: Number(data.margin_per_traveler), source: 'pax' }
  }

  return { value: null, source: null }
}

/**
 * Full margin computation for a date. Returns the structured breakdown.
 */
const computeMarginForDate = async (travelDateId) => {
  const { data: travelDate, error: tdError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug, return_date, margin_override_per_traveler, real_traveler_count_override')
    .eq('id', travelDateId)
    .single()

  if (tdError || !travelDate) throw new Error('Travel date not found')

  // Single round-trip: fetch bookings, then paying deals, then derive both real_pax and the deal margins.
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

  const estimated = computeEstimatedMargin(deals)
  const additionalMargins = computeAdditionalMargins(deals)
  const baseMargin = await resolveBaseMarginPerPax(travelDate, realPax)

  const real = baseMargin.value !== null
    ? baseMargin.value * realPax + additionalMargins
    : null

  const isFinished = travelDate.return_date && new Date(travelDate.return_date) < new Date()

  return {
    estimated,
    real,
    real_pax: realPax,
    computed_real_pax: computedRealPax,
    base_margin_per_pax: baseMargin.value,
    base_margin_source: baseMargin.source,
    additional_margins: additionalMargins,
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
}
