import { defineEventHandler } from 'h3'

// Retire l'accès à l'Espace porteur, même avec un lien encore valide. Une
// nouvelle invitation le rend. Les pages et brouillons Sanity restent.
//
//   POST /api/v1/ulysse/porteurs/:porteurId/revocation
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler((event) => {
  requireUlysseService(event)
  return espacePorteur.revoquer(event.context.params.porteurId)
})
