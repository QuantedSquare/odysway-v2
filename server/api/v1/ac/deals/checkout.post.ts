import type { H3Event } from 'h3'

// Deprecated: this aggregated route had an inconsistent date_id contract.
// Use /api/v1/ac/deals + /api/v1/booking/:slug/date/:dateId/assign-deal instead.
export default defineEventHandler(async (_event: H3Event) => {
  throw createError({
    statusCode: 410,
    statusMessage: 'Route depreciee. Utiliser /ac/deals puis /booking/:slug/date/:dateId/assign-deal',
  })
})
