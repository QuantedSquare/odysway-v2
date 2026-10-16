// Capture d'un rendez-vous Cal.com pris sur le site (server/utils/attributionRdv.js).
//
// Appelé par le navigateur au `bookingSuccessful` de l'embed (useCalEmbed) : le
// deal du RDV naît chez ActiveCampaign, par l'intégration Cal.com, sans passer
// par nous. Seule cette requête porte les cookies d'attribution de la visite.
//
// Corps : { email, bookingUid }. 400 si l'email est illisible ; 204 sinon, quoi
// qu'il advienne de l'attribution — la page n'en dépend pas.

import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const statut = await attributionRdv.capturer(event, {
    email: body?.email,
    bookingUid: body?.bookingUid,
  })
  if (statut === 'invalide') {
    throw createError({ statusCode: 400, statusMessage: 'Email invalide' })
  }
  setResponseStatus(event, 204)
  return null
})
