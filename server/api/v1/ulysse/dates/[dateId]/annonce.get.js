import { defineEventHandler, setResponseHeaders } from 'h3'

// Aperçu de l'annonce d'un départ : documents publiés, disponibles et pas
// encore annoncés ; pour chaque adresse, les documents qu'elle recevrait ; le
// mode d'envoi (ESPACE_NOTIFICATIONS). N'envoie et n'écrit rien.
//
//   GET /api/v1/ulysse/dates/:dateId/annonce
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  return await espaceDocuments.apercuAnnonce(event.context.params.dateId)
})
