import { z } from 'zod'

// Shared shape for every error reported from the checkout funnel.
// Used both as runtime validation at the sink (`reportFunnelError`) and as the
// single source of truth for the structure the client composable mirrors.

export const FunnelStepSchema = z.enum([
  'init',
  'details',
  'voyage',
  'travelers',
  'options',
  'insurances',
  'payment',
  'option_booking',
  'unknown',
])

// The PRECISE origin of the problem — which field, what was expected, what was
// actually received, which endpoint failed and with what status.
export const FunnelOriginSchema = z.object({
  field: z.string().optional(),
  expected: z.string().optional(),
  received: z.unknown().optional(),
  endpoint: z.string().optional(),
  statusCode: z.number().optional(),
}).partial()

export const FunnelContextSchema = z.object({
  dealId: z.union([z.string(), z.number()]).optional(),
  bookedId: z.union([z.string(), z.number()]).optional(),
  dateId: z.string().optional(),
  voyageSlug: z.string().optional(),
  email: z.string().optional(),
  type: z.string().optional(),
  url: z.string().optional(),
}).partial()

export const FunnelRawSchema = z.object({
  name: z.string().optional(),
  message: z.string().optional(),
  stack: z.string().optional(),
  data: z.unknown().optional(),
}).partial()

export const FunnelErrorSchema = z.object({
  code: z.string(),
  step: FunnelStepSchema.default('unknown'),
  origin: FunnelOriginSchema.default({}),
  message: z.string(),
  context: FunnelContextSchema.default({}),
  severity: z.enum(['warning', 'error', 'fatal']).default('error'),
  raw: FunnelRawSchema.optional(),
  source: z.enum(['client', 'server']).default('client'),
  occurredAt: z.string().optional(),
})

export type FunnelStep = z.infer<typeof FunnelStepSchema>
export type FunnelError = z.infer<typeof FunnelErrorSchema>
