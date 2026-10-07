import { createError, defineEventHandler, getHeader } from 'h3'

// Reprend les deals en attente dans ac_deal_sync_queue (server/utils/fileDeals.js).
// Appelé chaque minute par le cron pg_cron `ac-deal-sync`, seulement quand un
// deal est dû :
//   POST /api/v1/ac/file/traiter
//   header  x-cron-secret: <CRON_SECRET>

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const bilan = await fileDeals.vider()
  console.log('[ac/file/traiter] bilan', bilan)
  return bilan
})
