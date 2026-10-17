import { defineEventHandler, setResponseHeaders } from 'h3'

// Profils voyageurs d'un départ, pour l'équipe : pièce d'identité (numéro
// DÉCHIFFRÉ), régime, allergies, contact d'urgence, notes, complétude.
//
//   GET /api/v1/ulysse/dates/:dateId/profils
//   en-têtes x-ulysse-service-token, x-ulysse-user
//
// Chaque profil lu est journalisé dans traveler_file_access (« consultation »)
// au nom de x-ulysse-user. Ulysse restreint l'accès à son droit
// « profils-voyageurs » ; odysway ne connaît que le jeton de service.

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  return await espaceProfils.profilsDeLaDate(event.context.params.dateId, user)
})
