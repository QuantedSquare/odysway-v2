// Règles de l'Espace Voyageur (server/utils/espaceVoyageur.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import espaceVoyageur from '../../server/utils/espaceVoyageur.js'

const {
  lireVoyageur, voyageursDuDeal, slotTitulaire, nomPublic, etatVoyage,
  situationPaiement, dealVisible, motifEmailExact, normaliserEmail, emailValide,
} = espaceVoyageur

test('lireVoyageur : format du tunnel, noms composés, ISO absent', () => {
  assert.deepEqual(lireVoyageur('Camille_Rousseau_12/06/1979_FR'), { firstname: 'Camille', lastname: 'Rousseau', birthdate: '1979-06-12', iso: 'FR' })
  assert.deepEqual(lireVoyageur('Jean Marc_de La Tour_01/02/1960_'), { firstname: 'Jean Marc', lastname: 'de La Tour', birthdate: '1960-02-01', iso: null })
  assert.deepEqual(lireVoyageur('Léa _Martin_03/04/2015_be'), { firstname: 'Léa', lastname: 'Martin', birthdate: '2015-04-03', iso: 'BE' })
})

test('lireVoyageur : saisie à la main, date absente ou impossible', () => {
  assert.deepEqual(lireVoyageur('Paul_Durand'), { firstname: 'Paul', lastname: 'Durand', birthdate: null, iso: null })
  assert.equal(lireVoyageur('Paul_Durand_31/02/1980_FR').birthdate, null)
  assert.equal(lireVoyageur('   '), null)
  assert.equal(lireVoyageur(null), null)
})

test('voyageursDuDeal garde le numéro de chaque champ rempli, jusqu’à 15', () => {
  const v = voyageursDuDeal({ traveler1: 'A_B_01/01/1990_FR', traveler3: '', traveler15: 'C_D_02/02/1991_FR' })
  assert.deepEqual(v.map(x => x.slot), [1, 15])
  assert.equal(v[1].firstname, 'C')
})

test('slotTitulaire : le voyageur qui porte le nom du contact, accents et casse ignorés', () => {
  const v = voyageursDuDeal({ traveler1: 'Hélène_Lefèvre_01/01/1990_FR', traveler2: 'Camille_Rousseau_12/06/1979_FR' })
  assert.equal(slotTitulaire(v, { firstname: 'camille', lastname: 'ROUSSEAU' }), 2)
  assert.equal(slotTitulaire(v, { firstname: 'Helene', lastname: 'Lefevre' }), 1)
  assert.equal(slotTitulaire(v, { firstname: 'Paul', lastname: 'Rousseau' }), null)
  assert.equal(slotTitulaire(v, { firstname: '', lastname: '' }), null)
})

test('nomPublic : prénom et initiale seulement', () => {
  assert.equal(nomPublic('Camille', 'Rousseau'), 'Camille R.')
  assert.equal(nomPublic('Éloïse', 'Écuyer'), 'Éloïse E.')
  assert.equal(nomPublic('Camille', ''), 'Camille')
  assert.equal(nomPublic('', 'Rousseau'), null)
})

test('etatVoyage', () => {
  const v = { departureDate: '2027-03-14 00:00:00', returnDate: '2027-03-25' }
  assert.equal(etatVoyage({ ...v, aujourdhui: '2027-03-13' }), 'a_venir')
  assert.equal(etatVoyage({ ...v, aujourdhui: '2027-03-14' }), 'en_cours')
  assert.equal(etatVoyage({ ...v, aujourdhui: '2027-03-25' }), 'en_cours')
  assert.equal(etatVoyage({ ...v, aujourdhui: '2027-03-26' }), 'passe')
  assert.equal(etatVoyage({ departureDate: null, aujourdhui: '2027-03-26' }), 'sans_date')
})

