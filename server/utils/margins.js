import supabase from './supabase'

// =========================================================================
// Dates
// =========================================================================

// travel_dates.departure_date is a Postgres `date` → 'YYYY-MM-DD'. Parse the
// string directly rather than through `new Date()`: that would give UTC midnight,
// which lands on the previous day (and possibly the previous month/year) in any
// negative-offset timezone — enough to put a departure in the wrong season.
const parseDateParts = (value) => {
  if (!value) return null
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

const getDepartureYear = departureDate =>
  parseDateParts(departureDate)?.year ?? new Date().getFullYear()

// =========================================================================
// Seasons (Pattern C: recurring DD/MM windows, defined once per voyage)
// =========================================================================
// Amounts stay per year in voyage_margins — only the window recurs. A date is
// always attached to the calendar year of its departure, wrapping season or not:
// a 15/01/2027 departure inside "Haute saison 01/10 → 30/04" reads the 2027 amounts.

// Encodes a month/day pair as a comparable integer: 15/03 → 315.
const monthDayKey = (month, day) => Number(month) * 100 + Number(day)

// Expands a season into 1-2 non-wrapping intervals on the 101..1231 scale, so
// containment and overlap are plain interval math. A season crossing 31/12
// (start > end) becomes [start, 1231] + [101, end].
const seasonIntervals = (season) => {
  const start = monthDayKey(season.start_month, season.start_day)
  const end = monthDayKey(season.end_month, season.end_day)
  return start <= end ? [[start, end]] : [[start, 1231], [101, end]]
}

const seasonContainsDate = (season, departureDate) => {
  const parts = parseDateParts(departureDate)
  if (!parts) return false
  const md = monthDayKey(parts.month, parts.day)
  return seasonIntervals(season).some(([start, end]) => md >= start && md <= end)
}

// Lowest sort_order wins if two seasons somehow overlap (writes are validated,
// but rows predating a validation fix shouldn't make the resolver non-deterministic).
const matchSeasonForDate = (seasons, departureDate) => {
  if (!departureDate || !seasons?.length) return null
  return [...seasons]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .find(s => seasonContainsDate(s, departureDate)) || null
}

// Returns the first overlapping pair as [seasonA, seasonB], or null when clean.
const findSeasonOverlap = (seasons) => {
  for (let i = 0; i < seasons.length; i++) {
    for (let j = i + 1; j < seasons.length; j++) {
      const overlaps = seasonIntervals(seasons[i]).some(([aStart, aEnd]) =>
        seasonIntervals(seasons[j]).some(([bStart, bEnd]) => aStart <= bEnd && bStart <= aEnd),
      )
      if (overlaps) return [seasons[i], seasons[j]]
    }
  }
  return null
}

// Feb allows 29 so a leap-year window can be entered; the season only ever
// matches dates that actually exist.
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const validateSeasons = (seasons) => {
  for (const s of seasons) {
    if (!s.label?.trim()) return 'Chaque saison doit avoir un nom.'
    for (const [month, day, side] of [
      [s.start_month, s.start_day, 'de début'],
      [s.end_month, s.end_day, 'de fin'],
    ]) {
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        return `Mois ${side} invalide pour « ${s.label} ».`
      }
      if (!Number.isInteger(day) || day < 1 || day > DAYS_IN_MONTH[month - 1]) {
        return `Jour ${side} invalide pour « ${s.label} » (le mois ${month} a ${DAYS_IN_MONTH[month - 1]} jours max).`
      }
    }
  }

  const overlap = findSeasonOverlap(seasons)
  if (overlap) {
    return `Les saisons « ${overlap[0].label} » et « ${overlap[1].label} » se chevauchent. Les périodes doivent être disjointes.`
  }
  return null
}

