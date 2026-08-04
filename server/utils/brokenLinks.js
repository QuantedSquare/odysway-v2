import { createError } from 'h3'
import supabase from './supabase'
import activecampaign from './activecampaign'
import booking from './booking'
import departures from './departures'
import paymentLink from './paymentLink'
import { logDateActivity } from './activityLog'

// Réparation des liens de paiement orphelins.
//
// Un « lien cassé » = un deal ActiveCampaign qui n'a plus aucune ligne dans
// `booked_dates`. Le client qui clique sur le lien reçu par mail tombe sur la
// carte d'erreur du checkout, alors que son dossier est intact côté CRM.
//
// Cinq chemins suppriment la ligne aujourd'hui : suppression manuelle BMS,
// passage du deal en Corbeille, passage en Perdu/Supprimé, suppression du deal
// dans AC, et la purge silencieuse des résas sans email au chargement d'une
// page date. Un seul laisse une trace (`date_activity_log`) — d'où l'ordre de
// résolution ci-dessous, du plus fiable au plus heuristique.
//
// Utilisé par deux appelants :
//   - le checkout (server/api/v1/ac/deals/deal-from-bms.get.js) : réparation
//     automatique quand la résolution est certaine, le client ne voit rien ;
//   - le BMS (/booking-management/broken-links) : réparation à la main, y
//     compris pour les cas ambigus.

const DAY_MS = 24 * 60 * 60 * 1000
const NEAR_MATCH_DAYS = 2
const PAGE_SIZE = 1000

// Sources de résolution, de la plus fiable à la plus incertaine.
export const RESOLUTION_SOURCES = {
  ACTIVITY_LOG: 'activity_log', // trace exacte de la suppression
  EXACT_DATE: 'exact_date', // slug + date de départ identiques
  NEAR_DATE: 'near_date', // slug + date à ±2 jours
  AMBIGUOUS: 'ambiguous', // plusieurs candidates, choix humain requis
  NONE: 'none', // aucune date trouvée
}

// Seules ces sources sont assez sûres pour réparer sans intervention humaine.
const AUTO_REPAIRABLE = [RESOLUTION_SOURCES.ACTIVITY_LOG, RESOLUTION_SOURCES.EXACT_DATE]

const toDateOnly = (value) => {
  if (!value) return null
  const str = String(value)
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  const date = new Date(str)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

// PostgREST plafonne à 1000 lignes par requête : sans pagination la liste des
// liens cassés serait silencieusement tronquée (et donc fausse).
const fetchAllRows = async (table, select, applyFilters = q => q) => {
  const rows = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const query = applyFilters(supabase.from(table).select(select))
      .range(offset, offset + PAGE_SIZE - 1)
    const { data, error } = await query
    if (error) {
      console.error(`[brokenLinks] fetchAllRows ${table} failed`, error)
      return { rows, error: error.message }
    }
    rows.push(...(data || []))
    if (!data || data.length < PAGE_SIZE) break
  }
  return { rows, error: null }
}

/**
 * Retrouve le deal auquel appartenait un booked_id mort, via le journal
 * d'activité du BMS. Seules les suppressions manuelles y laissent une trace,
 * mais c'est la seule source exacte dont on dispose a posteriori.
 *
 * @param {string} bookedId
 * @returns {Promise<{ dealId: number, travelDateId: string, deletedBy: string, deletedAt: string }|null>}
 */
const findDealByDeadBookedId = async (bookedId) => {
  const { data, error } = await supabase
    .from('date_activity_log')
    .select('travel_date_id, editor_email, created_at, changes')
    .eq('action', 'deal_removed')
    .filter('changes->>booked_id', 'eq', String(bookedId))
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[brokenLinks] findDealByDeadBookedId failed', error)
    return null
  }
  const entry = data?.[0]
  if (!entry?.changes?.deal_id) return null

  return {
    dealId: Number(entry.changes.deal_id),
    travelDateId: entry.travel_date_id,
    deletedBy: entry.editor_email,
    deletedAt: entry.created_at,
  }
}

const findTravelDateInActivityLog = async (dealId) => {
  const { data, error } = await supabase
    .from('date_activity_log')
    .select('travel_date_id, editor_email, created_at')
    .eq('action', 'deal_removed')
    .filter('changes->>deal_id', 'eq', String(dealId))
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[brokenLinks] findTravelDateInActivityLog failed', error)
    return null
  }
  return data?.[0] || null
}

/**
 * Charge en une fois ce que la résolution consulte ligne par ligne.
 *
 * Sans ça, lister quelques centaines de liens cassés déclenche deux requêtes
 * par deal (journal d'activité + dates du voyage) et le endpoint met des
 * minutes. Ici : deux requêtes au total, la résolution devient locale.
 */
