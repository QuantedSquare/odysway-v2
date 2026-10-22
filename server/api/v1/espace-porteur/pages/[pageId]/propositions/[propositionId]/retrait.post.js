import { defineEventHandler, setResponseHeaders } from 'h3'

// Le porteur retire une proposition encore sans réponse (409 sinon).
//
//   POST /api/v1/espace-porteur/pages/:pageId/propositions/:propositionId/retrait

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  const { pageId, propositionId } = event.context.params
  return datesPorteur.retirer(porteur, pageId, propositionId)
})
