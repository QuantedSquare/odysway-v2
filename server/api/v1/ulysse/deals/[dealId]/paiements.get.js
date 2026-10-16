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

// Les paiements « d'avant le rattachement » : combien restent à tenter. Ceux
// marqués introuvables ou sans deal ne se rattacheront jamais : ils ne
// suspendent pas le rapprochement.
const almaNonRattaches = async () => {
  const { count } = await supabase.from('alma_ids').select('id', { count: 'exact', head: true }).is('deal_id', null).is('rattachement', null)
  return count ?? null
}

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, no-cache, must-revalidate, private' })

  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })
  }

  const [{ stripe, alma: almaPaiements }, nonRattaches] = await Promise.all([
    paiementsLecture.lirePaiements(dealId, 'ulysse'),
    almaNonRattaches().catch(() => null),
  ])
  return { dealId, luLe: new Date().toISOString(), stripe, alma: almaPaiements.disponible ? { ...almaPaiements, nonRattaches } : almaPaiements }
})