const buildResolutionContext = async () => {
  const [{ rows: logRows }, { rows: dateRows }] = await Promise.all([
    fetchAllRows(
      'date_activity_log',
      'travel_date_id, editor_email, created_at, changes',
      q => q.eq('action', 'deal_removed').order('created_at', { ascending: false }),
    ),
    fetchAllRows(
      'travel_dates',
      'id, travel_slug, departure_date, return_date, max_travelers, booked_seat, deleted, published',
      q => q.eq('deleted', false),
    ),
  ])

  // Les lignes arrivent triées du plus récent au plus ancien : le premier
  // enregistrement d'un deal est donc sa suppression la plus récente.
  const logByDeal = new Map()
  for (const row of logRows) {
    const dealId = row.changes?.deal_id
    if (dealId && !logByDeal.has(String(dealId))) logByDeal.set(String(dealId), row)
  }

  const datesById = new Map()
  const datesBySlug = new Map()
  for (const date of dateRows) {
    datesById.set(date.id, date)
    if (!datesBySlug.has(date.travel_slug)) datesBySlug.set(date.travel_slug, [])
    datesBySlug.get(date.travel_slug).push(date)
  }

  return { logByDeal, datesById, datesBySlug }
}

/**
 * Détermine sur quelle travel_date replacer un deal orphelin.
 *
 * @param {number|string} dealId
 * @param {object} deal       { slug, departureDate } — AC ou miroir Supabase
 * @param {object} [context]  résultat de buildResolutionContext(), pour éviter
 *                            les requêtes par ligne lors d'un listing
 * @returns {Promise<{ travelDateId: string|null, source: string, autoRepairable: boolean, candidates: object[], deletedBy?: string, deletedAt?: string }>}
 */
const resolveTravelDate = async (dealId, deal = {}, context = null) => {
  const slug = deal.slug || null
  const departureDate = toDateOnly(deal.departureDate || deal.departure_date)

  // 1. Trace exacte de la suppression.
  const logEntry = context
    ? context.logByDeal.get(String(dealId)) || null
    : await findTravelDateInActivityLog(dealId)

  if (logEntry?.travel_date_id) {
    let date = null
    if (context) {
      date = context.datesById.get(logEntry.travel_date_id) || null
    }
    else {
      const { data } = await supabase
        .from('travel_dates')
        .select('id, travel_slug, departure_date, return_date, deleted')
        .eq('id', logEntry.travel_date_id)
        .maybeSingle()
      date = data && !data.deleted ? data : null
    }

    if (date) {
      return {
        travelDateId: date.id,
        source: RESOLUTION_SOURCES.ACTIVITY_LOG,
        autoRepairable: true,
        candidates: [date],
        deletedBy: logEntry.editor_email,
        deletedAt: logEntry.created_at,
      }
    }
  }

  if (!slug || !departureDate) {
    return { travelDateId: null, source: RESOLUTION_SOURCES.NONE, autoRepairable: false, candidates: [] }
  }

  // 2 & 3. Rapprochement par voyage + date de départ.
  const dates = context
    ? (context.datesBySlug.get(slug) || [])
    : (await fetchAllRows(
        'travel_dates',
        'id, travel_slug, departure_date, return_date, max_travelers, booked_seat, deleted, published',
        q => q.eq('travel_slug', slug).eq('deleted', false),
      )).rows

  const exact = dates.filter(d => toDateOnly(d.departure_date) === departureDate)
  if (exact.length === 1) {
    return { travelDateId: exact[0].id, source: RESOLUTION_SOURCES.EXACT_DATE, autoRepairable: true, candidates: exact }
  }
  if (exact.length > 1) {
    return { travelDateId: null, source: RESOLUTION_SOURCES.AMBIGUOUS, autoRepairable: false, candidates: exact }
  }

  const target = new Date(departureDate).getTime()
  const near = dates
    .filter(d => Math.abs(new Date(toDateOnly(d.departure_date)).getTime() - target) <= NEAR_MATCH_DAYS * DAY_MS)
    .sort((a, b) =>
      Math.abs(new Date(toDateOnly(a.departure_date)).getTime() - target)
      - Math.abs(new Date(toDateOnly(b.departure_date)).getTime() - target))

  if (near.length === 1) {
    return { travelDateId: near[0].id, source: RESOLUTION_SOURCES.NEAR_DATE, autoRepairable: false, candidates: near }
  }
  if (near.length > 1) {
    return { travelDateId: null, source: RESOLUTION_SOURCES.AMBIGUOUS, autoRepairable: false, candidates: near }
  }

  return { travelDateId: null, source: RESOLUTION_SOURCES.NONE, autoRepairable: false, candidates: [] }
}

