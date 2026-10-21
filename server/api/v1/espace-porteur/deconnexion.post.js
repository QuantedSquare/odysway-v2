import { defineEventHandler } from 'h3'

//   POST /api/v1/espace-porteur/deconnexion

export default defineEventHandler((event) => {
  espacePorteur.fermerSession(event)
  return { ok: true }
})
