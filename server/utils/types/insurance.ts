import { z } from 'zod'

export const InsuranceSchema = z.object({
  pricePerTraveler: z.number(),
  countries: z.string(),
  zoneChapka: z.number().default(0),
  departureDate: z.string(),
  returnDate: z.string(),
  nbTravelers: z.number().min(1),
})

export type TypeInsurance = z.infer<typeof InsuranceSchema>

export const SchemaInsuranceQuote = z.object({
  rapatriement: z.number().optional(),
  cancel: z.number().optional(),
}).partial()

export type TypeInsuranceQuote = z.infer<typeof SchemaInsuranceQuote>
