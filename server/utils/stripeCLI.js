import Stripe from 'stripe'
// Replace key on vercel env
export const stripeCLI = new Stripe(process.env.STRIPE_KEY_DEV)
