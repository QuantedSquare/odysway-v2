import { defineEventHandler, getQuery } from 'h3'
import dayjs from 'dayjs'

// Poste de pilotage — une ligne par départ, prête à afficher.
//
// L'écran Sales trie ~700 départs en quatre catégories d'action et affiche pour
// chacun ce que rapporterait la prochaine vente. Faire ça côté client
// imposerait un appel par voyage (grille de marge) : on assemble donc tout ici,
// en une poignée de requêtes, et la page ne fait que rendre.
//
// La note d'implémentation signalait que `min_travelers` et le statut
// « garanti » manquaient à l'API margins et avaient dû être reconstitués dans
// la maquette. Ils ne manquent pas : ils vivent dans `travel_dates`, avec
// `co_filling` pour le co-remplissage. C'est cette table qui fait foi ici.
//
// Tous les montants sont en euros (pas en centimes) — comme le reste du module
// margins, et contrairement au reste de la codebase.

// Fenêtre d'échéance : on considère qu'un départ non garanti doit être tranché
// 30 jours avant le départ (annulation, bascule en co-remplissage, relance).
const DECISION_LEAD_DAYS = 30
// Un départ entre dans « À décider » quand cette échéance est à moins d'une
// semaine — ou déjà passée.
const DECISION_ALERT_DAYS = 7

