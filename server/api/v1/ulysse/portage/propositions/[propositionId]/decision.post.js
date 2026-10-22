import { defineEventHandler, readBody } from 'h3'

// Réponse d'Odysway à une date proposée par un porteur, depuis Ulysse ›
// Portage. Acceptée : Ulysse a d'abord créé la date (pont `creerDate`) et en
// passe l'id. Le porteur est prévenu par email.
//
//   POST /api/v1/ulysse/portage/propositions/:propositionId/decision
//   en-têtes x-ulysse-service-token, x-ulysse-user
//   { decision: 'acceptee' | 'refusee', reponse?, travelDateId? }  →  la proposition + { emailEnvoye }
//   409 si elle a déjà reçu une réponse ou a été retirée.

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const body = await readBody(event).catch(() => ({}))
  return datesPorteur.decider({
    propositionId: event.context.params.propositionId,
    decision: body?.decision,
    reponse: body?.reponse,
    travelDateId: body?.travelDateId,
    par: user.email,
  })
})
