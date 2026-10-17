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
