import { createError, defineEventHandler, readBody } from 'h3'

// Changer le commercial d'une vente, depuis Ulysse (Mois en cours) : le
// propriétaire du deal dans ActiveCampaign ET sa ligne miroir dans Supabase,
// les deux à la fois. Le miroir est écrit ici, sans attendre le webhook : les
// stats par commercial d'Ulysse le relisent aussitôt.
//
//   POST /api/v1/ulysse/deals/:dealId/commercial
//   en-têtes x-ulysse-service-token, x-ulysse-user
//   corps    { ownerId: '12', avant?: '7' }
//
// 409 si le propriétaire dans AC n'est plus `avant` : quelqu'un l'a changé
// depuis l'affichage. Une note AC signée par l'utilisateur d'Ulysse garde la
// trace du changement.

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })

  const body = (await readBody(event).catch(() => null)) || {}
  const absent = v => v === null || v === undefined
  const ownerId = absent(body.ownerId) ? '' : String(body.ownerId)
  if (!/^\d+$/.test(ownerId)) throw createError({ statusCode: 400, statusMessage: 'Commercial invalide.' })
  const avantAttendu = absent(body.avant) ? null : String(body.avant)

  let deal, utilisateurs
  try {
    [{ deal }, utilisateurs] = await Promise.all([activecampaign.getDealById(dealId), activecampaign.listUsers()])
  }
  catch (err) {
    if (err?.response?.status === 404) throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
    throw createError({ statusCode: 502, statusMessage: 'ActiveCampaign est injoignable' })
  }

  const commercial = commercialDeal.trouverCommercial(utilisateurs?.users, ownerId)
  if (!commercial) throw createError({ statusCode: 400, statusMessage: `Aucun commercial ${ownerId} dans ActiveCampaign.` })
  const avant = absent(deal?.owner) ? null : String(deal.owner)
  if (avantAttendu !== null && avant !== avantAttendu) {
    throw createError({ statusCode: 409, statusMessage: 'Le commercial a changé dans ActiveCampaign depuis l\'affichage : rechargez.', data: { avant } })
  }
  const nomAvant = commercialDeal.trouverCommercial(utilisateurs?.users, avant)?.nom ?? avant

  if (avant !== commercial.id) {
    try {
      await activecampaign.updateDealOwner(dealId, commercial.id)
    }
    catch (err) {
      console.error('[ulysse/commercial] écriture AC refusée', dealId, err?.message)
      throw createError({ statusCode: 502, statusMessage: `ActiveCampaign a refusé le changement : ${err?.response?.data?.errors?.[0]?.title || err?.message}` })
    }
  }

  // Le miroir, aussitôt. Sans ligne miroir (deal jamais reçu par le webhook),
  // on la crée depuis AC, qui porte déjà le nouveau propriétaire.
  const { data: lignes, error } = await supabase.from('activecampaign_deals')
    .update(commercialDeal.colonnesMiroir(commercial)).eq('id', dealId).select('id')
  if (error) {
    console.error('[ulysse/commercial] miroir non mis à jour', dealId, error.message)
    throw createError({ statusCode: 502, statusMessage: `AC est à jour, mais pas le miroir : ${error.message}` })
  }
  if (!lignes?.length) {
    try {
      await dealMirrorSync.resynchroniserDeal(dealId)
    }
    catch (err) {
      throw createError({ statusCode: 502, statusMessage: `AC est à jour, mais pas le miroir : ${err?.message}` })
    }
  }

  let note = true
  if (avant !== commercial.id) {
    try {
      await activecampaign.addNote(dealId, { note: { note: commercialDeal.noteCommercial({ avant: nomAvant, apres: commercial.nom, auteur: user.email }) } })
    }
    catch (err) {
      note = false
      console.error('[ulysse/commercial] note AC non écrite', dealId, err?.message)
    }
  }

  return {
    resultat: avant === commercial.id ? 'inchange' : 'change',
    dealId,
    avant: { id: avant, nom: nomAvant },
    apres: { id: commercial.id, nom: commercial.nom },
    note,
  }
})
