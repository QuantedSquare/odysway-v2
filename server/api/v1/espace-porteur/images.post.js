import { defineEventHandler, readMultipartFormData, setResponseHeaders } from 'h3'

// Image du brouillon (multipart, champ `fichier`), envoyée aux assets Sanity.
// Le navigateur la réduit avant l'envoi (limite de requête Vercel : 4,5 Mo).
//
//   POST /api/v1/espace-porteur/images  →  { ref, url, largeur, hauteur }

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const porteur = await espacePorteur.requirePorteur(event)
  const parties = await readMultipartFormData(event)
  const fichier = (parties || []).find(p => p.name === 'fichier' && p.filename !== undefined)
  return espacePorteur.deposerImage(porteur, fichier)
})
