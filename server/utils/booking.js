import supabase from './supabase'

const computeTravelDateStatus = ({ booked_seat, min_travelers, max_travelers }) => {
  const booked = Number(booked_seat || 0)
  const min = Number(min_travelers || 0)
  const max = Number(max_travelers || 0)

  if (max > 0 && booked >= max) return 'guaranteed'
  if (min > 0 && booked >= min) return 'confirmed'
  return 'soon_confirmed'
}

const retrieveBooking = async (slug) => {
  const query = supabase.from('travel_dates').select().eq('deleted', false)
  try {
    if (slug) {
      const { error, data } = await query.eq('travel_slug', slug).single()
      if (error) console.error('Supabase upsert error:', error)
      return data
    }
    else {
      const { error, data } = await query
      if (error) console.error('Supabase upsert error:', error)
      return data
    }
  }
  catch (err) {
    console.error('Contact upsert error:', err)
    throw createError({
      statusCode: 400,
      message: 'Error upserting contact',
    })
  }
}

/**
 * Garde partagée des endpoints BMS : la date existe, appartient bien à ce slug,
 * et n'est pas supprimée. Remplace la requête dupliquée dans ~17 handlers.
 *
 * Les endpoints qui ÉCRIVENT passent includeDeleted: false (refuser d'écrire dans
 * un tombstone). Ceux en lecture seule atteignables depuis l'écran de restauration
 * passent includeDeleted: true et rendent en lecture seule via `deleted`.
 */
const requireActiveTravelDate = async (dateId, slug, { includeDeleted = false } = {}) => {
  let query = supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .eq('travel_slug', slug)
  if (!includeDeleted) query = query.eq('deleted', false)
  const { data, error } = await query.maybeSingle()
  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }
  return data
}

const retrieveBookedDates = async (travel_date_id, { includeDeleted = false } = {}) => {
  let query = supabase
    .from('booked_dates')
    .select()
    .eq('travel_date_id', travel_date_id)
  if (!includeDeleted) query = query.eq('deleted', false)
  const { error, data } = await query
  if (error) console.error('Supabase retrieve error:', error)
  return data
}

// Contrat : `null | row`.
//
// Ces deux helpers renvoyaient `{ error: '...' }` en cas d'échec. Comme
// `.single()` remonte une erreur PGRST116 sur zéro ligne, « pas trouvé »
// devenait un objet TRUTHY — d'où le `if (bookedRow)` de dealDelete.post.js
// qui passait systématiquement. `.maybeSingle()` + null règle les deux.
const BOOKED_DATE_COLUMNS
  = 'id, travel_date_id, deal_id, booked_places, is_option, expiracy_date, '
    + 'transaction_id, payment_type, deleted, deleted_at, deleted_by, deleted_reason'

const retrieveBookedDateById = async (bookedId, { includeDeleted = false } = {}) => {
  let query = supabase
    .from('booked_dates')
    .select(BOOKED_DATE_COLUMNS)
    .eq('id', bookedId)
  if (!includeDeleted) query = query.eq('deleted', false)
  const { data, error } = await query.maybeSingle()
  if (error) {
    console.error('Supabase retrieve error:', error)
    return null
  }
  return data
}

const retrieveBookedDateByDealId = async (dealId, { includeDeleted = false } = {}) => {
  let query = supabase
    .from('booked_dates')
    .select(BOOKED_DATE_COLUMNS)
    .eq('deal_id', dealId)
  if (!includeDeleted) query = query.eq('deleted', false)
  const { data, error } = await query.maybeSingle()
  if (error) {
    console.error('Supabase retrieve error:', error)
    return null
  }
  return data
}

// Distingue « supprimée » de « n'a jamais existé » sur le chemin d'erreur des
// endpoints de paiement, pour que l'ops ne cherche pas un booked_id fantôme.
const isBookedDateDeleted = async (bookedId) => {
  if (!bookedId) return false
  const { data } = await supabase
    .from('booked_dates')
    .select('deleted')
    .eq('id', bookedId)
    .maybeSingle()
  return data?.deleted === true
}

// Le chemin argent : booked_seat en découle directement. Pas d'option
// includeDeleted ici volontairement — compter une réservation supprimée gonfle
// booked_seat, bascule la date en 'guaranteed' et arrête la vente publique.
const retrieveBookedPlacesByTravelDateId = async (travel_date_id) => {
  const { error: sumError, data: allBooked } = await supabase
    .from('booked_dates')
    .select('booked_places')
    .eq('travel_date_id', travel_date_id)
    .eq('deleted', false)
  if (sumError) {
    console.error('Supabase sum error:', sumError)
    return { error: sumError.message }
  }
  return allBooked || []
}

