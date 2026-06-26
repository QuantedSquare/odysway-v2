import axios from 'axios'
import { FunnelErrorSchema } from './types/funnelError'

// Central sink for every checkout-funnel error. Receives a structured
// FunnelError (from the client composable or directly from a server endpoint),
// normalises it, and fans it out to the configured transports.
//
// INVARIANT: reporting must never break the funnel. Every transport runs in its
// own try/catch and `reportFunnelError` never throws.

const config = useRuntimeConfig()
const isDev = config.public.environment !== 'production'

const AC_DEAL_BASE = 'https://odysway90522.activehosted.com/app/deals'

// ---- Helpers ---------------------------------------------------------------

// Turn a Zod error into a precise origin: the exact failing field, what was
// expected and what was received.
const zodToOrigin = (zodError) => {
  const issue = zodError?.issues?.[0]
  if (!issue) return {}
  return {
    field: Array.isArray(issue.path) ? issue.path.join('.') : undefined,
    expected: issue.expected ? String(issue.expected) : issue.message,
    received: issue.received,
  }
}

// Build a human one-liner listing every failing field (used when multiple
// issues exist), e.g. "currency, value".
const zodIssuesSummary = (zodError) => {
  if (!zodError?.issues?.length) return ''
  return zodError.issues
    .map(i => `${(i.path || []).join('.') || '(root)'}: ${i.message}`)
    .join(' | ')
}

const maskEmail = (email) => {
  if (typeof email !== 'string' || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  const head = local.slice(0, 2)
  return `${head}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`
}

const redact = (funnelError) => {
  const clone = JSON.parse(JSON.stringify(funnelError ?? {}))
  if (clone.context?.email) clone.context.email = maskEmail(clone.context.email)
  return clone
}

const truncate = (value, max = 800) => {
  if (value == null) return ''
  const str = typeof value === 'string' ? value : JSON.stringify(value)
  return str.length > max ? `${str.slice(0, max)}…` : str
}

const stringifyReceived = (received) => {
  if (received === undefined) return undefined
  if (received === null) return 'null'
  return typeof received === 'object' ? truncate(received, 300) : String(received)
}

// ---- Slack Block Kit formatting -------------------------------------------

const severityEmoji = {
  fatal: ':rotating_light:',
  error: ':red_circle:',
  warning: ':warning:',
}

const formatBlockKit = (funnelError) => {
  const { code, step, origin = {}, message, context = {}, severity = 'error', raw } = funnelError
  const emoji = severityEmoji[severity] || ':red_circle:'

  const lines = []
  lines.push(`${emoji} *Erreur funnel* — \`${code}\``)
  lines.push(`*Étape:* ${step}  ·  *Sévérité:* ${severity}`)

  // PRECISE origin — always names the culpable field when known.
  const originParts = []
  if (origin.field) originParts.push(`champ \`${origin.field}\``)
  if (origin.received !== undefined) originParts.push(`reçu \`${stringifyReceived(origin.received)}\``)
  if (origin.expected) originParts.push(`attendu \`${origin.expected}\``)
  if (origin.endpoint) originParts.push(`endpoint \`${origin.endpoint}\``)
  if (origin.statusCode) originParts.push(`status \`${origin.statusCode}\``)
  lines.push(`*Origine:* ${originParts.length ? originParts.join(' · ') : '—'}`)

  if (message) lines.push(`*Détail:* ${message}`)

  // URL of origin + deal link are first-class lines (explicit user requirement).
  lines.push(`*URL:* ${context.url || '—'}`)
  lines.push(context.dealId
    ? `*Deal:* <${AC_DEAL_BASE}/${context.dealId}|${context.dealId}>`
    : '*Deal:* —')

  const ctxParts = []
  if (context.bookedId) ctxParts.push(`bookedId \`${context.bookedId}\``)
  if (context.email) ctxParts.push(`email \`${context.email}\``)
  if (context.voyageSlug) ctxParts.push(`voyage \`${context.voyageSlug}\``)
  if (context.dateId) ctxParts.push(`dateId \`${context.dateId}\``)
  if (ctxParts.length) lines.push(`*Contexte:* ${ctxParts.join(' · ')}`)

  const rawText = raw?.message || raw?.data
  if (rawText) lines.push(`*Raw:* ${truncate(rawText)}`)

  return {
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines.join('\n') },
      },
    ],
  }
}

// ---- Transports ------------------------------------------------------------

const consoleTransport = (funnelError) => {
  console.error('[funnel-error]', JSON.stringify(funnelError))
}

// Sends to a dedicated Slack channel. No-op until SLACK_URL_FUNNEL_ERRORS is
// set, so the feature is safely inert until the webhook is configured.
const slackTransport = async (funnelError) => {
  const url = process.env.SLACK_URL_FUNNEL_ERRORS
  if (!url) return
  await axios({
    url,
    method: 'post',
    data: formatBlockKit(funnelError),
  })
}

const transports = [consoleTransport, slackTransport]

// ---- Public API ------------------------------------------------------------

// Build an H3 error that carries a precise, structured funnel origin in `data`.
// The funnel client reads `err.data` to produce a single Slack report enriched
// with its own context (URL, dealId). Because the error is tagged with a
// `code`, the Nitro backstop hook knows it's already instrumented and skips it.
const funnelCreateError = ({ statusCode = 400, code, step = 'unknown', origin = {}, message }) => {
  return createError({
    statusCode,
    statusMessage: message,
    message,
    data: { funnel: true, code, step, origin, statusCode },
  })
}

const reportFunnelError = async (input) => {
  let funnelError
  const parsed = FunnelErrorSchema.safeParse(input)
  if (parsed.success) {
    funnelError = parsed.data
  }
  else {
    // Never drop a report just because it drifted from the schema.
    funnelError = {
      code: 'MALFORMED_REPORT',
      step: 'unknown',
      origin: zodToOrigin(parsed.error),
      message: `Malformed funnel error report: ${zodIssuesSummary(parsed.error)}`,
      context: {},
      severity: 'warning',
      raw: { data: truncate(input, 1000) },
      source: input?.source === 'server' ? 'server' : 'client',
    }
  }

  if (!funnelError.occurredAt) funnelError.occurredAt = new Date().toISOString()

  const redacted = redact(funnelError)
  await Promise.all(transports.map(async (transport) => {
    try {
      await transport(redacted)
    }
    catch (transportErr) {
      console.warn('[funnel-error] transport failed:', transportErr?.message || transportErr)
    }
  }))

  return funnelError
}

export default {
  reportFunnelError,
  funnelCreateError,
  zodToOrigin,
  zodIssuesSummary,
  formatBlockKit,
  isDev,
}
