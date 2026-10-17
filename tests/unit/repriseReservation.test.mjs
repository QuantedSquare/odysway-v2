// Reprise d'une réservation existante par le tunnel
// (server/utils/repriseReservation.js). `npm run test:unit`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import repriseReservation from '../../server/utils/repriseReservation.js'

const { normaliserNom, estReglee, analyser, sansContact } = repriseReservation

// Titulaires réels du constat du 13/10/2026 (immersion-armoni, 05/12/2026).
const sylvie = { email: 'sylvie_horvath@yahoo.com', firstName: 'Sylvie ', lastName: 'Horvath ' }
const isabelle = { email: 'isabelle.olagnon@club-internet.fr', firstName: 'Isabelle ', lastName: 'Olagnon ' }
const marion = { email: 'marion.aulong@gmail.com', firstName: 'Marion', lastName: 'Aulong' }

test('une autre personne ne reprend jamais une réservation, réglée ou non', () => {
  // Deal 16932 réglé par Sylvie, repris par Cheyenne via le lien partagé.
  assert.deepEqual(
    analyser({ titulaire: sylvie, saisie: { email: 'lesagecheyenne@gmail.com', firstname: 'Cheyenne', lastname: 'Lesage' }, reglee: true }),
    { reprenable: false, raison: 'autre_personne', contactVerrouille: true },
  )
  // Deal 16997 réglé par Isabelle, repris pour Manon depuis le poste d'une commerciale.
  assert.equal(analyser({ titulaire: isabelle, saisie: { email: 'manon-mizera@orange.fr', firstname: 'Manon', lastname: 'Mizera' }, reglee: true }).reprenable, false)
  // Deal 16932 encore non réglé (inscription de test de l'accompagnatrice), repris par Magali.
  assert.equal(analyser({ titulaire: marion, saisie: { email: 'magali.auret@gmail.com', firstname: 'Magali', lastname: 'AURET' }, reglee: false }).reprenable, false)
  // Même nom, autre prénom (conjoint inscrit depuis le même ordinateur).
  assert.equal(analyser({ titulaire: marion, saisie: { email: 'paul.aulong@gmail.com', firstname: 'Paul', lastname: 'Aulong' } }).reprenable, false)
})

test('la titulaire reprend sa réservation, même en changeant la casse ou les espaces', () => {
  assert.deepEqual(
    analyser({ titulaire: sylvie, saisie: { email: ' Sylvie_Horvath@Yahoo.com ', firstname: 'Sylvie', lastname: 'Horvath' }, reglee: true }),
    { reprenable: true, raison: null, contactVerrouille: false },
  )
  // Sans email saisi (étape qui ne touche pas au contact) : rien à vérifier.
  assert.equal(analyser({ titulaire: sylvie, saisie: {}, reglee: true }).reprenable, true)
})

test('autre email, mêmes prénom et nom : reprise permise, contact figé si le deal est réglé', () => {
  const saisie = { email: 'sylvie.horvath@gmail.com', firstname: 'SYLVIE', lastname: 'horváth' }
  assert.deepEqual(analyser({ titulaire: sylvie, saisie, reglee: false }), { reprenable: true, raison: null, contactVerrouille: false })
  assert.deepEqual(analyser({ titulaire: sylvie, saisie, reglee: true }), { reprenable: true, raison: null, contactVerrouille: true })
})

test('un titulaire sans prénom ni nom ne se compare pas', () => {
  const anonyme = { email: 'contact@exemple.fr', firstName: '', lastName: '' }
  const saisie = { email: 'autre@exemple.fr', firstname: 'Jeanne', lastname: 'Martin' }
  assert.deepEqual(analyser({ titulaire: anonyme, saisie, reglee: false }), { reprenable: true, raison: null, contactVerrouille: false })
  assert.deepEqual(analyser({ titulaire: anonyme, saisie, reglee: true }), { reprenable: true, raison: null, contactVerrouille: true })
  // Seul le nom est connu : il suffit à reconnaître une autre personne.
  assert.equal(analyser({ titulaire: { email: 'a@b.fr', lastName: 'Martin' }, saisie: { email: 'c@d.fr', firstname: 'Jeanne', lastname: 'Durand' } }).reprenable, false)
})

test('les noms se comparent sans accents, casse, espaces ni tirets', () => {
  assert.equal(normaliserNom(' Jean-Pierre '), normaliserNom('JEAN PIERRE'))
  assert.equal(normaliserNom('Morîhat'), 'morihat')
  assert.equal(normaliserNom('Poulain épouse Jalle '), 'poulainepousejalle')
  assert.equal(normaliserNom(null), '')
})

test('une réservation est réglée dès un paiement, une transaction ou un passage en Voyageurs', () => {
  assert.equal(estReglee({ alreadyPaid: '46200' }), true)
  assert.equal(estReglee({ transactionId: 'pi_3UL0C1AYZjtHS4WQ0bCeiK4a' }), true)
  assert.equal(estReglee({ group: '2' }), true)
  assert.equal(estReglee({ alreadyPaid: '0', transactionId: null, group: '1' }), false)
  assert.equal(estReglee(), false)
})

test('sansContact retire les champs qui changeraient le contact du deal', () => {
  const corps = { nbTravelers: 1, nbAdults: 1, email: 'x@y.fr', firstname: 'X', lastname: 'Y', phone: '+33', isoContact: 'FR', utm: '' }
  assert.deepEqual(sansContact(corps), { nbTravelers: 1, nbAdults: 1, utm: '' })
  assert.deepEqual(sansContact(undefined), {})
})
