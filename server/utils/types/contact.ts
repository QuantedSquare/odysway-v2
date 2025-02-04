import { z } from 'zod'

export const clientFieldSchema = z.array(
  z.object({
    birthdate: z.string().optional(),
    passId: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }),
)
export const clientSchema = z.object({
  contact: z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    fields: clientFieldSchema.optional(),
  }),
})

export type TypeClientData = z.infer<typeof clientSchema>
