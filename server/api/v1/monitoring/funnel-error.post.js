// Client-facing sink for funnel errors. The browser composable posts a
// structured FunnelError here; we enrich it server-side and hand it to the
// reporter. This endpoint must never throw back to the client — a failed report
// must not surface a second error inside the funnel.
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const enriched = {
      ...body,
      source: 'client',
      occurredAt: body?.occurredAt || new Date().toISOString(),
      context: {
        ...(body?.context || {}),
        url: body?.context?.url || getRequestHeader(event, 'referer') || undefined,
      },
    }

    await funnelReporter.reportFunnelError(enriched)
    return { ok: true }
  }
  catch (err) {
    console.warn('[funnel-error sink] failed to process report:', err?.message || err)
    return { ok: false }
  }
})
