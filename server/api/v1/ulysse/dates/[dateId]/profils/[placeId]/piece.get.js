import { defineEventHandler, setResponseHeaders } from 'h3'

// Lien de lecture (60 s) de la copie de pièce d'un voyageur du départ.
//
//   GET /api/v1/ulysse/dates/:dateId/profils/:placeId/piece
//   en-têtes x-ulysse-service-token, x-ulysse-user
//
// La place doit appartenir à une réservation de ce départ. Journalisé
// (« lecture ») au nom de x-ulysse-user.

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  return await espaceProfils.lienScanEquipe(event.context.params.dateId, event.context.params.placeId, user)
})
