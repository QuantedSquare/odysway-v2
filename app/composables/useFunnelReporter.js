// Client-side funnel error reporter. Holds shared funnel context (dealId,
// bookedId, email, slug…) that each step enriches as data becomes known, and
// forwards structured errors to the server sink. Optionally surfaces a
// user-facing snackbar, kept decoupled from the (detailed) internal report.
//
// INVARIANT: reporting must never break the funnel — a failed report only logs.
export function useFunnelReporter() {
  const context = useState('funnelReporter:context', () => ({}))
  const { notifyError } = useSnackbar()

  const setContext = (partial = {}) => {
    const next = { ...context.value }
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined && value !== null && value !== '') next[key] = value
    }
    context.value = next
  }

  const buildPayload = ({ code, step = 'unknown', origin = {}, message = '', severity = 'error', raw }) => ({
    code,
    step,
    origin,
    message,
    severity,
    raw,
    source: 'client',
    occurredAt: new Date().toISOString(),
    context: {
      ...context.value,
      url: import.meta.client ? window.location.href : context.value.url,
    },
  })

  const send = async (payload) => {
    try {
      await apiRequest('/monitoring/funnel-error', 'post', payload)
    }
    catch (err) {
      // Never let a reporting failure cascade into the funnel.
      console.error('[useFunnelReporter] failed to send report', err)
    }
  }

  const report = ({ userMessage, ...rest }) => {
    const payload = buildPayload(rest)
    if (userMessage) notifyError(userMessage)
    // Fire-and-forget — reporting must not block the UI.
    send(payload)
    return payload
  }

  // Flatten a $fetch error (enriched with `__funnel` by apiRequest) into a
  // precise report: endpoint, status code, server statusMessage, stack.
  const reportApiError = (err, { code, step = 'unknown', origin = {}, message, severity = 'error', userMessage } = {}) => {
    const funnelMeta = err?.__funnel || {}
    // The server may attach a precise, structured origin (e.g. the exact Zod
    // field) via funnelCreateError → merge it so the single client report names
    // the culpable field alongside our URL/dealId context.
    const serverFunnel = err?.data?.funnel ? err.data : null
    const serverMessage = err?.data?.statusMessage || err?.data?.message || err?.statusMessage || err?.message
    return report({
      code: code || serverFunnel?.code || 'API_ERROR',
      step: step !== 'unknown' ? step : (serverFunnel?.step || 'unknown'),
      severity,
      userMessage,
      message: message || serverMessage || 'Erreur API',
      origin: {
        endpoint: funnelMeta.endpoint,
        statusCode: funnelMeta.statusCode ?? err?.statusCode,
        ...(serverFunnel?.origin || {}),
        ...origin,
      },
      raw: {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        data: err?.data,
      },
    })
  }

  // Wrap a handler so any throw is reported (with context) then re-thrown.
  const wrapStep = async (step, fn, { code = 'STEP_FAILED', userMessage } = {}) => {
    try {
      return await fn()
    }
    catch (err) {
      reportApiError(err, { code, step, userMessage })
      throw err
    }
  }

  return { context, setContext, report, reportApiError, wrapStep }
}