test('situationPaiement : échéance J-60, retard, soldé', () => {
  const base = { totalValue: 2890, totalPaid: 870, restToPay: 2020, departureDate: '2027-03-14' }
  const a = situationPaiement({ ...base, aujourdhui: '2026-10-07' })
  assert.equal(a.statut, 'a_regler')
  assert.equal(a.echeance, '2027-01-13')
  assert.equal(a.reste, 2020)
  assert.equal(situationPaiement({ ...base, aujourdhui: '2027-01-14' }).statut, 'en_retard')
  assert.equal(situationPaiement({ ...base, restToPay: 0, aujourdhui: '2027-01-14' }).statut, 'solde')
})

test('situationPaiement : reste déduit du total et du payé, ou inconnu', () => {
  assert.equal(situationPaiement({ totalValue: 1000, totalPaid: 300, restToPay: null, departureDate: null, aujourdhui: '2026-10-07' }).reste, 700)
  assert.equal(situationPaiement({ totalValue: null, totalPaid: null, restToPay: null, departureDate: null, aujourdhui: '2026-10-07' }).statut, 'inconnu')
})

test('dealVisible : voyageurs oui, prospects seulement avec réservation, jamais corbeille ni départs', () => {
  assert.equal(dealVisible({ pipeline_id: 2, status: 'Ouvert' }), true)
  assert.equal(dealVisible({ pipeline_id: 2, status: 'Gagné' }), true)
  assert.equal(dealVisible({ pipeline_id: 2, status: 'Perdu' }), false)
  assert.equal(dealVisible({ pipeline_id: 2, status: 'Ouvert', deleted: true }), false)
  assert.equal(dealVisible({ pipeline_id: 1, status: 'Ouvert' }), false)
  assert.equal(dealVisible({ pipeline_id: 1, status: 'Ouvert' }, { aUneReservation: true }), true)
  assert.equal(dealVisible({ pipeline_id: 3, status: 'Ouvert' }, { aUneReservation: true }), false)
  assert.equal(dealVisible({ pipeline_id: 4, status: 'Ouvert' }, { aUneReservation: true }), false)
})

test('emails : normalisation, validation, motif ilike exact', () => {
  assert.equal(normaliserEmail('  Camille.R@Email.FR '), 'camille.r@email.fr')
  assert.equal(emailValide('a@b.fr'), true)
  assert.equal(emailValide('a@b'), false)
  assert.equal(motifEmailExact('prenom_nom@x.fr'), 'prenom\\_nom@x.fr')
  assert.equal(motifEmailExact('100%@x.fr'), '100\\%@x.fr')
})

test('titreVoyage retire le nom du contact collé par AC', () => {
  const { titreVoyage } = espaceVoyageur
  assert.equal(titreVoyage('Trek au pays des Sherpas - Camille Rousseau', { firstname: 'Camille', lastname: 'Rousseau' }), 'Trek au pays des Sherpas')
  assert.equal(titreVoyage('Népal', { firstname: 'Camille', lastname: 'Rousseau' }), 'Népal')
  assert.equal(titreVoyage('', {}), null)
})

test('resumeDossier : un voyageur invité ne reçoit aucun montant ni option', () => {
  const { resumeDossier } = espaceVoyageur
  const dossier = {
    deal: { id: 17037, title: 'Népal', total_value: 2890, total_paid: 870, rest_to_pay: 2020, nb_traveler: 2, seller: 'Léa', departure_date: '2027-03-01 00:00:00' },
    reservation: { booked_places: 2, is_option: true, expiracy_date: '2026-10-20' },
    date: { travel_slug: 'nepal', departure_date: '2027-03-14', return_date: '2027-03-25', is_indiv_travel: false, is_custom_travel: false },
  }
  const titulaire = resumeDossier({ ...dossier, role: 'titulaire' }, '2026-10-07')
  assert.equal(titulaire.depart, '2027-03-14') // la date du départ prime sur celle du deal
  assert.equal(titulaire.duree, 12)
  assert.equal(titulaire.groupe, true)
  assert.equal(titulaire.paiement.reste, 2020)
  assert.deepEqual(titulaire.option, { expire: '2026-10-20' })

  const invite = resumeDossier({ ...dossier, role: 'voyageur' }, '2026-10-07')
  assert.equal(invite.paiement, null)
  assert.equal(invite.option, null)
})

