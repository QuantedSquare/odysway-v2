import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// « C'est moi » : le titulaire désigne sa place parmi les voyageurs du dossier,
// quand son nom n'y correspond pas (nom d'usage, faute de frappe).
//
//   POST /api/v1/espace/dossiers/:dealId/titulaire   { slot: 2 }
//   { slot: null } revient à la reconnaissance par le nom du contact AC.
//
// Gardé dans deal_travelers.holder_manuel : la synchro AC ne le défait pas.

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const dossier = await espaceDossiers.dossierDuCompte(client, event.context.params.dealId)
  const body = await readBody(event).catch(() => ({}))
  if (body?.slot !== null && !Number.isInteger(body?.slot)) {
    throw createError({ statusCode: 400, statusMessage: '`slot` doit être un numéro de place ou null.' })
  }
  return espaceCorrections.designerTitulaire({ client, dossier, slot: body.slot })
})
