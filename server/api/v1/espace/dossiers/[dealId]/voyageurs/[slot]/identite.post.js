import { createError, defineEventHandler, readBody, setResponseHeaders } from 'h3'

// Le titulaire corrige le prénom, le nom ou la date de naissance d'un voyageur.
//
//   POST /api/v1/espace/dossiers/:dealId/voyageurs/:slot/identite
//   { avant: { prenom, nom, dateNaissance }, apres: { prenom, nom, dateNaissance } }
//   dates 'YYYY-MM-DD' ; `avant` = ce que la page affichait.
//
// Réécrit le champ AC « Voyageur N » au format du tunnel (Chapka le lit), ISO
// conservé, puis note AC, deal_travelers et Slack (espaceCorrections.js).
// 409 : billets émis ou départ à moins de 30 jours (`verrouille`), voyageur
// changé dans AC depuis l'affichage (`modifie`), date d'un mineur (`age`).

const identite = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : null)

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const dossier = await espaceDossiers.dossierDuCompte(client, event.context.params.dealId)
  const body = await readBody(event).catch(() => null)
  const avant = identite(body?.avant)
  const apres = identite(body?.apres)
  if (!avant || !apres) throw createError({ statusCode: 400, statusMessage: '`avant` et `apres` sont requis.' })

  return espaceCorrections.corrigerIdentite({ client, dossier, slot: event.context.params.slot, avant, saisie: apres })
})