const updateTravelDate = async (travel_date_id, totalFromBookings) => {
  // Fetch min/max + co_filling (status is derived from these + booked_seat)
  const { data: row, error: fetchError } = await supabase
    .from('travel_dates')
    .select('id, min_travelers, max_travelers, co_filling')
    .eq('id', travel_date_id)
    .single()

  if (fetchError || !row) {
    console.error('Supabase retrieve error:', fetchError)
    return { error: fetchError?.message || 'travel_dates not found' }
  }

  const totalBooked = totalFromBookings + Number(row.co_filling || 0)

  const nextStatus = computeTravelDateStatus({
    booked_seat: totalBooked,
    min_travelers: row.min_travelers,
    max_travelers: row.max_travelers,
  })

  const { error } = await supabase
    .from('travel_dates')
    .update({ booked_seat: totalBooked, status: nextStatus })
    .eq('id', travel_date_id)

  if (error) {
    console.error('Supabase upsert error:', error)
    return { error: error.message }
  }
  return { id: travel_date_id, booked_seat: totalBooked, status: nextStatus }
}

const recomputeBookedSeatAndStatus = async (travel_date_id) => {
  const allBooked = await retrieveBookedPlacesByTravelDateId(travel_date_id)
  if (allBooked?.error) return { error: allBooked.error }
  const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
  return await updateTravelDate(travel_date_id, totalBooked)
}

const recomputeStatusOnly = async (travel_date_id) => {
  const { data: row, error } = await supabase
    .from('travel_dates')
    .select('id, booked_seat, min_travelers, max_travelers, status')
    .eq('id', travel_date_id)
    .single()
  if (error || !row) return { error: error?.message || 'travel_dates not found' }

  const nextStatus = computeTravelDateStatus(row)
  if (row.status === nextStatus) return { id: travel_date_id, status: row.status, updated: false }

  const { error: updateError } = await supabase
    .from('travel_dates')
    .update({ status: nextStatus })
    .eq('id', travel_date_id)
  if (updateError) return { error: updateError.message }
  return { id: travel_date_id, status: nextStatus, updated: true }
}

// Recalcule plusieurs dates d'un coup. Indispensable après une résurrection qui
// DÉPLACE une réservation : la date d'origine et la date cible doivent toutes
// les deux voir leur booked_seat recalculé.
const recomputeManyBookedSeatAndStatus = (travelDateIds = []) => {
  const ids = [...new Set(travelDateIds.filter(Boolean))]
  return Promise.all(ids.map(id => recomputeBookedSeatAndStatus(id)))
}

// =========================================================================
// Suppression / restauration
// =========================================================================
// `deleteBookedDateByDealId` et `deleteBookedDateById` (DELETE physiques) ont
// été SUPPRIMÉES et non renommées : tout appelant oublié échoue bruyamment au
// lieu de continuer à supprimer en dur en silence.

const softDeleteBookedDateByDealId = (dealId, { user = null, reason, batch = null } = {}) =>
  softDelete.remove('booked_dates', q => q.eq('deal_id', dealId), {
    user, reason, batch, select: 'id, travel_date_id, deal_id, booked_places',
  })

const softDeleteBookedDateById = (bookedId, { user = null, reason, batch = null } = {}) =>
  softDelete.remove('booked_dates', q => q.eq('id', bookedId), {
    user, reason, batch, select: 'id, travel_date_id, deal_id, booked_places',
  })

const restoreBookedDateById = bookedId =>
  softDelete.restore('booked_dates', q => q.eq('id', bookedId), {
    select: 'id, travel_date_id, deal_id, booked_places',
  })

// Colonnes remises à zéro quand on ressuscite une ligne pour une NOUVELLE
// assignation (le patch de l'appelant est appliqué par-dessus).
const REVIVE_RESET = {
  booked_places: 0,
  is_option: false,
  expiracy_date: null,
  transaction_id: null,
  payment_type: null,
}

/**
 * Point d'entrée unique de « mettre ce deal sur cette date ».
 *
 * `booked_dates` porte une contrainte UNIQUE(deal_id) : un deal = UNE ligne
 * physique à vie. Toute écriture est donc en réalité un upsert-avec-résurrection,
 * jamais un second INSERT. C'est ce qui garde le `booked_id` stable, et donc les
 * liens de paiement (`/checkout?booked_id=...`) déjà poussés dans AC valides
 * après une suppression puis une ré-assignation.
 *
 * @param {number|string} dealId
 * @param {string|null}   travelDateId  date cible ; null = « là où elle est déjà »
 *                                      (les webhooks de paiement passent null)
 * @param {object}        patch         colonnes à écrire
 * @param {object}        opts
 * @param {object}  [opts.user]           piste d'audit ({ email: 'stripe-webhook' }…)
 * @param {boolean} [opts.allowMove]      true  → un tombstone posé sur une autre date
 *                                                peut être repointé sur travelDateId
 *                                        false → on conserve son travel_date_id
 * @param {boolean} [opts.resetOnRevive]  true  → REVIVE_RESET avant d'appliquer patch
 * @param {boolean} [opts.force]          true  → accepte de déplacer une ligne ACTIVE
 *                                                posée sur une autre date (sinon conflit)
 *
 * @returns {Promise<{
 *   row: object|null,       ligne booked_dates résultante
 *   previous: object|null,  la ligne AVANT écriture (porte l'ancien travel_date_id
 *                           et l'info de tombstone) — toujours renvoyée
 *   created: boolean,
 *   revived: boolean,
 *   moved: boolean,         travel_date_id a changé
 *   conflict: 'other_date'|null,
 *   error: string|null,
 * }>}
 */