// Historique des paiements : Stripe, Alma et journal hors ligne d'Ulysse.
const { ligneEncaissement, historiquePaiements } = espaceVoyageur
const saisie = (x = {}) => ({ montant: 300, moyen: 'cheque_vacances', origine: 'saisie', statut: 'confirme', recu_le: '2026-10-02', ac_le: '2026-10-02T14:10:00Z', archived: false, ...x })
const reprise = (x = {}) => ({ montant: 500, moyen: 'inconnu', origine: 'reprise', statut: 'a_confirmer', recu_le: null, ac_le: null, archived: false, ...x })
const sources = (x = {}) => ({
  stripe: { disponible: true, paiements: [{ le: '2026-09-04T10:00:00Z', montant: 870, rembourse: 0, moyen: 'carte', statut: 'paye' }] },
  alma: { disponible: true, paiements: [] },
  journal: { disponible: true, lignes: [] },
  ...x,
})

test('ligneEncaissement : saisie reportée dans AC → ligne hors ligne datée du jour de réception', () => {
  assert.deepEqual(ligneEncaissement(saisie({ montant: '300.50' })), { le: '2026-10-02', montant: 300.5, rembourse: 0, moyen: 'cheque_vacances', statut: 'paye', via: 'Hors ligne' })
})

test('ligneEncaissement : archivée, pas encore dans AC ou reprise à confirmer → pas de ligne', () => {
  assert.equal(ligneEncaissement(saisie({ archived: true })), null)
  assert.equal(ligneEncaissement(saisie({ ac_le: null })), null)
  assert.equal(ligneEncaissement(reprise()), null)
  assert.equal(ligneEncaissement(reprise({ statut: 'confirme', moyen: 'inconnu' })), null)
  assert.equal(ligneEncaissement(null), null)
})

test('ligneEncaissement : reprise confirmée (moyen connu) → ligne, même sans date', () => {
  assert.deepEqual(ligneEncaissement(reprise({ statut: 'confirme', moyen: 'cheque' })), { le: null, montant: 500, rembourse: 0, moyen: 'cheque', statut: 'paye', via: 'Hors ligne' })
})

test('historiquePaiements : Stripe + chèque vacances, par date, égal à « Déjà réglé »', () => {
  const h = historiquePaiements(sources({ journal: { disponible: true, lignes: [saisie(), saisie({ montant: 150, ac_le: null })] } }), 1170)
  assert.equal(h.complet, true)
  assert.deepEqual(h.paiements.map(p => [p.via, p.montant]), [['Stripe', 870], ['Hors ligne', 300]])
  assert.equal(h.horsListe, null)
})

test('historiquePaiements : une reprise à confirmer est annoncée, jamais listée', () => {
  const h = historiquePaiements(sources({ journal: { disponible: true, lignes: [reprise()] } }), 1370)
  assert.equal(h.paiements.length, 1)
  assert.equal(h.horsListe, 500)
})

test('historiquePaiements : remboursé et paiement en attente ne comptent pas dans le reçu', () => {
  const h = historiquePaiements(sources({
    stripe: { disponible: true, paiements: [
      { le: '2026-09-04', montant: 870, rembourse: 100, moyen: 'carte', statut: 'paye' },
      { le: '2026-09-10', montant: 400, rembourse: 0, moyen: 'virement', statut: 'en_attente' },
      { le: '2026-09-11', montant: 400, rembourse: 0, moyen: 'carte', statut: 'abandonne' },
    ] },
  }), 870)
  assert.deepEqual(h.paiements.map(p => p.statut), ['paye', 'en_attente'])
  assert.equal(h.horsListe, 100)
})

test('historiquePaiements : une source illisible → incomplet, aucun écart annoncé', () => {
  const h = historiquePaiements(sources({ journal: { disponible: false, lignes: [] } }), 5000)
  assert.equal(h.complet, false)
  assert.equal(h.horsListe, null)
  assert.equal(historiquePaiements(sources(), null).horsListe, null)
  // Plus reçu que « Déjà réglé » (webhook AC en retard) : rien à annoncer.
  assert.equal(historiquePaiements(sources(), 500).horsListe, null)
})
