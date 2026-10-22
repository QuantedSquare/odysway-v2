import { defineEventHandler } from 'h3'

// État de l'Espace porteur pour la fiche porteur d'Ulysse : invitation et
// pages (statut, lien Studio du brouillon).
//
//   GET /api/v1/ulysse/porteurs/:porteurId/espace
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler((event) => {
  requireUlysseService(event)
  return espacePorteur.etatPorteur(event.context.params.porteurId)
})
