import { createError, defineEventHandler, readBody } from 'h3'

// Prévient les clients d'un départ : un email récapitulatif par adresse, avec
// ceux des documents choisis (vus dans l'aperçu) qu'elle n'a pas encore reçus.
// Idempotent : rejouer l'appel n'envoie rien de plus. 409 si l'envoi est coupé.
//
//   POST /api/v1/ulysse/dates/:dateId/annonce   corps : { documentIds }
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const parsed = annonceDocumentsSchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Annonce invalide.' })
  return await espaceDocuments.envoyerAnnonce(event.context.params.dateId, parsed.data.documentIds, user)
})
