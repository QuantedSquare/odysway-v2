import { defineEventHandler, setResponseHeaders } from 'h3'

// Lien de téléchargement (60 s) d'un document de voyage ; le marque comme vu.
//
//   GET /api/v1/espace/documents/:documentId/lien
//
// 404 si le document n'est pas publié, pas encore disponible, ou hors des
// dossiers du compte.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  return await espaceDocuments.lienDocumentClient(client, event.context.params.documentId)
})
