import { createError, defineEventHandler, readBody } from 'h3'

// Prépare le dépôt d'un document de voyage : crée la ligne (NON publiée) et
// rend une URL d'envoi signée, où le navigateur d'Ulysse dépose le fichier.
// Si le dépôt échoue, Ulysse supprime le document (DELETE /ulysse/documents/:id).
//
//   POST /api/v1/ulysse/dates/:dateId/documents   corps : depotDocumentSchema
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const parsed = depotDocumentSchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Document invalide.' })
  return await espaceDocuments.preparerDepot(event.context.params.dateId, parsed.data, user)
})
