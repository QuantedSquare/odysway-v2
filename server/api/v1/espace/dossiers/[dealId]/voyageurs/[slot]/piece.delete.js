import { defineEventHandler, setResponseHeaders } from 'h3'

// Suppression de la copie de la pièce, par la personne ou le titulaire. Journalisée.
//
//   DELETE /api/v1/espace/dossiers/:dealId/voyageurs/:slot/piece

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const { place } = await espaceProfils.placeModifiable(client, event.context.params.dealId, event.context.params.slot)
  return { supprime: await espaceProfils.supprimerScan({ client, place }) }
})
