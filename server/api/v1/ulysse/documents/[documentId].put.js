import { createError, defineEventHandler, readBody } from 'h3'

// Modifie un document de voyage : titre, visibilité, date de disponibilité,
// publication. Publier vérifie d'abord que le fichier a bien été reçu (409).
//
//   PUT /api/v1/ulysse/documents/:documentId   corps : modificationDocumentSchema
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  const parsed = modificationDocumentSchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Modification invalide.' })
  return await espaceDocuments.modifierDocument(event.context.params.documentId, parsed.data)
})
