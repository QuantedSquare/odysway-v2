// Belt-and-suspenders backstop: any error thrown on a funnel-relevant route
// that was NOT already instrumented (no structured `data.code` from
// funnelCreateError) is reported as an unexpected server escape. Instrumented
// errors are skipped here because the funnel client reports them with full
// context (URL, dealId, precise field).
const FUNNEL_ROUTE_PREFIXES = [
  '/api/v1/ac',
  '/api/v1/booking',
  '/api/v1/stripe',
  '/api/v1/alma',
  '/api/v1/chapka',
  '/api/v1/insurance',
  '/api/v1/checkout',
]

const isFunnelRoute = (path: string) =>
  FUNNEL_ROUTE_PREFIXES.some(prefix => path.startsWith(prefix))

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error: any, ctx: any) => {
    try {
      const path = ctx?.event?.path || ''
      if (!isFunnelRoute(path)) return
      // Already instrumented (funnelCreateError) → the client reports it.
      if (error?.data?.code) return

      await funnelReporter.reportFunnelError({
        code: 'UNHANDLED_SERVER_ERROR',
        step: 'unknown',
        source: 'server',
        severity: 'fatal',
        origin: { endpoint: path, statusCode: error?.statusCode },
        message: error?.statusMessage || error?.message || 'Unhandled server error',
        raw: { name: error?.name, message: error?.message, stack: error?.stack },
      })
    }
    catch (hookErr: any) {
      console.warn('[funnelErrorHook] failed:', hookErr?.message || hookErr)
    }
  })
})
