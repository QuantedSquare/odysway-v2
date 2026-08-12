import { defineEventHandler, readBody, createError } from 'h3'

// When Assigning an activecampaign deal to a booked_date, we need to update the deal with the paiementLink, slug and redirection to date in the bms.
// Also update the booked_dates table with the booked_places, is_option and expiracy_date. depending if it's an option or not.

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const config = useRuntimeConfig()
  const bookingUser = getBookingUserOrNull(event)
  console.log('=====BookingUser=====', bookingUser)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'ASSIGN_NO_PARAMS', step: 'details', origin: { field: 'slug|dateId', received: { slug, dateId } }, message: 'slug et dateId requis' })
  }
  const { dealId, booked_places, is_option, expiracy_date, nbTravelers: bodyNbTravelers, alreadyPaid: bodyAlreadyPaid } = await readBody(event)
  if (!dealId) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'ASSIGN_NO_DEALID', step: 'details', origin: { field: 'dealId', received: null }, message: 'dealId requis' })
  }
  const origin = config.public.siteURL
  const skipAcFetch = typeof bodyNbTravelers === 'number' && typeof bodyAlreadyPaid === 'number'
  console.log(`[assign-deal] START dealId=${dealId} dateId=${dateId} slug=${slug} skipAcFetch=${skipAcFetch}`)

  // Ensure the date exists and matches slug (avoid acting on wrong resource)
  const { data: travelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .eq('deleted', false)
    .single()
  if (travelDateError || !travelDate) {
    throw funnelReporter.funnelCreateError({ statusCode: 404, code: 'ASSIGN_DATE_NOT_FOUND', step: 'details', origin: { field: 'dateId', received: dateId, endpoint: `/booking/${slug}/date/${dateId}/assign-deal` }, message: 'Date introuvable pour ce slug' })
  }

  // When client provides nbTravelers/alreadyPaid, skip the AC fetch (~300-400ms saved)
  let deal = null
  let nbTravelers, alreadyPaid

  if (skipAcFetch) {
    nbTravelers = bodyNbTravelers
    alreadyPaid = bodyAlreadyPaid
  }
  else {
    // Fallback: fetch from AC (BMS / manual assignment flow)
    const acFetchStart = Date.now()
    try {
      const [fetchedDeal, customFields] = await Promise.all([
        activecampaign.getDealById(dealId),
        activecampaign.getDealCustomFields(dealId),
      ])
      deal = { ...fetchedDeal.deal, ...customFields }
    }
    catch {
      console.error(`[assign-deal] AC fetch FAILED dealId=${dealId} after ${Date.now() - acFetchStart}ms`)
      throw funnelReporter.funnelCreateError({ statusCode: 502, code: 'ASSIGN_AC_FETCH_FAILED', step: 'details', origin: { field: 'dealId', received: dealId }, message: 'Erreur lors de la récupération du deal AC' })
    }
    if (!deal) throw funnelReporter.funnelCreateError({ statusCode: 404, code: 'ASSIGN_DEAL_NOT_FOUND', step: 'details', origin: { field: 'deal', received: dealId }, message: 'Deal introuvable' })
    nbTravelers = +deal.nbTravelers
    alreadyPaid = +deal.alreadyPaid
    console.log(`[assign-deal] AC fetch done dealId=${dealId} in ${Date.now() - acFetchStart}ms`)
  }

  if (!nbTravelers) throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'ASSIGN_NO_NB_TRAVELERS', step: 'details', origin: { field: 'nbTravelers', received: nbTravelers }, message: 'Le deal ne contient pas nbTravelers' })

  // If user placed an option or already paid, he is counted as a booked traveler, otherwise he is just assigned to the deal temporarily
  const bookedPlaceCount = (alreadyPaid > 0 || is_option === true) ? (booked_places || Number(nbTravelers)) : 0

  // UNIQUE(deal_id) : un deal = une ligne à vie. upsertBookedDateForDeal couvre
  // les 4 cas — création, ré-assignation idempotente sur la même date (les 3
  // retries du funnel), conflit avec une autre date, et résurrection d'une
  // réservation supprimée.
  const assignPatch = {
    booked_places: bookedPlaceCount,
    is_option: is_option === true, // était `is_option || null` : on n'écrit plus de NULL
    expiracy_date: expiracy_date || null,
  }
  let res = await booking.upsertBookedDateForDeal(dealId, dateId, assignPatch, {
    user: bookingUser,
    allowMove: true,
    resetOnRevive: true,
  })

  if (res.conflict === 'other_date') {
    console.warn(`[assign-deal] Duplicate dealId=${dealId} dateId=${dateId} otherDate=${res.row.travel_date_id}`)
    const { data: other } = await supabase
      .from('travel_dates')
      .select('id, travel_slug, deleted')
      .eq('id', res.row.travel_date_id)
      .maybeSingle()

    if (other?.deleted) {
      // La cascade de suppression de l'autre date a laissé cette réservation
      // active : renvoyer l'opérateur vers une date supprimée serait pire que
      // d'autoriser le déplacement. On prend la réservation et on alerte.
      await slack.alertCascadeLeak({ dealId, bookedId: res.row.id, travelDateId: other.id })
      res = await booking.upsertBookedDateForDeal(dealId, dateId, assignPatch, {
        user: bookingUser,
        allowMove: true,
        resetOnRevive: true,
        force: true,
      })
    }
    else {
      throw createError({
        statusCode: 409,
        statusMessage: other ? 'Deal déjà assigné à une autre date' : 'Deal déjà assigné',
        data: other
          ? { code: 'ASSIGN_DUPLICATE_OTHER_DATE', redirectTo: `/booking-management/${other.travel_slug}/${other.id}` }
          : { code: 'ASSIGN_DUPLICATE' },
      })
    }
  }

  if (res.error || !res.row) {
    console.error(`[assign-deal] Supabase upsert FAILED dealId=${dealId}`, res.error)
    throw funnelReporter.funnelCreateError({ statusCode: 500, code: 'ASSIGN_SUPABASE_INSERT_FAILED', step: 'details', origin: { endpoint: 'booked_dates.upsert' }, message: res.error || 'Upsert booked_dates sans résultat' })
  }
  const bookedDate = res.row
  console.log(`[assign-deal] Supabase upsert OK bookedId=${bookedDate.id} dealId=${dealId} `
    + `created=${res.created} revived=${res.revived} moved=${res.moved} in ${Date.now() - startTime}ms`)

  // Update travel_dates.booked_seat — les DEUX dates quand la ligne a bougé.
  const recomputeResults = await booking.recomputeManyBookedSeatAndStatus([dateId, res.previous?.travel_date_id])
  const recomputeErr = recomputeResults.find(r => r?.error)
  if (recomputeErr) throw createError({ statusCode: 500, statusMessage: recomputeErr.error })

  // Si la ligne a quitté une autre date, celle-ci peut ne plus avoir de payant :
  // son deal de départ passe en veille, sans être supprimé.
  if (res.moved && res.previous?.travel_date_id) {
    await departures.cleanupDepartureDealIfEmpty(res.previous.travel_date_id)
  }

  // If the deal has already paid, sync it with the departure record deal (pipeline 4)
  // Conditionné à un vrai changement : sans ça les 3 retries du funnel
  // resynchronisent le deal de départ trois fois.
  const changed = res.created || res.revived || res.moved
    || res.previous?.booked_places !== bookedPlaceCount
  if (bookedPlaceCount > 0 && alreadyPaid > 0 && deal && changed) {
    await departures.handlePaymentForDeparture(bookedDate, deal.title, deal.contact)
  }

  const { data: travel_date, error: slugError } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .single()
  if (slugError || !travel_date) throw createError({ statusCode: 500, statusMessage: slugError?.message || 'Erreur travel_date' })

  const data_to_update = {
    slug: travel_date.travel_slug,
    linkBms: `${origin}/booking-management/${travel_date.travel_slug}/${dateId}`,
  }
  if (is_option) {
    Object.assign(data_to_update, { stage: '27', currentStep: 'A posé une option' })
  }
  Object.assign(data_to_update, { paiementLink: `${origin}/checkout?type=balance&booked_id=${bookedDate.id}` })
  await activecampaign.updateDeal(dealId, data_to_update)

  // On ne journalise que si quelque chose a réellement changé, sinon chaque
  // session du funnel écrit 3 lignes identiques dans date_activity_log.
  if (res.revived) {
    await logDateActivity(dateId, bookingUser, 'deal_restored', {
      deal_id: dealId,
      booked_id: bookedDate.id,
      booked_places: bookedPlaceCount,
      from_travel_date_id: res.previous?.travel_date_id || null,
      previous_reason: res.previous?.deleted_reason || null,
    })
    if (res.moved && res.previous?.travel_date_id) {
      await logDateActivity(res.previous.travel_date_id, bookingUser, 'deal_moved_out', {
        deal_id: dealId, booked_id: bookedDate.id, to_travel_date_id: dateId,
      })
    }
  }
  else if (res.created) {
    await logDateActivity(dateId, bookingUser, 'deal_assigned', { deal_id: dealId, booked_places: bookedPlaceCount })
  }
  else if (res.moved) {
    await logDateActivity(dateId, bookingUser, 'deal_assigned', {
      deal_id: dealId, booked_places: bookedPlaceCount, from_travel_date_id: res.previous?.travel_date_id || null,
    })
    if (res.previous?.travel_date_id) {
      await logDateActivity(res.previous.travel_date_id, bookingUser, 'deal_moved_out', {
        deal_id: dealId, booked_id: bookedDate.id, to_travel_date_id: dateId,
      })
    }
  }

  console.log(`[assign-deal] DONE dealId=${dealId} bookedId=${bookedDate.id} totalTime=${Date.now() - startTime}ms`)
  return bookedDate
})
