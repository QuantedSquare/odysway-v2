import { defineEventHandler, setResponseHeaders } from 'h3'

// Dates du séjour pour le porteur : ses propositions, et le remplissage des
// départs ouverts par Odysway (des comptes, pas les inscrits).
//
//   GET /api/v1/espace-porteur/pages/:pageId/dates

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  return datesPorteur.datesDeLaPage(porteur, event.context.params.pageId)
})
