import { createError, defineEventHandler } from 'h3'

// Réécrit la ligne miroir d'un deal depuis AC (CYC-11 du Docteur d'Ulysse :
// le webhook n'a pas suivi). LECTURE SEULE côté AC.
//
//   POST /api/v1/ulysse/deals/:dealId/resynchroniser
//   en-têtes x-ulysse-service-token, x-ulysse-user

export default defineEventHandler(async (event) => {
  requireUlysseService(event)
  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })
  try {
    const ligne = await dealMirrorSync.resynchroniserDeal(dealId)
    return { resultat: 'resynchronise', dealId, stageId: ligne.stage_id, valeur: ligne.total_value, paye: ligne.total_paid }
  }
  catch (err) {
    if (err?.response?.status === 404) throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
    console.error('[ulysse/resynchroniser]', dealId, err?.message)
    throw createError({ statusCode: 502, statusMessage: `Miroir non resynchronisé : ${err?.message}` })
  }
})
