import { defineEventHandler, readBody, createError, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
  const t0 = Date.now()
  const lap = label => console.log(`[kickstart] ${label} +${Date.now() - t0}ms`)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'KICKSTART_NO_PARAMS', step: 'details', origin: { field: 'slug|dateId', received: { slug, dateId } }, message: 'slug et dateId requis' })
  }

  const body = await readBody(event)
  const { email, firstname, lastname, phone, isoContact, title, stage, currency, owner } = body

  if (!email || !title) {
    throw funnelReporter.funnelCreateError({ statusCode: 400, code: 'KICKSTART_MISSING_FIELDS', step: 'details', origin: { field: !email ? 'email' : 'title', received: !email ? email ?? null : title ?? null }, message: 'email et title requis' })
  }

  console.log(`[kickstart] START slug=${slug} dateId=${dateId} email=${email}`)

  // 1. Validate travel_date
  const { data: travelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .eq('deleted', false)
    .single()
  if (travelDateError || !travelDate) {
    throw funnelReporter.funnelCreateError({ statusCode: 404, code: 'KICKSTART_DATE_NOT_FOUND', step: 'details', origin: { field: 'dateId', received: dateId }, message: 'Date introuvable pour ce slug' })
  }
  lap('travel_date validated')

  // 2. Upsert contact + create minimal AC deal
  let dealId
  try {
    dealId = await activecampaign.createMinimalDeal({ email, firstname, lastname, phone, isoContact, title, stage, currency, owner })
    lap(`AC deal created dealId=${dealId}`)
  }
  catch (err) {
    console.error('[kickstart] createMinimalDeal failed', err)
    throw funnelReporter.funnelCreateError({ statusCode: 500, code: 'KICKSTART_CREATE_DEAL_FAILED', step: 'details', origin: { endpoint: 'activecampaign.createMinimalDeal' }, message: 'Erreur lors de la création du deal' })
  }

  // 3. Upsert into booked_dates (booked_places=0 — not counted as reserved until payment)
  // Le deal vient d'être créé, donc une collision sur UNIQUE(deal_id) est
  // théoriquement impossible ; passer par le helper rend quand même l'appel
  // immunisé à un retry d'id côté AC et à la course avec le `enrich`
  // fire-and-forget — et ressuscite une éventuelle réservation supprimée au
  // lieu d'échouer sur une contrainte d'unicité, ce que faisait l'INSERT nu.
  const res = await booking.upsertBookedDateForDeal(dealId, dateId, { booked_places: 0 }, {
    user: null,
    allowMove: true,
    resetOnRevive: true,
  })
  if (res.error || !res.row) {
    console.error('[kickstart] Supabase upsert failed', res.error)
    throw funnelReporter.funnelCreateError({ statusCode: 500, code: 'KICKSTART_SUPABASE_INSERT_FAILED', step: 'details', origin: { endpoint: 'booked_dates.upsert' }, message: res.error || 'Upsert booked_dates sans résultat' })
  }
  const bookedDate = res.row
  lap(`booked_dates inserted bookedId=${bookedDate.id}`)

  // 4. Fire-and-forget enrichment — use the request origin so this works in dev and prod
  const internalOrigin = getRequestURL(event).origin
  $fetch(`${internalOrigin}/api/v1/ac/deals/enrich`, {
    method: 'POST',
    body: { dealId, bookedId: bookedDate.id, dateId, ...body },
  }).catch(err => console.error('[kickstart] enrich fire-and-forget failed', err))

  lap('DONE — returning to client')
  return { dealId, bookedId: bookedDate.id }
})
