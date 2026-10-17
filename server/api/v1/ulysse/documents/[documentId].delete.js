import { defineEventHandler } from 'h3'

// Retire un document des espaces clients et supprime son fichier. La ligne
// reste (deleted_at, deleted_by) pour la trace.
//
//   DELETE /api/v1/ulysse/documents/:documentId
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  return await espaceDocuments.supprimerDocument(event.context.params.documentId, user)
})