const upsertBookedDateForDeal = async (dealId, travelDateId, patch = {}, opts = {}) => {
  const { user = null, allowMove = false, resetOnRevive = false, force = false } = opts
  const empty = { row: null, previous: null, created: false, revived: false, moved: false, conflict: null, error: null }
  // travelDateId non fourni = « là où la ligne est déjà » (webhooks de paiement).
  const noTarget = travelDateId === null || travelDateId === undefined

  const readExisting = async () => {
    const { data, error } = await supabase
      .from('booked_dates')
      .select('*')
      .eq('deal_id', dealId)
      .maybeSingle()
    if (error) return { error: error.message }
    return { data }
  }

  let existing = await readExisting()
  if (existing.error) return { ...empty, error: existing.error }

  // --- Aucune ligne : INSERT ---------------------------------------------
  if (!existing.data) {
    const { data, error } = await supabase
      .from('booked_dates')
      .insert([{ travel_date_id: travelDateId, deal_id: dealId, deleted: false, ...patch }])
      .select('*')
      .maybeSingle()

    if (!error) return { ...empty, row: data, created: true }

    // 23505 = unique_violation. On teste le CODE et pas le message : le texte
    // dépend de la version de Postgres et de lc_messages. Cas réel : les 3
    // tentatives du funnel (useStepperDeal.js, 700 ms d'écart) qui lisent
    // toutes « pas de ligne » puis insèrent en concurrence.
    if (error.code !== '23505') {
      console.error('[upsertBookedDateForDeal] insert failed', error)
      return { ...empty, error: error.message }
    }
    existing = await readExisting()
    if (existing.error) return { ...empty, error: existing.error }
    if (!existing.data) return { ...empty, error: 'Conflit d\'unicité sans ligne correspondante' }
  }

  const previous = existing.data

  // --- Ligne active ------------------------------------------------------
  if (!previous.deleted) {
    const sameDate = noTarget || previous.travel_date_id === travelDateId
    if (!sameDate && !force) {
      // Aucune écriture : l'appelant décide (409 côté assign-deal).
      return { ...empty, row: previous, previous, conflict: 'other_date' }
    }

    const update = { ...patch }
    if (!sameDate) update.travel_date_id = travelDateId

    const { data, error } = await supabase
      .from('booked_dates')
      .update(update)
      .eq('deal_id', dealId)
      .select('*')
      .maybeSingle()
    if (error) return { ...empty, previous, error: error.message }

    // created/revived à false : c'est le chemin IDEMPOTENT sur lequel
    // atterrissent les retries du funnel, qui recevaient un 409 auparavant.
    return { ...empty, row: data, previous, moved: !sameDate }
  }

  // --- Tombstone : résurrection ------------------------------------------
  const target = allowMove && !noTarget ? travelDateId : previous.travel_date_id
  const update = {
    ...softDelete.clear(),
    travel_date_id: target,
    ...(resetOnRevive ? REVIVE_RESET : {}),
    ...patch,
  }

  const { data, error } = await supabase
    .from('booked_dates')
    .update(update)
    .eq('deal_id', dealId)
    .select('*')
    .maybeSingle()
  if (error) return { ...empty, previous, error: error.message }

  console.log(`[upsertBookedDateForDeal] REVIVE dealId=${dealId} bookedId=${data?.id} `
    + `from=${previous.travel_date_id} to=${target} reason=${previous.deleted_reason} `
    + `by=${user?.email || 'system'}`)

  return {
    ...empty,
    row: data,
    previous,
    revived: true,
    moved: target !== previous.travel_date_id,
  }
}

export default {
  retrieveBooking,
  requireActiveTravelDate,
  retrieveBookedDates,
  retrieveBookedDateByDealId,
  retrieveBookedDateById,
  isBookedDateDeleted,
  retrieveBookedPlacesByTravelDateId,
  updateTravelDate,
  recomputeBookedSeatAndStatus,
  recomputeManyBookedSeatAndStatus,
  recomputeStatusOnly,
  softDeleteBookedDateByDealId,
  softDeleteBookedDateById,
  restoreBookedDateById,
  upsertBookedDateForDeal,
}
