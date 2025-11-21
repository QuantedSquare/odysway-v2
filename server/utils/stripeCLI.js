import Stripe from 'stripe'

const stripeCLI = new Stripe(process.env.STRIPE_KEY)
export default stripeCLI

