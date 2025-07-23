import Stripe from 'stripe'

export const stripeCLI = new Stripe(process.env.STRIPE_KEY)
