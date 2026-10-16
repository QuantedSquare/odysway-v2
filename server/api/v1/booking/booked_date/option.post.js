import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.id) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'OPTION_NO_ID', step: 'option_booking', origin: { field: 'id', received: null }, message: 'id requis' })
  }
  if (body.booked_places === undefined || body.booked_places === null) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'OPTION_NO_BOOKED_PLACES', step: 'option_booking', origin: { field: 'booked_places', received: body.booked_places ?? null }, message: 'booked_places requis' })
  }

  // Check if the date is already booked
  const { data: bookedDate, error: bookedDateError } = await supabase
    .from('booked_dates')
    .select('is_option, travel_date_id, deal_id, transaction_id')
    .eq('id', body.id)
    .eq('deleted', false)
    .single()
  if (bookedDateError || !bookedDate) {
    throw funnelReporter.funnelCreateError({ statusCode: 404, code: 'OPTION_BOOKED_DATE_NOT_FOUND', step: 'option_booking', origin: { field: 'id', received: body.id }, message: bookedDateError?.message || 'Réservation introuvable' })
  }
  if (bookedDate.is_option) {
    // Expected business case (already-optioned) — tagged so the backstop hook
    // skips it; the client handles this message explicitly.
    throw createError({ statusCode: 409, statusMessage: 'La date est déjà réservée', data: { code: 'OPTION_ALREADY_PLACED' } })
  }
  // Une option sur une réservation déjà réglée la faisait passer pour un
  // simple blocage de place, au nom de la personne qui la posait (deal 16997,
  // 12/10/2026). Si AC ne répond pas, la reprise a déjà été contrôlée en amont
  // (étape « Coordonnées ») : on ne bloque pas l'option pour autant.
  let dejaReglee = !!bookedDate.transaction_id
  if (!dejaReglee && bookedDate.deal_id) {
    dejaReglee = await titulaireReservation.reglee({ dealId: bookedDate.deal_id }).catch((err) => {
      console.error(`[option] règlement du deal ${bookedDate.deal_id} illisible:`, err?.message)
      return false
    })
  }
  if (dejaReglee) {
    throw funnelReporter.funnelCreateError({
      statusCode: 409,
      code: 'OPTION_RESERVATION_REGLEE',
      step: 'option_booking',
      origin: { field: 'id', received: body.id },
      message: 'Option refusée : cette réservation est déjà réglée',
    })
  }
  else {
    // Convert badges from string to array if needed

    // put an option 7 days after now
    const { data, error } = await supabase
      .from('booked_dates')
      .update({ is_option: true, expiracy_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), booked_places: body.booked_places })
      .eq('id', body.id)
      .select('*')
      .single()

    // Update travel_dates.booked_seat — via le helper, seul endroit qui filtre
    // les réservations supprimées.
    const recomputeRes = await booking.recomputeBookedSeatAndStatus(bookedDate.travel_date_id)
    if (recomputeRes?.error) throw createError({ statusCode: 500, statusMessage: recomputeRes.error })

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    // Route publique : une option posée depuis le back-office (Ulysse, par son
    // jeton) est journalisée sur la date, avec son auteur.
    const crmUser = getUlysseServiceUser(event) ?? getBookingUserOrNull(event)
    if (crmUser) {
      await logDateActivity(bookedDate.travel_date_id, crmUser, 'option_placed', {
        booked_id: body.id, booked_places: body.booked_places, expiracy_date: data?.expiracy_date ?? null,
      })
    }
    return data
  }
})
