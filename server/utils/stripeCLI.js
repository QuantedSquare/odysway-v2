import Stripe from 'stripe'

export default defineEventHandler(async () => {
  return new Stripe(process.env.STRIPE_KEY)
})