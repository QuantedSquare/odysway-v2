import { defineEventHandler, setResponseHeaders } from 'h3'

// Lien de lecture de la copie de la pièce, valable 60 secondes. Journalisé.
//
//   GET /api/v1/espace/dossiers/:dealId/voyageurs/:slot/piece

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const { place } = await espaceProfils.placeModifiable(client, event.context.params.dealId, event.context.params.slot)
  return await espaceProfils.lienScan({ client, place })
})
