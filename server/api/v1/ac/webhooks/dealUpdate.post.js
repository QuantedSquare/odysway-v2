import { createError } from 'h3'

// Webhook AC « deal mis à jour ». Il ne fait qu'enfiler le deal dans
// ac_deal_sync_queue, puis le traiter aussitôt s'il est libre
// (server/utils/fileDeals.js, traitement dans dealUpdateTraitement.js).
//
// Un échec n'est plus renvoyé à AC : le deal reste en file et le cron
// `ac-deal-sync` le reprend. Seule une file injoignable (Supabase en panne)
// rend une erreur.

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: 'Unauthorized' }
  }
  const body = await readBody(event)
  const dealId = body?.['deal[id]']
  const contactId = body?.['deal[contactid]'] || body?.['contact[id]']
  const eventTime = body?.date_time || null
  console.log('[dealUpdate] reçu', { dealId, contactId, eventTime })

  if (!dealId || !contactId) {
    throw createError({
      statusCode: 400,
      message: `Invalid deal data: missing ${dealId ? 'contact' : 'deal'} id`,
    })
  }

  const issue = await fileDeals.enfilerEtTraiter({ dealId, contactId, body, eventTime })
  return { success: true, dealId, issue }
})
