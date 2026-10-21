import { defineEventHandler, setResponseHeaders } from 'h3'

// Nouvelle page (brouillon vide).
//
//   POST /api/v1/espace-porteur/pages

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  return espacePorteur.vuePage(await espacePorteur.creerPage(porteur))
})
