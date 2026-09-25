import { createError, defineEventHandler, setResponseHeaders } from 'h3'

// Notes AC d'un deal, pour la chronologie de la fiche du Docteur d'Ulysse :
// paiements (Stripe, Alma), corrections et encaissements notés par Ulysse,
// notes des commerciaux. LECTURE SEULE.
//
//   GET /api/v1/ulysse/deals/:dealId/notes
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, no-cache, must-revalidate, private' })
  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })
  try {
    const notes = await activecampaign.getDealNotes(dealId)
    return {
      dealId,
      notes: notes.map(n => ({ id: String(n.id), le: n.cdate || n.mdate || null, texte: String(n.note || '') }))
        .sort((a, b) => String(b.le).localeCompare(String(a.le))),
    }
  }
  catch (err) {
    if (err?.response?.status === 404) throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
    throw createError({ statusCode: 502, statusMessage: 'ActiveCampaign est injoignable' })
  }
})
