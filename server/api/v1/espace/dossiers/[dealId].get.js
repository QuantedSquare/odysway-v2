import { defineEventHandler, setResponseHeaders } from 'h3'

// Détail d'un dossier du compte : voyage, voyageurs, groupe, paiements.
//
//   GET /api/v1/espace/dossiers/:dealId   Authorization: Bearer <jeton Supabase>
//
// 404 pour tout dossier hors du compte — jamais 403, qui confirmerait qu'il
// existe. Le titulaire voit les montants, l'historique et le lien de paiement ;
// un voyageur invité ne voit que le voyage et les noms.

// Stripe, Alma et journal hors ligne d'Ulysse, lus ensemble.
const lireHistorique = async (dealId) => {
  const [{ stripe, alma }, journal] = await Promise.all([
    paiementsLecture.lirePaiements(dealId, 'espace'),
    paiementsLecture.lireEncaissements(dealId, 'espace'),
  ])
  return { stripe, alma, journal }
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
    titulaire ? lireHistorique(deal.id) : Promise.resolve(null),
    espaceProfils.completudesDuDossier(dossier),
    espaceDocuments.documentsDesDossiers(client, [dossier]),
  ])

  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  const resume = espaceVoyageur.resumeDossier(dossier, aujourdhui, { contact: fiche })

  // Le lien de paiement existant du tunnel : la réservation porte le dossier.
  const lienPaiement = titulaire && reservation && resume.paiement?.reste > 0
    ? `/checkout?type=balance&booked_id=${reservation.id}&step=1`
    : null

  return {
    ...resume,
    lienPaiement,
    carnet: deal.travel_book || null,
    documents: documents.get(Number(deal.id)) || [],
    paiements: paiements ? espaceVoyageur.historiquePaiements(paiements, resume.paiement?.paye ?? null) : null,
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
            }
          : {}),
      }
    }),
    compagnons,
  }
})
