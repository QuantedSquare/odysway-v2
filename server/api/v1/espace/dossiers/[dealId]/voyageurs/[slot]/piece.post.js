import { defineEventHandler, readMultipartFormData, setResponseHeaders } from 'h3'

// Dépôt de la copie de la pièce d'identité (multipart, champ `fichier`).
//
//   POST /api/v1/espace/dossiers/:dealId/voyageurs/:slot/piece
//
// Type contrôlé sur les octets (PDF, JPEG, PNG, HEIC), 10 Mo maximum, rangée
// dans le bucket privé `traveler-files` sous un nom tiré au hasard.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const { place } = await espaceProfils.placeModifiable(client, event.context.params.dealId, event.context.params.slot)
  const parties = await readMultipartFormData(event)
  const fichier = (parties || []).find(p => p.name === 'fichier' && p.filename !== undefined)
  return { scan: await espaceProfils.deposerScan({ client, place, fichier }) }
})
