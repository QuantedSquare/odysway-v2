import { defineEventHandler, readBody, createError, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
  const t0 = Date.now()
  const lap = label => console.log(`[kickstart] ${label} +${Date.now() - t0}ms`)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  const body = await readBody(event)
  const { email, firstname, lastname, phone, isoContact, title, stage, currency, owner } = body

  if (!email || !title) {
    throw createError({ statusCode: 400, statusMessage: 'email et title requis' })
  }

  console.log(`[kickstart] START slug=${slug} dateId=${dateId} email=${email}`)

  // 1. Validate travel_date
  const { data: travelDate, error: travelDateError } = await supabase
    .from('travel_dates')
    .select('id, travel_slug')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()
  if (travelDateError || !travelDate) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
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
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la création du deal' })
  }

  // 3. Insert into booked_dates (booked_places=0 — not counted as reserved until payment)
  const { data: bookedDate, error: bookedError } = await supabase
    .from('booked_dates')
    .insert([{ travel_date_id: dateId, deal_id: dealId, booked_places: 0 }])
    .select('*')
    .single()
  if (bookedError) {
    console.error('[kickstart] Supabase insert failed', bookedError.message)
    throw createError({ statusCode: 500, statusMessage: bookedError.message })
  }
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
