import { createError, defineEventHandler, readBody } from 'h3'

// Encaissement hors ligne saisi dans le journal d'Ulysse (chèque vacances,
// chèque, virement direct, espèces) : c'est désormais le seul chemin pour
// l'ajouter au « Total payé » d'AC (décision d'Alex, 22/09/2026).
//
//   POST /api/v1/ulysse/deals/:dealId/encaissement
//   en-têtes x-ulysse-service-token, x-ulysse-user
//   corps    { id: uuid, montant: euros > 0, moyen, date: 'YYYY-MM-DD', reference?, dejaPaye: euros }
//
// Deux gardes contre un double comptage :
//   - l'`id` de la ligne du journal est écrit dans la note AC : rejouer le même
//     encaissement rend `deja_enregistre` sans rien écrire ;
//   - `dejaPaye` est le Total payé qu'Ulysse a lu : s'il a changé (paiement
//     Stripe arrivé entre-temps, ou appel rejoué après une note perdue), 409.
// Le total est écrit AVANT la note : une note perdue ne peut que provoquer un
// 409 au rejeu, jamais un second ajout.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const dealId = Number.parseInt(event.context.params.dealId, 10)
  if (!Number.isInteger(dealId) || dealId <= 0) throw createError({ statusCode: 400, statusMessage: 'Identifiant de deal invalide' })

  const b = (await readBody(event).catch(() => null)) || {}
  if (!UUID.test(String(b.id))) throw createError({ statusCode: 400, statusMessage: 'Identifiant d\'encaissement invalide.' })
  if (typeof b.montant !== 'number' || !Number.isFinite(b.montant) || b.montant <= 0 || b.montant >= 1e6) {
    throw createError({ statusCode: 400, statusMessage: 'Montant invalide : un nombre d\'euros positif.' })
  }
  if (!correctionDeal.MOYENS[b.moyen]) throw createError({ statusCode: 400, statusMessage: 'Moyen de paiement inconnu.' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.date))) throw createError({ statusCode: 400, statusMessage: 'Date invalide (AAAA-MM-JJ).' })
  if (b.reference !== undefined && b.reference !== null && (typeof b.reference !== 'string' || b.reference.length > 80)) {
    throw createError({ statusCode: 400, statusMessage: 'Référence trop longue (80 caractères au plus).' })
  }
  if (typeof b.dejaPaye !== 'number' || !Number.isFinite(b.dejaPaye)) {
    throw createError({ statusCode: 400, statusMessage: '`dejaPaye` requis : le Total payé lu par Ulysse.' })
  }

  let notes, avant
  try {
    [notes, avant] = await Promise.all([activecampaign.getDealNotes(dealId), dealMirrorSync.lireDeal(dealId)])
  }
  catch (err) {
    if (err?.response?.status === 404) throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign` })
    throw createError({ statusCode: 502, statusMessage: 'ActiveCampaign est injoignable' })
  }
  if (correctionDeal.dejaEncaisse(notes, b.id)) return { resultat: 'deja_enregistre' }

  const payeCentimes = Math.round(Number(avant.champs.alreadyPaid) || 0)
  if (Math.abs(payeCentimes / 100 - b.dejaPaye) >= 0.005) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Le Total payé a changé dans ActiveCampaign depuis l\'affichage : vérifiez avant d\'encaisser.',
      data: { dejaPaye: payeCentimes / 100 },
    })
  }

  try {
    await activecampaign.updateDeal(dealId, { alreadyPaid: payeCentimes + Math.round(b.montant * 100) })
  }
  catch (err) {
    console.error('[ulysse/encaissement] écriture AC refusée', dealId, err?.message)
    throw createError({ statusCode: 502, statusMessage: `ActiveCampaign a refusé l'encaissement : ${err?.message}` })
  }

  let note = true
  try {
    await activecampaign.addNote(dealId, { note: { note: correctionDeal.noteEncaissement({ ...b, auteur: user.email }) } })
  }
  catch (err) {
    note = false
    console.error('[ulysse/encaissement] note AC non écrite', dealId, err?.message)
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
    console.error('[ulysse/encaissement] relecture ou miroir', dealId, err?.message)
  }

  return {
    resultat: 'encaisse',
    totalPaye: apres ? (Number(apres.champs.alreadyPaid) || 0) / 100 : null,
    resteAPayer: apres && Number.isFinite(Number(apres.champs.restToPay ?? Number.NaN)) ? Number(apres.champs.restToPay) / 100 : null,
    note,
    miroir,
  }
})
