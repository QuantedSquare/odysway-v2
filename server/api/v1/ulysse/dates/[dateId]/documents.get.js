import { defineEventHandler, setResponseHeaders } from 'h3'

// Documents de voyage d'un départ pour l'équipe : ceux de tout le départ,
// puis ceux de chaque dossier réservé dessus, publiés ou non.
//
//   GET /api/v1/ulysse/dates/:dateId/documents
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  return await espaceDocuments.documentsDeLaDate(event.context.params.dateId)
})
