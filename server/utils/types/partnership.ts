import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).optional().default('')

export const partnershipRequestSchema = z.object({
  concept: z.string().trim().min(10).max(4000),
  destination: optionalText(300),
  communaute: optionalText(300),
  participants: optionalText(120),
  besoin: optionalText(200),
  email: z.string().trim().toLowerCase().email().max(254),
  sourceUrl: optionalText(1000),
  utm: optionalText(1000),
  // Pot de miel : un humain ne remplit jamais ce champ caché.
  website: z.string().max(500).optional(),
})

export type TypePartnershipRequest = z.infer<typeof partnershipRequestSchema>
