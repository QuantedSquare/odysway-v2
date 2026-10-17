import { createError, defineEventHandler, readBody } from 'h3'

// Relance la formule d'odysway-v2 sur un deal (recalculatTotalValues) : valeur
// et reste à payer recalculés d'après ses champs. Correction d'ARG-01 / ARG-02
// du Docteur d'Ulysse.
//
//   POST /api/v1/ulysse/deals/:dealId/recalculer
//   en-têtes x-ulysse-service-token, x-ulysse-user
//   corps    { regle?: 'ARG-01' }
// Note AC signée, miroir réécrit aussitôt.

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })
  const body = (await readBody(event).catch(() => null)) || {}
  const regle = typeof body.regle === 'string' && /^[A-Z]{3}-\d{2}$/.test(body.regle) ? body.regle : null

  const valeurs = lu => ({
    valeur: lu.deal.value === undefined || lu.deal.value === null ? null : Number(lu.deal.value) / 100,
    reste: lu.champs.restToPay === undefined || lu.champs.restToPay === null ? null : Number(lu.champs.restToPay) / 100,
  })

  let avant
  try {
    avant = await dealMirrorSync.lireDeal(dealId)
  }
  catch (err) {
    if (err?.response?.status === 404) throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
    throw createError({ statusCode: 502, statusMessage: 'ActiveCampaign est injoignable' })
  }
  if (avant.deal.group === '4') throw createError({ statusCode: 400, statusMessage: 'Un dossier de départ n\'a pas de formule : resynchronisez-le.' })

  try {
    await activecampaign.recalculatTotalValues(dealId)
  }
  catch (err) {
    console.error('[ulysse/recalculer]', dealId, err?.message)
    throw createError({ statusCode: 502, statusMessage: `ActiveCampaign a refusé le recalcul : ${err?.message}` })
  }

  let apres = null
  let miroir = 'non_relu'
  try {
    apres = await dealMirrorSync.lireDeal(dealId)
    miroir = 'a_jour'
    await dealMirrorSync.resynchroniserDeal(dealId, { lu: apres })
  }
  catch (err) {
    miroir = apres ? 'erreur' : 'non_relu'
    console.error('[ulysse/recalculer] relecture ou miroir', dealId, err?.message)
  }

  const resultat = { avant: valeurs(avant), apres: apres ? valeurs(apres) : null }
  let note = true
  try {
    if (apres) await activecampaign.addNote(dealId, { note: { note: correctionDeal.noteRecalcul({ ...resultat, auteur: user.email, regle }) } })
  }
  catch (err) {
    note = false
    console.error('[ulysse/recalculer] note AC', dealId, err?.message)
  }
  return { resultat: 'recalcule', ...resultat, note, miroir }
})
