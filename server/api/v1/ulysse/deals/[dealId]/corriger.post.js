import { createError, defineEventHandler, readBody } from 'h3'

// Correction d'un deal AC demandée par le Docteur d'Ulysse, avec un avant/après
// que l'utilisateur a vu et confirmé.
//
//   POST /api/v1/ulysse/deals/:dealId/corriger
//   en-têtes x-ulysse-service-token, x-ulysse-user
//   corps    { champs: [{ cle, avant, apres }], regle?: 'RES-03' }
//
// Valeurs au format d'Ulysse (euros, 'YYYY-MM-DD', booléens) : la conversion
// vers AC vit dans server/utils/correctionDeal.js, qui fixe aussi la liste des
// champs corrigeables.
//
// 409 si AC ne contient plus `avant` : quelqu'un a modifié le deal depuis
// l'affichage, l'utilisateur doit revoir la correction. Sinon :
//   1. écriture par `updateDeal`, qui relance la formule (recalculatTotalValues) ;
//   2. note AC signée par l'utilisateur d'Ulysse ;
//   3. ligne miroir réécrite aussitôt : Ulysse la relit juste après.

const MAX_CHAMPS = 10

const primitive = v => v === null || ['string', 'number', 'boolean'].includes(typeof v)

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })

  const body = (await readBody(event).catch(() => null)) || {}
  const champs = Array.isArray(body.champs) ? body.champs : []
  if (!champs.length || champs.length > MAX_CHAMPS) {
    throw createError({ statusCode: 400, statusMessage: `Entre 1 et ${MAX_CHAMPS} champs à corriger.` })
  }
  if (new Set(champs.map(c => c?.cle)).size !== champs.length) throw createError({ statusCode: 400, statusMessage: 'Un champ figure deux fois.' })
  for (const c of champs) {
    if (!correctionDeal.CHAMPS[c?.cle]) throw createError({ statusCode: 400, statusMessage: `Champ non corrigeable : ${c?.cle}` })
    if (!primitive(c.avant)) throw createError({ statusCode: 400, statusMessage: `${c.cle} : valeur « avant » illisible.` })
    if (!correctionDeal.valeurValide(c.cle, c.apres)) throw createError({ statusCode: 400, statusMessage: `${c.cle} : valeur « après » refusée.` })
  }
  const regle = typeof body.regle === 'string' && /^[A-Z]{3}-\d{2}$/.test(body.regle) ? body.regle : null

  let avant
  try {
    avant = await dealMirrorSync.lireDeal(dealId)
  }
  catch (err) {
    if (err?.response?.status === 404) throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
    throw createError({ statusCode: 502, statusMessage: 'ActiveCampaign est injoignable' })
  }

  const ecarts = correctionDeal.ecartsAvant(champs, avant.fusion)
  if (ecarts.length) {
    throw createError({ statusCode: 409, statusMessage: 'Le deal a changé dans ActiveCampaign depuis l\'affichage : revoyez la correction.', data: { ecarts } })
  }

  const plat = correctionDeal.dealAPlat(champs)
  const statut = champs.find(c => c.cle === 'status')
  try {
    if (Object.keys(plat).length) await activecampaign.updateDeal(dealId, plat)
    if (statut) await activecampaign.updateDealStatus(dealId, statut.apres)
  }
  catch (err) {
    console.error('[ulysse/corriger] écriture AC refusée', dealId, err?.message)
    throw createError({ statusCode: 502, statusMessage: `ActiveCampaign a refusé la correction : ${err?.response?.data?.errors?.[0]?.title || err?.message}` })
  }

  let note = true
  try {
    await activecampaign.addNote(dealId, { note: { note: correctionDeal.noteCorrection({ champs, auteur: user.email, regle }) } })
  }
  catch (err) {
    note = false
    console.error('[ulysse/corriger] note AC non écrite', dealId, err?.message)
  }

  // Ce qu'AC contient désormais, formule rejouée : c'est ce qu'Ulysse affiche.
  // La correction est faite : une relecture en échec ne la transforme pas en erreur.
  let apres = null
  try {
    apres = await dealMirrorSync.lireDeal(dealId)
  }
  catch (err) {
    console.error('[ulysse/corriger] relecture AC', dealId, err?.message)
  }
  let miroir = apres ? 'a_jour' : 'non_relu'
  if (apres) {
    try {
      await dealMirrorSync.resynchroniserDeal(dealId, { lu: apres })
    }
    catch (err) {
      miroir = 'erreur'
      console.error('[ulysse/corriger] miroir', dealId, err?.message)
    }
  }

  const resultat = champs.map(c => ({
    cle: c.cle,
    avant: c.avant,
    demande: c.apres,
    apres: apres ? correctionDeal.depuisAc(c.cle, apres.fusion[c.cle]) : null,
  }))
  return {
    resultat: 'corrige',
    champs: resultat,
    // AC a pu refuser une valeur sans erreur (option de liste inconnue…).
    nonAppliques: apres ? resultat.filter(r => !correctionDeal.egales(r.cle, r.demande, r.apres)).map(r => r.cle) : null,
    note,
    miroir,
  }
})
