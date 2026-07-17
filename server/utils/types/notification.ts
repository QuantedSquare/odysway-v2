import { z } from 'zod'

// Public contact form -> Brevo transactional email. Anonymous by design, so the
// mitigation is strict input validation (bounded, well-formed fields) rather than auth.
export const brevoEmailSchema = z.object({
  civility: z.string().max(30).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
})

export type TypeBrevoEmailData = z.infer<typeof brevoEmailSchema>

// Booking funnel -> internal Slack/AC option notification. Callers send different
// field sets (Details vs PaymentRedirect), so only the identifier is constrained;
// the rest passes through for activecampaign.optionNotification.
export const slackNotificationSchema = z.object({
  bookedId: z.string().max(100).optional(),
}).passthrough()

export type TypeSlackNotificationData = z.infer<typeof slackNotificationSchema>
