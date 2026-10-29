// Changement du commercial d'une vente, demandé depuis Ulysse (Mois en cours).
//
// Le commercial d'un deal, c'est son propriétaire dans ActiveCampaign. Le
// miroir Supabase le porte en deux colonnes : `owner_id` et `seller` (le nom,
// « Prénom Nom », comme le webhook et la resynchronisation l'écrivent). Les
// stats par commercial d'Ulysse lisent `seller`.
//
// PUR (tests/unit/commercialDeal.test.mjs).

/** « Prénom Nom » d'un utilisateur AC, comme dealMirrorSync.lireLibelles le compose. */
const nomUtilisateur = u => `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || null

/** Les commerciaux qu'on peut attribuer : les utilisateurs AC qui ont un nom, triés. */
const listeCommerciaux = users => (users || [])
  .map(u => ({ id: String(u.id), nom: nomUtilisateur(u), email: u.email || null }))
  .filter(u => u.nom)
  .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

/** L'utilisateur AC visé, ou `null` s'il n'existe pas (ou n'a pas de nom). */
const trouverCommercial = (users, ownerId) =>
  listeCommerciaux(users).find(u => u.id === String(ownerId)) || null

/** Colonnes du miroir à réécrire. */
const colonnesMiroir = commercial => ({ owner_id: commercial.id, seller: commercial.nom })

const noteCommercial = ({ avant, apres, auteur }) =>
  `Commercial changé depuis Ulysse par ${auteur} : ${avant || 'aucun'} → ${apres}`

export default {
  nomUtilisateur,
  listeCommerciaux,
  trouverCommercial,
  colonnesMiroir,
  noteCommercial,
}
