import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Suppression du compte de l'Espace Voyageur (RGPD).
//
//   DELETE /api/v1/espace/moi   { conservationComprise: true, confirmation: 'SUPPRIMER' }
//
// Exige une connexion de moins de 10 minutes (`amr` du jeton, même règle que le
// mot de passe) et la double confirmation. Refuse tout compte de l'équipe
// (ulysse.members). Ce qui est effacé et ce qui reste : espaceComptes.js.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)

  if (!espaceCompte.connexionRecente(espaceAuth.lireJeton(event))) {
    throw createError({ statusCode: 403, statusMessage: 'Pour votre sécurité, confirmez d\'abord votre identité avec un code.', data: { raison: 'connexion_ancienne' } })
  }
  const corps = await readBody(event).catch(() => null)
  if (!espaceCompte.confirmationValide(corps)) {
    throw createError({ statusCode: 400, statusMessage: `Confirmez la suppression en cochant la case et en saisissant ${espaceCompte.MOT_SUPPRESSION}.` })
  }
  if (await espaceComptes.estMembreEquipe(client)) {
    throw createError({ statusCode: 403, statusMessage: 'Ce compte est celui d\'un membre de l\'équipe Odysway : il ne se supprime pas depuis l\'espace client.', data: { raison: 'equipe' } })
  }

  return { supprime: true, ...await espaceComptes.supprimerCompte(client) }
})
