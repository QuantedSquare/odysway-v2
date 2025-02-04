import { z } from 'zod'

export const clientSchema = z.object({
  contact: z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  }),
})

export type TypeClientData = z.infer<typeof clientSchema>