const getSeasonsForVoyage = async (voyageSlug) => {
  const { data, error } = await supabase
    .from('voyage_margin_seasons')
    .select('id, label, start_month, start_day, end_month, end_day, sort_order')
    .eq('voyage_slug', voyageSlug)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

// Replace-all semantics: the editor sends the full season list for the voyage.
// Seasons dropped from the payload are deleted, which cascades to their
// voyage_margins rows (ON DELETE CASCADE) — the amounts of a removed season
// have no meaning left.
const replaceSeasonsForVoyage = async (voyageSlug, seasons, editorEmail) => {
  if (!Array.isArray(seasons)) throw new Error('seasons must be an array')

  const normalized = seasons.map((s, index) => ({
    id: s.id || null,
    label: String(s.label || '').trim(),
    start_month: Number(s.start_month),
    start_day: Number(s.start_day),
    end_month: Number(s.end_month),
    end_day: Number(s.end_day),
    sort_order: Number.isInteger(s.sort_order) ? s.sort_order : index,
  }))

  const validationError = validateSeasons(normalized)
  if (validationError) {
    const err = new Error(validationError)
    err.statusCode = 400
    throw err
  }

  const keptIds = normalized.map(s => s.id).filter(Boolean)
  let deleteQuery = supabase.from('voyage_margin_seasons').delete().eq('voyage_slug', voyageSlug)
  if (keptIds.length) deleteQuery = deleteQuery.not('id', 'in', `(${keptIds.join(',')})`)
  const { error: deleteError } = await deleteQuery
  if (deleteError) throw deleteError

  if (!normalized.length) return []

  const common = s => ({
    label: s.label,
    start_month: s.start_month,
    start_day: s.start_day,
    end_month: s.end_month,
    end_day: s.end_day,
    sort_order: s.sort_order,
    voyage_slug: voyageSlug,
    updated_at: new Date().toISOString(),
    updated_by: editorEmail || null,
  })

  const RETURNING = 'id, label, start_month, start_day, end_month, end_day, sort_order'

  // Existing and new seasons cannot share one upsert call: supabase-js pads every
  // row of a batch to the same key set, so a new season would be sent with
  // `id: null` and trip the NOT NULL primary key. Updates keep their id (and with
  // it their voyage_margins amounts); inserts omit the column so the DB default
  // generates one.
  const updates = normalized.filter(s => s.id)
  const inserts = normalized.filter(s => !s.id)
  const saved = []

  if (updates.length) {
    const { data, error } = await supabase
      .from('voyage_margin_seasons')
      .upsert(updates.map(s => ({ id: s.id, ...common(s) })), { onConflict: 'id' })
      .select(RETURNING)
    if (error) throw error
    saved.push(...(data || []))
  }

  if (inserts.length) {
    const { data, error } = await supabase
      .from('voyage_margin_seasons')
      .insert(inserts.map(common))
      .select(RETURNING)
    if (error) throw error
    saved.push(...(data || []))
  }

  return saved.sort((a, b) => a.sort_order - b.sort_order)
}

// =========================================================================
// Per-voyage settings (config mode + child margin delta)
// =========================================================================

const DEFAULT_SETTINGS = { config_mode: 'pax_table', child_margin_delta: null }
const CONFIG_MODES = ['pax_table', 'per_date', 'excluded']

const getSettingsForVoyage = async (voyageSlug) => {
  const { data, error } = await supabase
    .from('voyage_margin_settings')
    .select('voyage_slug, config_mode, child_margin_delta, updated_at, updated_by')
    .eq('voyage_slug', voyageSlug)
    .maybeSingle()

  if (error) throw error
  return data || { voyage_slug: voyageSlug, ...DEFAULT_SETTINGS }
}

const upsertSettingsForVoyage = async (voyageSlug, { config_mode, child_margin_delta }, editorEmail) => {
  const update = { voyage_slug: voyageSlug, updated_at: new Date().toISOString(), updated_by: editorEmail || null }

  if (config_mode !== undefined) {
    if (!CONFIG_MODES.includes(config_mode)) {
      const err = new Error(`config_mode doit être ${CONFIG_MODES.join(', ')}`)
      err.statusCode = 400
      throw err
    }
    update.config_mode = config_mode
  }
  if (child_margin_delta !== undefined) {
    update.child_margin_delta = child_margin_delta === null || child_margin_delta === ''
      ? null
      : Number(child_margin_delta)
  }

  const { data, error } = await supabase
    .from('voyage_margin_settings')
    .upsert(update, { onConflict: 'voyage_slug' })
    .select('voyage_slug, config_mode, child_margin_delta')
    .single()

  if (error) throw error
  return data
}

// =========================================================================
// Voyage-level margin table (Pattern A: margin per pax × year × season)
// =========================================================================

// If `year` is omitted, returns all years sorted by year DESC then pax ASC
// — useful for the editor that wants to show every saison side by side.
const getMarginForVoyage = async (voyageSlug, year = null) => {
  let q = supabase
    .from('voyage_margins')
    .select('pax, margin_per_traveler, year, season_id, updated_at, updated_by')
    .eq('voyage_slug', voyageSlug)
    .eq('deleted', false)
    .order('year', { ascending: false })
    .order('pax', { ascending: true })

  if (year != null) q = q.eq('year', Number(year))

  const { data, error } = await q
  if (error) throw error
  return data || []
}

// `seasonId` null targets the "toutes saisons" default rows. The unique
// constraint is NULLS NOT DISTINCT, so a null season upserts like any other value.
const upsertMarginForVoyage = async (voyageSlug, rows, editorEmail, year, seasonId = null) => {
  if (!Array.isArray(rows)) throw new Error('rows must be an array')
  if (year == null) throw new Error('year is required')

  const payload = rows
    .filter(r => Number.isInteger(r.pax) && r.pax > 0)
    .map(r => ({
      voyage_slug: voyageSlug,
      pax: r.pax,
      year: Number(year),
      season_id: seasonId || null,
      margin_per_traveler: r.margin_per_traveler !== null && r.margin_per_traveler !== '' ? Number(r.margin_per_traveler) : null,
      updated_at: new Date().toISOString(),
      updated_by: editorEmail || null,
      // Sans ça, ON CONFLICT DO UPDATE écrirait droit dans une ligne supprimée
      // sans lever le drapeau : l'opérateur saisit une marge, voit
      // « enregistré », et la valeur reste invisible pour toujours tout en
      // faussant silencieusement tous les calculs de marge du voyage.
      ...softDelete.clear(),
    }))

  if (!payload.length) return []

  const { data, error } = await supabase
    .from('voyage_margins')
    .upsert(payload, { onConflict: 'voyage_slug,pax,year,season_id' })
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
    .eq('deleted', false)
    .gt('booked_places', 0)

  if (bookingsError) throw bookingsError
  return bookings || []
}

const getDealsByIds = async (dealIds) => {
  if (!dealIds.length) return []
  const { data, error } = await supabase
    .from('activecampaign_deals')
    .select('id, pipeline_id, total_value, total_margin, flight_margin, insurance_commission, extra_margin_per_traveler, applied_promo_per_traveler, nb_traveler, nb_children')
    .in('id', dealIds)
    .eq('pipeline_id', 2)

  if (error) throw error
  return data || []
}

// Single-pass aggregation over the deals array — returns every total the v3
// formula needs. Per-pax fields use THIS deal's nb_traveler (not the global
// real_pax) so mixed-size deals stay correct.
//
// Used by computeMarginForDate (single-date) and the dashboard batch endpoint.
const aggregateDealTotals = (deals) => {
  return deals.reduce((acc, d) => {
    const dealPax = Number(d.nb_traveler || 0)
    acc.estimated += Number(d.total_margin || 0)
    acc.ca += Number(d.total_value || 0)
    acc.child_pax += Number(d.nb_children || 0)
    acc.additional_margins
      += Number(d.flight_margin || 0)
        + Number(d.insurance_commission || 0)
        + Number(d.extra_margin_per_traveler || 0) * dealPax
    acc.promo_deductions += Number(d.applied_promo_per_traveler || 0) * dealPax
    return acc
  }, { estimated: 0, ca: 0, additional_margins: 0, promo_deductions: 0, child_pax: 0 })
}

// Pure v3 formula: takes already-aggregated deal totals + base margin info,
// returns the real margin. Single source of truth used by the per-date util
// and the batch dashboard endpoint.
//
// The child term is algebraically the same as splitting the pax:
//   base × adults + (base + childDelta) × children  ==  base × pax + childDelta × children
// A child costs less to buy, so childDelta is normally positive.
const computeRealMargin = ({ baseMarginPerPax, realPax, additionalMargins, promoDeductions, childDelta = 0, childPax = 0 }) => {
  if (baseMarginPerPax == null) return null
  return baseMarginPerPax * realPax
    + Number(childDelta || 0) * Number(childPax || 0)
    + additionalMargins
    - promoDeductions
}

// real_traveler_count_override is entered by hand and can be lower than the
// children counted on the deals — never let the child term exceed the pax count.
const clampChildPax = (childPax, realPax) => Math.max(0, Math.min(Number(childPax || 0), Number(realPax || 0)))

const getTotalInvoicesForDate = async (travelDateId) => {
  const { data, error } = await supabase
    .from('date_invoices')
    .select('amount')
    .eq('travel_date_id', travelDateId)
    .eq('deleted', false)

  if (error) throw error
  return (data || []).reduce((acc, r) => acc + Number(r.amount || 0), 0)
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
 * Pure resolver over already-fetched rows — the single place that encodes the
 * lookup order. Both the per-date util and the batch dashboard endpoint call it,
 * the only difference being where `rows` and `seasons` come from.
 *
 * 1. season matched by departure_date → rows of that season   → 'pax_season'
 * 2. season-less rows (toutes saisons)                        → 'pax'
 * 3. null
 *
 * Within each level, the year fallback applies (nearest configured year).
 * The default rows therefore act as a safety net for any season left blank.
 *
 * @param {Array} rows    voyage_margins rows for this voyage, already filtered to the target pax
 * @param {Array} seasons voyage_margin_seasons rows for this voyage
 */
const resolveBaseFromRows = ({ rows, seasons, departureDate }) => {
  const season = matchSeasonForDate(seasons, departureDate)
  const departureYear = getDepartureYear(departureDate)
  const usable = (rows || []).filter(r => r.margin_per_traveler !== null && r.margin_per_traveler !== undefined)

  const seasonInfo = { season_id: season?.id ?? null, season_label: season?.label ?? null }

  if (season) {
    const best = pickNearestYearCandidate(usable.filter(r => r.season_id === season.id), departureYear)
    if (best) {
      return { value: Number(best.margin_per_traveler), source: 'pax_season', source_year: best.year, ...seasonInfo }
    }
  }

  const fallback = pickNearestYearCandidate(usable.filter(r => !r.season_id), departureYear)
  if (fallback) {
    return { value: Number(fallback.margin_per_traveler), source: 'pax', source_year: fallback.year, ...seasonInfo }
  }

  return { value: null, source: null, source_year: null, ...seasonInfo }
}

/**
 * Resolves the base "margin per traveler" for a date:
 * 1. travel_dates.margin_override_per_traveler (Pattern B) — wins if set
 * 2. voyage_margins for the matched season / then the season-less default rows,
 *    each with the nearest-year fallback (see resolveBaseFromRows)
 * 3. null — no config available
 */
const resolveBaseMarginPerPax = async (travelDate, realPax) => {
  if (travelDate.margin_override_per_traveler !== null && travelDate.margin_override_per_traveler !== undefined) {
    return { value: Number(travelDate.margin_override_per_traveler), source: 'override', season_id: null, season_label: null }
  }

  if (realPax <= 0) return { value: null, source: null, season_id: null, season_label: null }

  // Fetch all configured years/seasons for this slug+pax (a handful of rows),
  // then resolve in JS — cheaper than one query per lookup level.
  const [seasons, { data: candidates }] = await Promise.all([
    getSeasonsForVoyage(travelDate.travel_slug),
    supabase
      .from('voyage_margins')
      .select('margin_per_traveler, year, season_id')
      .eq('voyage_slug', travelDate.travel_slug)
      .eq('deleted', false)
      .eq('pax', realPax)
      .not('margin_per_traveler', 'is', null),
  ])

  return resolveBaseFromRows({
    rows: candidates || [],
    seasons,
    departureDate: travelDate.departure_date,
  })
}

/**
 * Full margin computation for a date. Returns the structured breakdown.
 *
 * real_margin = (base_margin_per_pax × real_pax)
 *             + child_margin_delta × nb_children  (sum over deals, clamped to real_pax)
 *             + flight_margin                     (sum over deals)
 *             + insurance_commission              (sum over deals)
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
  const childPax = clampChildPax(totals.child_pax, realPax)

  // Independent of each other and of `totals` — parallelize.
  const [totalInvoices, baseMargin, settings] = await Promise.all([
    getTotalInvoicesForDate(travelDateId),
    resolveBaseMarginPerPax(travelDate, realPax),
    getSettingsForVoyage(travelDate.travel_slug),
  ])

  const childDelta = Number(settings.child_margin_delta || 0)

  const real = computeRealMargin({
    baseMarginPerPax: baseMargin.value,
    realPax,
    additionalMargins: totals.additional_margins,
    promoDeductions: totals.promo_deductions,
    childDelta,
    childPax,
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
    season_id: baseMargin.season_id ?? null,
    season_label: baseMargin.season_label ?? null,
    child_pax: childPax,
    child_margin_delta: settings.child_margin_delta !== null ? Number(settings.child_margin_delta) : null,
    child_margin_total: childDelta * childPax,
    config_mode: settings.config_mode,
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
  // Seasons + settings
  getSeasonsForVoyage,
  replaceSeasonsForVoyage,
  getSettingsForVoyage,
  upsertSettingsForVoyage,
  CONFIG_MODES,
  // Pure helpers exposed for the batch dashboard endpoints to keep the v3 formula,
  // the season matcher and the year-fallback rule in one place. Single-date and
  // batch paths both compose these.
  aggregateDealTotals,
  computeRealMargin,
  clampChildPax,
  pickNearestYearCandidate,
  resolveBaseFromRows,
  matchSeasonForDate,
  validateSeasons,
  getDepartureYear,
}