/**
 * Charge le deal AC dans la forme dont la réparation a besoin.
 * @param {number|string} dealId
 */
const getDealSnapshot = async (dealId) => {
  const [fetched, customFields] = await Promise.all([
    activecampaign.getDealById(dealId),
    activecampaign.getDealCustomFields(dealId),
  ])
  if (!fetched?.deal) return null
  return { ...fetched.deal, ...customFields }
}

/**
 * Recrée la ligne booked_dates manquante et remet le deal AC en état.
 *
 * Idempotent : si une ligne existe déjà pour ce deal, elle est renvoyée telle
 * quelle (la contrainte UNIQUE(deal_id) garantit qu'il n'y en a qu'une).
 *
 * @param {object}  params
 * @param {number}  params.dealId
 * @param {string}  params.travelDateId
 * @param {object}  [params.deal]    snapshot AC déjà chargé (évite un aller-retour)
 * @param {object}  [params.user]    utilisateur BMS pour la piste d'audit
 * @param {string}  [params.reason]  'checkout_auto' | 'bms_manual'
 * @returns {Promise<{ bookedDate: object, created: boolean, paiementLink: string }>}
 */
const repairDealLink = async ({ dealId, travelDateId, deal = null, user = null, reason = 'bms_manual' }) => {
  const config = useRuntimeConfig()
  const origin = config.public.siteURL

  const { data: existing } = await supabase
    .from('booked_dates')
    .select('*')
    .eq('deal_id', dealId)
    .maybeSingle()

  if (existing) {
    return { bookedDate: existing, created: false, paiementLink: paymentLink.buildCheckoutUrl(origin, dealId) }
  }

  const { data: travelDate, error: dateError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug, deleted')
    .eq('id', travelDateId)
    .maybeSingle()

  if (dateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Date de départ introuvable.' })
  }
  if (travelDate.deleted) {
    throw createError({ statusCode: 409, statusMessage: 'Cette date de départ a été supprimée.' })
  }

  const dealSnapshot = deal || await getDealSnapshot(dealId)
  if (!dealSnapshot) {
    throw createError({ statusCode: 404, statusMessage: 'Deal introuvable dans ActiveCampaign.' })
  }

  const nbTravelers = Number(dealSnapshot.nbTravelers) || 0
  const alreadyPaid = Number(dealSnapshot.alreadyPaid) || 0

  // Même règle que assign-deal : un dossier non payé ne consomme pas de place,
  // sinon une réparation en masse ferait basculer des dates en complet.
  const bookedPlaceCount = alreadyPaid > 0 ? nbTravelers : 0

  const { data: bookedDate, error: insertError } = await supabase
    .from('booked_dates')
    .insert([{
      travel_date_id: travelDateId,
      deal_id: dealId,
      booked_places: bookedPlaceCount,
    }])
    .select('*')
    .single()

  if (insertError) {
    console.error('[brokenLinks] insert failed', insertError)
    throw createError({ statusCode: 500, statusMessage: `Recréation impossible : ${insertError.message}` })
  }

  const recompute = await booking.recomputeBookedSeatAndStatus(travelDateId)
  if (recompute?.error) console.error('[brokenLinks] recompute failed', recompute.error)

  // Le dossier était déjà payé : il doit réapparaître sur le départ (pipeline 4).
  if (bookedPlaceCount > 0) {
    try {
      await departures.handlePaymentForDeparture(bookedDate, dealSnapshot.title, dealSnapshot.contact)
    }
    catch (err) {
      console.error('[brokenLinks] handlePaymentForDeparture failed', err.message)
    }
  }

  // Le lien réécrit dans AC est la version signée : il ne pourra plus mourir.
  const newPaymentLink = paymentLink.buildCheckoutUrl(origin, dealId, alreadyPaid > 0 ? 'balance' : 'deposit')
  try {
    await activecampaign.updateDeal(dealId, {
      slug: travelDate.travel_slug,
      linkBms: `${origin}/booking-management/${travelDate.travel_slug}/${travelDateId}`,
      paiementLink: newPaymentLink,
    })
  }
  catch (err) {
    console.error('[brokenLinks] updateDeal failed', err.message)
  }

  await logDateActivity(travelDateId, user, 'link_repaired', {
    deal_id: Number(dealId),
    booked_id: bookedDate.id,
    booked_places: bookedPlaceCount,
    reason,
  })

  console.log(`[brokenLinks] repaired dealId=${dealId} bookedId=${bookedDate.id} date=${travelDateId} reason=${reason}`)
  return { bookedDate, created: true, paiementLink: newPaymentLink }
}

/**
 * Liste les deals sans ligne booked_dates, avec la date proposée pour chacun.
 *
 * @param {object}  [options]
 * @param {boolean} [options.futureOnly=true] ne garder que les départs à venir
 * @param {boolean} [options.verifyAc=false]  lire le lien de paiement stocké dans AC
 * @param {number}  [options.verifyLimit=40]  plafond d'appels AC
 */
const listBrokenLinks = async ({ futureOnly = true, verifyAc = false, verifyLimit = 40 } = {}) => {
  const { rows: bookedRows } = await fetchAllRows('booked_dates', 'deal_id')
  const bookedDealIds = new Set(bookedRows.map(r => Number(r.deal_id)))

  const today = new Date().toISOString().slice(0, 10)
  const { rows: deals, error } = await fetchAllRows(
    'activecampaign_deals',
    'id, title, slug, status, stage, pipeline_id, pipeline_title, seller, contact, departure_date, return_date, total_value, total_paid, rest_to_pay, nb_traveler, created_at',
    (q) => {
      const filtered = q.in('pipeline_id', [1, 2]).neq('status', 'Supprimé')
      return futureOnly ? filtered.gte('departure_date', today) : filtered
    },
  )
  if (error) throw createError({ statusCode: 500, statusMessage: error })

  const orphans = deals.filter(d => !bookedDealIds.has(Number(d.id)))

  const context = await buildResolutionContext()
  const rows = []
  for (const deal of orphans) {
    const resolution = await resolveTravelDate(deal.id, deal, context)
    rows.push({
      dealId: Number(deal.id),
      title: deal.title,
      slug: deal.slug,
      status: deal.status,
      stage: deal.stage,
      pipelineId: deal.pipeline_id,
      pipelineTitle: deal.pipeline_title,
      seller: deal.seller,
      contactId: deal.contact,
      departureDate: toDateOnly(deal.departure_date),
      totalValue: Number(deal.total_value) || 0,
      totalPaid: Number(deal.total_paid) || 0,
      restToPay: Number(deal.rest_to_pay) || 0,
      nbTravelers: Number(deal.nb_traveler) || 0,
      resolution: {
        travelDateId: resolution.travelDateId,
        source: resolution.source,
        autoRepairable: resolution.autoRepairable,
        deletedBy: resolution.deletedBy || null,
        deletedAt: resolution.deletedAt || null,
        candidates: resolution.candidates.map(c => ({
          id: c.id,
          departureDate: toDateOnly(c.departure_date),
          returnDate: toDateOnly(c.return_date),
        })),
      },
      // Un dossier déjà payé est bloqué sur son solde : c'est de l'argent qui
      // n'entre pas. Les autres sont juste des liens morts.
      priority: Number(deal.total_paid) > 0 ? 'critical' : (deal.status === 'Ouvert' ? 'high' : 'low'),
      acPaymentLink: null,
    })
  }

  rows.sort((a, b) => {
    const rank = { critical: 0, high: 1, low: 2 }
    if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority]
    return b.restToPay - a.restToPay
  })

  // Lecture du champ 21 dans AC : confirme qu'un lien mort circule vraiment.
  // Coûteux (un appel par deal), donc borné et désactivé par défaut.
  if (verifyAc) {
    for (const row of rows.slice(0, verifyLimit)) {
      try {
        const fields = await activecampaign.getDealCustomFields(row.dealId)
        row.acPaymentLink = fields?.paiementLink || null
      }
      catch (err) {
        console.error(`[brokenLinks] verifyAc failed dealId=${row.dealId}`, err.message)
      }
    }
  }

  return {
    total: rows.length,
    counts: {
      critical: rows.filter(r => r.priority === 'critical').length,
      high: rows.filter(r => r.priority === 'high').length,
      autoRepairable: rows.filter(r => r.resolution.autoRepairable).length,
      unresolved: rows.filter(r => !r.resolution.travelDateId).length,
    },
    // Volontairement limité aux dossiers déjà payés : leur solde est de
    // l'argent réellement bloqué. Additionner le reste à payer des prospects
    // qui n'ont jamais rien versé gonflerait le chiffre sans rien vouloir dire.
    moneyAtStake: rows.filter(r => r.priority === 'critical').reduce((acc, r) => acc + r.restToPay, 0),
    rows,
  }
}

export default {
  RESOLUTION_SOURCES,
  AUTO_REPAIRABLE,
  findDealByDeadBookedId,
  resolveTravelDate,
  getDealSnapshot,
  repairDealLink,
  listBrokenLinks,
}
