import { defineEventHandler, readBody } from 'h3'

// Invite un porteur dans l'Espace porteur (/espace-porteur) : lien magique
// signé, envoyé par email Brevo. Bouton de la fiche porteur d'Ulysse, qui fait
// foi pour le nom et l'email. Rejouable : chaque appel renvoie un lien neuf et
// lève une révocation.
//
//   POST /api/v1/ulysse/porteurs/:porteurId/invitation
//   en-têtes x-ulysse-service-token, x-ulysse-user
//   { nom, email, envoyer?: true }  →  { lien, envoye }

export default defineEventHandler(async (event) => {
  const user = requireUlysseService(event)
  const body = await readBody(event).catch(() => ({}))
  return espacePorteur.inviter({
    porteurId: event.context.params.porteurId,
    nom: body?.nom,
    email: body?.email,
    envoyer: body?.envoyer !== false,
    par: user.email,
  })
})
