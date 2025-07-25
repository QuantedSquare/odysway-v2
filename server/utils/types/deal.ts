import { z } from 'zod'

// Define FieldSchema
export const FieldSchema = z.array(
  z.object({
    forecastedClosingDate: z.string().optional(),
    departureDate: z.string().optional(),
    returnDate: z.string().optional(),
    nbTravelers: z.number().optional(),
    nbAdults: z.number().optional(),
    nbChildren: z.number().optional(),
    promoCode: z.string().optional(),
    isFlight: z.string().optional(),
    travelType: z.string().optional(),
    isCouple: z.string().optional(),
    specialRequest: z.string().optional(),
    insurance: z.string().optional(),
    insuranceCommissionPrice: z.number().optional(),
    marginPerTraveler: z.number().optional(),
    totalMargin: z.number().optional(),
    flightMargin: z.number().optional(),
    country: z.string().optional(),
    pricePerTraveler: z.number().optional(),
    indivRoom: z.array(z.string()).optional(),
    currentStep: z.string().optional(),
    paiementLink: z.string().optional(),
    slug: z.string().optional(),
    image: z.string().optional(),
    alreadyPaid: z.number().optional(),
    travelBook: z.string().optional(),
    flightTickets: z.string().optional(),
    insuranceContract: z.string().optional(),
    restTravelersToPay: z.number().optional(),
    CalendlyType: z.string().optional(),
    CalendlyDate: z.string().optional(),
    traveler1: z.string().optional(),
    traveler2: z.string().optional(),
    traveler3: z.string().optional(),
    traveler4: z.string().optional(),
    traveler5: z.string().optional(),
    traveler6: z.string().optional(),
    traveler7: z.string().optional(),
    traveler8: z.string().optional(),
    otherReasonLost: z.string().optional(),
    ReasonLost: z.string().optional(),
    flightTicketBought: z.string().optional(),
    restToPay: z.number().optional(),
    utm: z.string().optional(),
    includeFlight: z.string().optional(),
    insuranceCommissionPerTraveler: z.number().optional(),
    depositPrice: z.number().optional(),
    basePricePerTraveler: z.number().optional(),
    iso: z.string().optional(),
    zoneChapka: z.number().optional(),
    indivRoomPrice: z.number().optional(),
    promoValue: z.number().optional(),
    restToPayPerTraveler: z.number().optional(),
    totalTravelPrice: z.number().optional(),
    flightPrice: z.number().optional(),
    extensionPrice: z.number().optional(),
    promoChildren: z.number().optional(),
    maxChildrenAge: z.number().optional(),
    promoTeen: z.number().optional(),
    maxTeenAge: z.number().optional(),
    nbUnderAge: z.number().optional(),
    nbTeen: z.number().optional(),
    conversionDate: z.string().optional(),
    oldCreationDate: z.string().optional(),
    oldOwner: z.string().optional(),
    source: z.string().optional(),
    forcedIndivRoom: z.string().optional(),
    paiementMethod: z.string().optional(),
    promoEarlybird: z.number().optional(),
    gotEarlybird: z.string().optional(),
    promoLastMinute: z.number().optional(),
    gotLastMinute: z.string().optional(),
  }).partial(),
)

// Define DealSchema
export const DealSchema = z.object({
  contact: z.string().optional(), // Optional only on creation
  currency: z.string().length(3),
  group: z.string(),
  owner: z.string(),
  stage: z.string(),
  title: z.string(),
  value: z.number(),
  // Custom fields in flat format
  forecastedClosingDate: z.string().optional(),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  nbTravelers: z.number().optional(),
  nbAdults: z.number().optional(),
  nbChildren: z.number().optional(),
  promoCode: z.string().optional(),
  isFlight: z.string().optional(),
  travelType: z.string().optional(),
  isCouple: z.string().optional(),
  specialRequest: z.string().optional(),
  insurance: z.array(z.string()).optional(),
  insuranceCommissionPrice: z.number().optional(),
  marginPerTraveler: z.number().optional(),
  totalMargin: z.number().optional(),
  flightMargin: z.number().optional(),
  country: z.string().optional(),
  pricePerTraveler: z.number().optional(),
  indivRoom: z.array(z.string()).optional(),
  currentStep: z.string().optional(),
  paiementLink: z.string().optional(),
  slug: z.string().optional(),
  image: z.string().optional(),
  alreadyPaid: z.number().optional(),
  travelBook: z.string().optional(),
  flightTickets: z.string().optional(),
  insuranceContract: z.string().optional(),
  restTravelersToPay: z.number().optional(),
  CalendlyType: z.string().optional(),
  CalendlyDate: z.string().optional(),
  traveler1: z.string().optional(),
  traveler2: z.string().optional(),
  traveler3: z.string().optional(),
  traveler4: z.string().optional(),
  traveler5: z.string().optional(),
  traveler6: z.string().optional(),
  traveler7: z.string().optional(),
  traveler8: z.string().optional(),
  otherReasonLost: z.string().optional(),
  ReasonLost: z.string().optional(),
  flightTicketBought: z.string().optional(),
  restToPay: z.number().optional(),
  utm: z.string().optional(),
  includeFlight: z.string().optional(),
  insuranceCommissionPerTraveler: z.number().optional(),
  depositPrice: z.number().optional(),
  basePricePerTraveler: z.number().optional(),
  iso: z.string().optional(),
  zoneChapka: z.number().optional(),
  indivRoomPrice: z.number().optional(),
  promoValue: z.number().optional(),
  restToPayPerTraveler: z.number().optional(),
  totalTravelPrice: z.number().optional(),
  flightPrice: z.number().optional(),
  extensionPrice: z.number().optional(),
  promoChildren: z.number().optional(),
  maxChildrenAge: z.number().optional(),
  promoTeen: z.number().optional(),
  maxTeenAge: z.number().optional(),
  nbUnderAge: z.number().optional(),
  nbTeen: z.number().optional(),
  conversionDate: z.string().optional(),
  oldCreationDate: z.string().optional(),
  oldOwner: z.string().optional(),
  source: z.string().optional(),
  forcedIndivRoom: z.string().optional(),
  paiementMethod: z.string().optional(),
  promoEarlybird: z.number().optional(),
  gotEarlybird: z.string().optional(),
  promoLastMinute: z.number().optional(),
  gotLastMinute: z.string().optional(),
  // contact fields
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  optinNewsletter: z.boolean().optional(),
})

// Define DataToPushSchema
// export const DataToPushSchema = z.object({
//   deal: DealSchema,
//   firstname: z.string().optional(),
//   lastname: z.string().optional(),
//   email: z.string().email(),
//   phone: z.string().optional(),
// })

export const UpdateDealSchema = DealSchema.partial()

export type TypeDeal = z.infer<typeof DealSchema>
