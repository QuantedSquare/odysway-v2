import { defineEventHandler, setResponseHeaders } from 'h3'

// Lien de 60 s pour que l'équipe vérifie un document, publié ou non.
//
//   GET /api/v1/ulysse/documents/:documentId/lien
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  return await espaceDocuments.lienDocumentEquipe(event.context.params.documentId)
})
