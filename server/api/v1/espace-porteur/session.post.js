import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Échange le jeton du lien magique (`/espace-porteur?t=…`) contre le cookie de
// session de l'Espace porteur.
//
//   POST /api/v1/espace-porteur/session  { jeton }

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const body = await readBody(event).catch(() => ({}))
  const porteur = await espacePorteur.ouvrirSession(event, body?.jeton)
  if (!porteur) throw createError({ statusCode: 401, statusMessage: 'Ce lien a expiré ou n\'est plus valable. Demandez-en un nouveau à Odysway.' })
  return { nom: porteur.nom }
})