const chunk = (arr, size) => {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { from, to } = getQuery(event)
  const dateFrom = from || dayjs().format('YYYY-MM-DD')
  const dateTo = to || dayjs().add(12, 'month').format('YYYY-MM-DD')

  // 1) Départs de la fenêtre. `min_travelers` / `max_travelers` / `co_filling`
  //    sont les valeurs réelles, jamais les `displayed_*` : le pilotage
  //    raisonne sur l'exploitation, pas sur ce que voit le client.
  const travelDates = await fetchAllPaginated(() =>
    supabase
      .from('travel_dates')
      .select('id, travel_slug, departure_date, return_date, min_travelers, max_travelers, booked_seat, co_filling, margin_override_per_traveler, real_traveler_count_override')
      .eq('deleted', false)
      .eq('is_test', false)
      .gte('departure_date', dateFrom)
      .lte('departure_date', dateTo)
      .order('departure_date', { ascending: true }),
  )

  if (!travelDates.length) {
    return { rows: [], window: { from: dateFrom, to: dateTo } }
  }

  // 2) Réservations payantes sur ces dates.
  const dateIds = travelDates.map(d => d.id)
  const bookingsChunks = await Promise.all(
    chunk(dateIds, 100).map(ids =>
      fetchAllPaginated(() =>
        supabase
          .from('booked_dates')
          .select('travel_date_id, deal_id, booked_places')
          .in('travel_date_id', ids)
          .eq('deleted', false)
          .gt('booked_places', 0),
      ),
    ),
  )
  const bookings = bookingsChunks.flat()

  // 3) Deals convertis (pipeline 2). Comme dans dashboard.get.js : pas de
  //    filtre `.in()` sur des milliers d'ids, la ligne est minuscule.
  const paidDeals = await fetchAllPaginated(() =>
    supabase
      .from('activecampaign_deals')
      .select('id')
      .eq('pipeline_id', 2),
  )
  const paidDealIds = new Set(paidDeals.map(d => Number(d.id)))

  // 4) Configuration de marge, en vrac pour tous les voyages : trois petites
  //    tables, indexées ensuite par slug. Une requête par voyage donnerait ici
  //    plusieurs centaines d'aller-retours.
  const [{ data: marginRows }, { data: seasonRows }, { data: settingsRows }] = await Promise.all([
    supabase
      .from('voyage_margins')
      .select('voyage_slug, pax, margin_per_traveler, year, season_id')
      .eq('deleted', false)
      .not('margin_per_traveler', 'is', null),
    supabase
      .from('voyage_margin_seasons')
      .select('voyage_slug, id, label, start_month, start_day, end_month, end_day, sort_order')
      .eq('deleted', false)
      .order('sort_order', { ascending: true }),
    supabase
      .from('voyage_margin_settings')
      .select('voyage_slug, config_mode'),
  ])

  // slug -> pax -> rows
  const gridBySlug = new Map()
  for (const r of marginRows || []) {
    if (!gridBySlug.has(r.voyage_slug)) gridBySlug.set(r.voyage_slug, new Map())
    const byPax = gridBySlug.get(r.voyage_slug)
    if (!byPax.has(r.pax)) byPax.set(r.pax, [])
    byPax.get(r.pax).push(r)
  }

  const seasonsBySlug = new Map()
  for (const s of seasonRows || []) {
    if (!seasonsBySlug.has(s.voyage_slug)) seasonsBySlug.set(s.voyage_slug, [])
    seasonsBySlug.get(s.voyage_slug).push(s)
  }

  const modeBySlug = new Map((settingsRows || []).map(r => [r.voyage_slug, r.config_mode]))

  // 5) Places payantes par date.
  const realPaxByDate = new Map()
  for (const b of bookings) {
    if (!paidDealIds.has(Number(b.deal_id))) continue
    realPaxByDate.set(b.travel_date_id, (realPaxByDate.get(b.travel_date_id) || 0) + Number(b.booked_places || 0))
  }

  const today = dayjs().startOf('day')

  const rows = travelDates.map((td) => {
    const slug = td.travel_slug
    const mode = modeBySlug.get(slug) || 'pax_table'
    const seasons = seasonsBySlug.get(slug) || []
    const byPax = gridBySlug.get(slug) || new Map()

    const max = Number(td.max_travelers || 0)
    const min = Number(td.min_travelers || 0)
    const partners = Number(td.co_filling || 0)
    const booked = Number(td.booked_seat || 0)

    const realPax = td.real_traveler_count_override != null
      ? Number(td.real_traveler_count_override)
      : (realPaxByDate.get(td.id) || 0)

    // `booked_seat` inclut déjà le co-remplissage (cf. server/utils/booking.js) :
    // le seuil de garantie se lit donc sur lui, pas sur nos seuls inscrits.
    const guaranteed = min > 0 && booked >= min
    // Ce qu'il manque à *nous* pour porter le départ, partenaires exclus. C'est
    // le chiffre qu'un commercial peut faire bouger.
    const missing = min > 0 ? Math.max(0, min - realPax) : 0
    const sellable = max > 0 ? Math.max(0, max - booked) : 0
    const isCoFilling = partners > 0

    const daysToDeparture = dayjs(td.departure_date).startOf('day').diff(today, 'day')
    const daysToDecision = daysToDeparture - DECISION_LEAD_DAYS

    // --- Marge -------------------------------------------------------------
    // Un départ « suivi » est un départ dont on sait chiffrer la prochaine
    // vente. Sans grille exploitable, il n'entre dans aucun onglet d'action et
    // n'apparaît que dans le tableau exhaustif, marqué « non suivi ».
    const marginAt = (pax) => {
      if (pax <= 0) return 0
      if (td.margin_override_per_traveler != null) return Number(td.margin_override_per_traveler) * pax
      if (mode === 'excluded') return null
      const resolved = margins.resolveBaseFromRows({
        rows: byPax.get(pax) || [],
        seasons,
        departureDate: td.departure_date,
      })
      return resolved.value == null ? null : Number(resolved.value) * pax
    }

    const currentTotal = marginAt(realPax)
    // La grille peut être trouée : ce qui compte est de savoir chiffrer le pas
    // suivant, pas d'avoir toute la colonne.
    const nextTotal = sellable >= 1 ? marginAt(realPax + 1) : null
    const configured = mode !== 'excluded'
      && (td.margin_override_per_traveler != null || byPax.size > 0)

    const nextSaleGain = (currentTotal != null && nextTotal != null)
      ? Math.max(0, nextTotal - currentTotal)
      : 0

    // Potentiel restant : ce que rapporterait le remplissage jusqu'à la
    // capacité, à partir de nos inscrits actuels.
    const target = Math.min(max || realPax, realPax + sellable)
    const targetTotal = marginAt(target)
    const remaining = (currentTotal != null && targetTotal != null)
      ? Math.max(0, targetTotal - currentTotal)
      : 0

    // Prochain palier rentable : entre la position actuelle et la cible, le pax
    // dont le saut marginal est le plus gros. La marge d'un siège pair vaut à
    // peu près le double d'un impair (effet chambre double), donc ce palier
    // tombe presque toujours sur un pair — c'est là qu'il faut pousser.
    let step = null
    let stepSales = 0
    let stepGain = 0
    if (currentTotal != null) {
      let prevTotal = currentTotal
      let best = 0
      for (let p = realPax + 1; p <= target; p++) {
        const total = marginAt(p)
        if (total == null) continue
        const jump = total - prevTotal
        if (jump > best) {
          best = jump
          step = p
          stepSales = p - realPax
          stepGain = total - currentTotal
        }
        prevTotal = total
      }
    }

    // --- Segmentation ------------------------------------------------------
    // Ordre de priorité opérationnelle : sécuriser, puis optimiser, puis
    // arbitrer. Un départ n'appartient qu'à un seul onglet d'action.
    let segment
    if (!configured) {
      segment = 'non_suivi'
    }
    else if (!guaranteed && realPax >= 1 && missing === 1) {
      // Se confirme à la prochaine vente : le meilleur euro à aller chercher.
      segment = 'sauver'
    }
    else if (guaranteed && realPax >= 1 && !isCoFilling && sellable >= 1 && remaining > 0) {
      segment = 'maximiser'
    }
    else if (!guaranteed && !isCoFilling && daysToDecision <= DECISION_ALERT_DAYS) {
      segment = 'decider'
    }
    else if (!guaranteed && realPax === 0) {
      segment = 'sans_traction'
    }
    else {
      segment = 'non_garanti'
    }

    return {
      travel_date_id: td.id,
      slug,
      date: td.departure_date,
      days_to_departure: daysToDeparture,
      days_to_decision: daysToDecision,
      min,
      max,
      booked,
      real_pax: realPax,
      partners,
      sellable,
      missing,
      guaranteed,
      co_filling: isCoFilling,
      configured,
      next_sale_gain: nextSaleGain,
      remaining_potential: remaining,
      step,
      step_sales: stepSales,
      step_gain: Math.max(0, stepGain),
      segment,
    }
  })

  return { rows, window: { from: dateFrom, to: dateTo } }
})
