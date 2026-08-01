import { defineEventHandler, getQuery, createError } from 'h3'

// Configuration status, scoped to one departure year (?year=2027, default: current year).
//
// Margins are entered per year, so "configured or not" only means something for a
// given year: a voyage fully set up for 2026 can be untouched for 2027. `available_years`
// is derived from the departure dates actually present, which is what makes the
// Configuration tab roll over on its own (2027 → 2028 → …).

const STATUS = {
  EXCLUDED: 'excluded',
  CONFIGURED: 'configured',
  PARTIAL: 'partial',
  UNCONFIGURED: 'unconfigured',
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const currentYear = new Date().getFullYear()
  const requestedYear = Number(getQuery(event).year)
  const targetYear = Number.isInteger(requestedYear) ? requestedYear : currentYear

  // Keep one year of history available in the selector alongside the future ones.
  const historyFloor = `${currentYear - 1}-01-01`

  const [marginRows, seasonRows, settingsRows, travelDates] = await Promise.all([
    fetchAllPaginated(() =>
      supabase.from('voyage_margins').select('voyage_slug, pax, year, season_id, margin_per_traveler').eq('deleted', false),
    ),
    fetchAllPaginated(() =>
      supabase.from('voyage_margin_seasons').select('id, voyage_slug, label, sort_order'),
    ),
    fetchAllPaginated(() =>
      supabase.from('voyage_margin_settings').select('voyage_slug, config_mode, child_margin_delta'),
    ),
    fetchAllPaginated(() =>
      supabase
        .from('travel_dates')
        .select('travel_slug, departure_date, margin_override_per_traveler')
        .eq('deleted', false)
        .eq('is_test', false)
        .gte('departure_date', historyFloor),
    ),
  ]).catch((err) => {
    throw createError({ statusCode: 500, statusMessage: err.message })
  })

  const settingsBySlug = new Map(settingsRows.map(s => [s.voyage_slug, s]))

  const seasonsBySlug = new Map()
  for (const s of seasonRows) {
    if (!seasonsBySlug.has(s.voyage_slug)) seasonsBySlug.set(s.voyage_slug, [])
    seasonsBySlug.get(s.voyage_slug).push(s)
  }

  // Every slug we know anything about: margin rows, seasons, settings, or dates.
  // Slugs missing from the response are simply unconfigured with no departure —
  // the client fills those in from the Sanity voyage list.
  const slugs = new Set([
    ...marginRows.map(r => r.voyage_slug),
    ...seasonRows.map(r => r.voyage_slug),
    ...settingsRows.map(r => r.voyage_slug),
    ...travelDates.map(r => r.travel_slug).filter(Boolean),
  ])

  const yearOf = departureDate => margins.getDepartureYear(departureDate)

  const availableYears = [...new Set([
    currentYear,
    currentYear + 1,
    ...travelDates.map(d => yearOf(d.departure_date)),
  ])].sort((a, b) => a - b)

  const voyages = [...slugs].map((slug) => {
    const settings = settingsBySlug.get(slug)
    const configMode = settings?.config_mode || 'pax_table'
    const seasons = (seasonsBySlug.get(slug) || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

    const rowsForYear = marginRows.filter(r =>
      r.voyage_slug === slug && r.year === targetYear && r.margin_per_traveler !== null,
    )
    const configuredPaxCount = new Set(rowsForYear.map(r => r.pax)).size

    // A season with no row for this year still resolves through the season-less
    // default rows, so this is a warning ("partiel"), not a hard failure.
    const seasonsMissing = seasons
      .filter(s => !rowsForYear.some(r => r.season_id === s.id))
      .map(s => s.label)

    const datesForYear = travelDates.filter(d =>
      d.travel_slug === slug && yearOf(d.departure_date) === targetYear,
    )
    const datesWithOverride = datesForYear.filter(d => d.margin_override_per_traveler !== null).length

    let status
    let statusDetail = null

    if (configMode === 'excluded') {
      status = STATUS.EXCLUDED
    }
    else if (configMode === 'per_date') {
      statusDetail = `${datesWithOverride} / ${datesForYear.length} dates`
      if (datesForYear.length > 0 && datesWithOverride === datesForYear.length) status = STATUS.CONFIGURED
      else if (datesWithOverride > 0) status = STATUS.PARTIAL
      else status = STATUS.UNCONFIGURED
    }
    else if (configuredPaxCount === 0) {
      status = STATUS.UNCONFIGURED
    }
    else if (seasonsMissing.length) {
      status = STATUS.PARTIAL
      statusDetail = `saison ${seasonsMissing.join(', ')} non renseignée`
    }
    else {
      status = STATUS.CONFIGURED
      statusDetail = `${configuredPaxCount} paliers pax`
    }

    return {
      voyage_slug: slug,
      config_mode: configMode,
      child_margin_delta: settings?.child_margin_delta ?? null,
      season_count: seasons.length,
      season_labels: seasons.map(s => s.label),
      seasons_missing: seasonsMissing,
      configured_pax_count: configuredPaxCount,
      dates_total: datesForYear.length,
      dates_with_override: datesWithOverride,
      status,
      status_detail: statusDetail,
    }
  })

  return { year: targetYear, available_years: availableYears, voyages }
})
