import { createError, defineEventHandler, getHeader } from 'h3'

// Annonce par email les documents de voyage arrivés à leur date de
// disponibilité (« disponible le »), et retente les envois en échec. À
// appeler une fois par jour, le matin, avec l'en-tête x-cron-secret.
//
//   POST /api/v1/webhooks/espace/notifier-documents
//
// Sans ESPACE_NOTIFICATIONS, rien ne part : les documents sont marqués
// traités et l'envoi est seulement journalisé.

export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  if (!secret || getHeader(event, 'x-cron-secret') !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return await espaceDocuments.notifierDocumentsEnAttente()
})
