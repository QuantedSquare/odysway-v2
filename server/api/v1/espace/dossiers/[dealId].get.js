import { defineEventHandler, setResponseHeaders } from 'h3'

// Détail d'un dossier du compte : voyage, voyageurs, groupe, paiements.
//
//   GET /api/v1/espace/dossiers/:dealId   Authorization: Bearer <jeton Supabase>
//
// 404 pour tout dossier hors du compte — jamais 403, qui confirmerait qu'il
// existe. Le titulaire voit les montants, l'historique et le lien de paiement ;
// un voyageur invité ne voit que le voyage et les noms.

const historique = ({ stripe, alma }) => {
  const lignes = [
    ...(stripe.paiements || []).map(p => ({ ...p, via: 'Stripe' })),
    ...(alma.paiements || []).map(p => ({ ...p, via: 'Alma' })),
  ]
  return {
    complet: stripe.disponible && alma.disponible,
    paiements: lignes
      .filter(p => p.statut === 'paye' || p.statut === 'en_attente')
      .map(p => ({ le: p.le, montant: p.montant, rembourse: p.rembourse || 0, moyen: p.moyen || null, statut: p.statut, via: p.via }))
      .sort((a, b) => String(a.le).localeCompare(String(b.le))),
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, { 'cache-control': 'no-store, private' })
  const client = await espaceAuth.requireClient(event)
  const dossier = await espaceDossiers.dossierDuCompte(client, event.context.params.dealId)
  const { deal, role, reservation } = dossier
  const titulaire = role === 'titulaire'

  if (titulaire) await espaceDossiers.voyageursAJour([deal])

  const [{ data: fiche }, voyageurs, compagnons, paiements, completudes, documents] = await Promise.all([
    supabase.from('activecampaign_clients').select('firstname, lastname').eq('contact', deal.contact).maybeSingle(),
    espaceDossiers.voyageursDuDossier(deal.id),
    espaceDossiers.compagnonsDuDepart(dossier),
    titulaire ? paiementsLecture.lirePaiements(deal.id, 'espace') : Promise.resolve(null),
    espaceProfils.completudesDuDossier(dossier),
    espaceDocuments.documentsDesDossiers(client, [dossier]),
  ])

  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  const resume = espaceVoyageur.resumeDossier(dossier, aujourdhui, { contact: fiche })

  // Le lien de paiement existant du tunnel : la réservation porte le dossier.
  const lienPaiement = titulaire && reservation && resume.paiement?.reste > 0
    ? `/checkout?type=balance&booked_id=${reservation.id}&step=1`
    : null

  // Corriger un voyageur : fermé si les billets sont émis ou le départ proche.
  const verrou = titulaire
    ? espaceCorrection.verrouCorrection({ billetsAchetes: deal.flight_ticket_bought, depart: resume.depart, aujourdhui })
    : null

  return {
    ...resume,
    correction: titulaire
      ? { possible: !verrou, verrou, message: verrou ? espaceCorrection.MESSAGES_VERROU[verrou] : null }
      : null,
    lienPaiement,
    carnet: deal.travel_book || null,
    documents: documents.get(Number(deal.id)) || [],
    paiements: paiements ? historique(paiements) : null,
    voyageurs: voyageurs.map((v) => {
      // Le titulaire n'a pas d'invitation : sa place est celle qui porte son nom.
      const moi = v.user_id === client.id || (titulaire && v.is_holder)
      return {
        slot: v.slot,
        prenom: v.firstname,
        // Un invité ne lit que prénom + initiale des autres voyageurs.
        nom: titulaire || moi ? v.lastname : (v.lastname ? `${v.lastname.charAt(0)}.` : null),
        titulaire: v.is_holder,
        moi,
        visibleGroupe: v.visible_groupe,
        // Qui peut décider de la visibilité : la personne si elle a un compte,
        // sinon le titulaire pour elle (enfant, voyageur sans email).
        peutChangerVisibilite: moi || (titulaire && !v.user_id),
        peutModifierProfil: espaceProfil.peutModifier({ place: v, clientId: client.id, role }),
        // Le titulaire voit si chaque profil est complet, jamais son contenu ;
        // un invité ne voit que le sien.
        profil: titulaire || moi
          ? (({ complet, manques, expireTropTot }) => ({ complet, manques, expireTropTot }))(completudes[v.id] || espaceProfil.completude(null))
          : null,
        ...(titulaire
          ? {
              invitation: v.user_id ? 'rejoint' : v.email ? 'envoyee' : null,
              email: v.email,
              peutInviter: !v.user_id && !v.is_holder,
              dateNaissance: v.birthdate,
              // « C'est moi » : place désignée à la main, ou désignable.
              titulaireChoisi: v.holder_manuel,
              peutSeDesigner: espaceVoyageur.peutSeDesigner({ place: v, clientId: client.id, clientEmail: client.email }),
            }
          : {}),
      }
    }),
    compagnons,
  }
})
