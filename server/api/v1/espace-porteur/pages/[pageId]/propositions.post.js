import { defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Le porteur propose une date ; Odysway l'accepte ou la refuse dans Ulysse.
//
//   POST /api/v1/espace-porteur/pages/:pageId/propositions
//   { depart, retour, participantsMin?, participantsMax?, prixSouhaite? (euros), note? }
//   422 avec `data.erreurs` si la saisie ne va pas.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  const corps = await readBody(event).catch(() => ({}))
  return datesPorteur.proposer(porteur, event.context.params.pageId, corps)
})
