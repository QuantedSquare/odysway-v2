import { createError, defineEventHandler, setResponseHeaders } from 'h3'

// Paiements d'un deal chez Stripe et chez Alma, pour le Docteur d'Ulysse :
// rapprochement avec « Total payé » d'AC (ARG-04), paiement en attente (CHK-06).
//
//   GET /api/v1/ulysse/deals/:dealId/paiements
//   en-têtes x-ulysse-service-token, x-ulysse-user
//
// LECTURE SEULE. Stripe : PaymentIntents dont les métadonnées portent le deal
// (`payment_intent_data.metadata` de createCheckoutSession), virements en
// attente compris. Alma : paiements rattachés au deal dans `alma_ids`, relus
// chez Alma. Chaque source échoue seule : l'autre reste lisible.

const STRIPE_MAX = 100

const lireStripe = async (dealId) => {
  const intents = []
  let page = null
  do {
    const r = await stripeCLI.paymentIntents.search({
      query: `metadata['dealId']:'${dealId}'`,
      expand: ['data.latest_charge'],
      limit: 100,
      ...(page ? { page } : {}),
    })
    intents.push(...r.data)
    page = r.has_more ? r.next_page : null
  } while (page && intents.length < STRIPE_MAX)
  return paiementsDeal.resumerStripe(intents)
}

const lireAlma = async (dealId) => {
  const { data, error } = await supabase.from('alma_ids').select('id').eq('deal_id', dealId)
  if (error) throw new Error(error.message)
  const paiements = await Promise.all((data || []).map(r => alma.lirePaiement(r.id)))
  // Les paiements d'avant le rattachement : combien restent à rattacher.
  const { count } = await supabase.from('alma_ids').select('id', { count: 'exact', head: true }).is('deal_id', null)
  return { ...paiementsDeal.resumerAlma(paiements), nonRattaches: count ?? null }
}

const source = async (lire) => {
  try {
    return { disponible: true, ...(await lire()) }
  }
  catch (err) {
    console.error('[ulysse/paiements]', err?.message)
    return { disponible: false, erreur: err?.message || String(err), paiements: [], encaisse: null, enAttente: null }
  }
}

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, no-cache, must-revalidate, private' })

  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })
  }

  const [stripe, almaPaiements] = await Promise.all([source(() => lireStripe(dealId)), source(() => lireAlma(dealId))])
  return { dealId, luLe: new Date().toISOString(), stripe, alma: almaPaiements }
})
