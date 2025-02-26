import Stripe from 'stripe'
// REplace key with dynamic one for prod
export const stripeCLI = new Stripe(process.env.STRIPE_KEY_DEV)
