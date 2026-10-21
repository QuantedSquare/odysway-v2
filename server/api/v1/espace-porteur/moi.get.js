import { defineEventHandler, setResponseHeaders } from 'h3'

// Le porteur connecté et ses pages.
//
//   GET /api/v1/espace-porteur/moi

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  const pages = await espacePorteur.pagesDuPorteur(porteur.porteur_id)
  return { porteur: { nom: porteur.nom, email: porteur.email }, pages: pages.map(espacePorteur.vuePage) }
})
