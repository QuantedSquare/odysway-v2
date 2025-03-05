import Stripe from 'stripe'
// REplace key with dynamic one for prod
// useRuntimeConfig().STRIPE_SECRET_KEY
export const stripeCLI = new Stripe(process.env.STRIPE_KEY_DEV)
