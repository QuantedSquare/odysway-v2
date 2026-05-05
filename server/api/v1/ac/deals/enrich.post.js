import { defineEventHandler, readBody } from 'h3'

// Background enrichment triggered fire-and-forget by the kickstart endpoint.
// Performs all heavy AC/Brevo operations that don't need to block the user.
export default defineEventHandler(async (event) => {
  const t0 = Date.now()
  const lap = label => console.log(`[enrich] ${label} +${Date.now() - t0}ms`)
  const config = useRuntimeConfig()
  const origin = config.public.siteURL

  const { dealId, bookedId, dateId, ...fullPayload } = await readBody(event)
  const slug = fullPayload.slug

  if (!dealId || !bookedId) {
    console.error('[enrich] Missing dealId or bookedId')
    return { ok: false }
  }

  console.log(`[enrich] START dealId=${dealId} bookedId=${bookedId}`)

  // 1. Update AC deal with all custom fields (also re-upserts contact + recalculates values)
  try {
    await activecampaign.updateDeal(dealId, fullPayload)
    lap('updateDeal (full fields + recalculate)')
  }
  catch (err) {
    console.error('[enrich] updateDeal failed', err.message)
  }

  // 2. Brevo contact sync
  try {
    const brevoData = {
      email: fullPayload.email,
      firstName: fullPayload.firstname,
      lastName: fullPayload.lastname,
      listIds: [12],
    }
    if (fullPayload.optinNewsletter) brevoData.listIds.push(18)
    await brevo.updateContact(fullPayload.email, brevoData)
    lap('brevo.updateContact')
  }
  catch (err) {
    console.error('[enrich] brevo.updateContact failed', err.message)
  }

  // 3. Slack notification (fire-and-forget internally)
  try {
    const formatedDeal = activecampaign.transformDealForAPI(fullPayload)
    const slackData = {
      ...formatedDeal,
      firstname: fullPayload.firstname,
      lastname: fullPayload.lastname,
      email: fullPayload.email,
      phone: fullPayload.phone,
    }
    activecampaign.sendSlackNotification(dealId, slackData)
    lap('sendSlackNotification fired')
  }
  catch (err) {
    console.error('[enrich] sendSlackNotification failed', err.message)
  }

  // 4. Aggregate seat count and update travel_dates status
  try {
    const { data: allBooked } = await supabase
      .from('booked_dates')
      .select('booked_places')
      .eq('travel_date_id', dateId)
    const totalBooked = (allBooked || []).reduce((acc, row) => acc + (row.booked_places || 0), 0)
    await booking.updateTravelDate(dateId, totalBooked)
    lap('updateTravelDate')
  }
  catch (err) {
    console.error('[enrich] updateTravelDate failed', err.message)
  }

  // 5. Update deal with generated links
  try {
    const paiementLink = `${origin}/checkout?type=balance&booked_id=${bookedId}`
    const linkBms = `${origin}/booking-management/${slug}/${dateId}`
    await activecampaign.updateDeal(dealId, { linkBms, paiementLink })
    lap('updateDeal (links)')
  }
  catch (err) {
    console.error('[enrich] updateDeal links failed', err.message)
  }

  lap('DONE')
  return { ok: true }
})
