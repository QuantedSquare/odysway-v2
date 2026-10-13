// Reprise, par le tunnel, d'une réservation déjà créée.
//
// Le tunnel reprend une réservation dès qu'il connaît son booked_id : lien
// `/checkout?booked_id=…`, ou mémoire du navigateur (localStorage, une entrée
// par date de départ). L'étape « Coordonnées » écrivait alors ce qui était
// saisi sur le deal, et `activecampaign.updateDeal` en remplaçait le contact.
// Un lien partagé par une accompagnatrice et le poste d'une commerciale qui
// inscrit plusieurs clientes sur le même départ ont ainsi fait passer des deals
// déjà réglés, paiements compris, au nom d'une autre personne (16932 et 16997,
// immersion-armoni du 05/12/2026, constat du 13/10/2026).
//
// Règle :
// - même email que le titulaire : reprise normale ;
// - autre email ET autre prénom ou autre nom : c'est une autre personne, qui ne
//   reprend pas la réservation et repart sur une inscription neuve ;
// - autre email, mêmes prénom et nom (faute de frappe, autre adresse) : reprise
//   permise, mais le contact d'un deal déjà réglé ne change plus. Un email se
//   corrige alors dans AC, pas depuis le tunnel.
// Un titulaire sans prénom ni nom ne se compare pas : la reprise reste permise.
//
// PUR (tests/unit/repriseReservation.test.mjs).

const normaliserEmail = email => String(email ?? '').trim().toLowerCase()

// « Jean-Pierre », « jean pierre » et « JEAN PIERRE » désignent la même personne.
const normaliserNom = nom => String(nom ?? '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z]/g, '')

// Réglé : un paiement encaissé (alreadyPaid, en centimes), une transaction
// posée sur la ligne booked_dates, ou un deal déjà passé en Voyageurs.
const estReglee = ({ alreadyPaid, transactionId, group } = {}) =>
  Number(alreadyPaid) > 0 || !!transactionId || String(group ?? '') === '2'

/**
 * @param {object} p
 * @param {{ email?: string, firstName?: string, lastName?: string }} p.titulaire contact AC du deal
 * @param {{ email?: string, firstname?: string, lastname?: string }} p.saisie étape « Coordonnées »
 * @param {boolean} p.reglee
 * @returns {{ reprenable: boolean, raison: string|null, contactVerrouille: boolean }}
 */
const analyser = ({ titulaire = {}, saisie = {}, reglee = false }) => {
  if (!saisie.email || normaliserEmail(saisie.email) === normaliserEmail(titulaire.email)) {
    return { reprenable: true, raison: null, contactVerrouille: false }
  }
  const prenom = normaliserNom(titulaire.firstName)
  const nom = normaliserNom(titulaire.lastName)
  const autrePersonne = (!!prenom && prenom !== normaliserNom(saisie.firstname))
    || (!!nom && nom !== normaliserNom(saisie.lastname))
  if (autrePersonne) return { reprenable: false, raison: 'autre_personne', contactVerrouille: true }
  return { reprenable: true, raison: null, contactVerrouille: !!reglee }
}

// Champs de `updateDeal` qui touchent le contact du deal.
const CHAMPS_CONTACT = ['email', 'firstname', 'lastname', 'phone', 'isoContact']

const sansContact = corps => Object.fromEntries(
  Object.entries(corps || {}).filter(([cle]) => !CHAMPS_CONTACT.includes(cle)),
)

export default { normaliserEmail, normaliserNom, estReglee, analyser, CHAMPS_CONTACT, sansContact }
