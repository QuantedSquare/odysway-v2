// Correction d'un voyageur et « C'est moi » (server/utils/espaceCorrection.js,
// server/utils/espaceVoyageur.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import espaceCorrection from '../../server/utils/espaceCorrection.js'
import espaceVoyageur from '../../server/utils/espaceVoyageur.js'

const {
  validerIdentite, verrouCorrection, identiteDe, memeIdentite, personneChangee,
  ageEnJeu, champAc, assuranceSouscrite, noteCorrection, caseCochee,
} = espaceCorrection
const { voyageursDuDeal, slotTitulaireChoisi, peutSeDesigner, lireVoyageur } = espaceVoyageur

const AUJ = '2026-10-22'

test('validerIdentite : nettoie les espaces, garde accents, tirets et apostrophes', () => {
  const { identite, erreurs } = validerIdentite({ prenom: '  Jean   Marc ', nom: 'd\'Ormesson-Lefèvre', dateNaissance: '1979-06-12' }, { aujourdhui: AUJ })
  assert.deepEqual(erreurs, {})
  assert.deepEqual(identite, { prenom: 'Jean Marc', nom: 'd\'Ormesson-Lefèvre', dateNaissance: '1979-06-12' })
})

test('validerIdentite : refuse `_` (séparateur AC), chiffres, vide et longueur', () => {
  const r = validerIdentite({ prenom: 'Jean_Paul', nom: 'Dupont2', dateNaissance: '1979-06-12' }, { aujourdhui: AUJ })
  assert.equal(r.identite, null)
  assert.ok(r.erreurs.prenom)
  assert.ok(r.erreurs.nom)
  assert.equal(validerIdentite({ prenom: ' ', nom: 'X', dateNaissance: '1979-06-12' }, { aujourdhui: AUJ }).erreurs.prenom, 'Champ requis.')
  assert.match(validerIdentite({ prenom: 'A'.repeat(51), nom: 'X', dateNaissance: '1979-06-12' }, { aujourdhui: AUJ }).erreurs.prenom, /50/)
  assert.match(validerIdentite({ prenom: 'A', nom: 'B'.repeat(81), dateNaissance: '1979-06-12' }, { aujourdhui: AUJ }).erreurs.nom, /80/)
  assert.equal(validerIdentite({ prenom: 42, nom: 'X', dateNaissance: '1979-06-12' }, { aujourdhui: AUJ }).erreurs.prenom, 'Champ requis.')
})

test('validerIdentite : date réelle, passée, vraisemblable', () => {
  const date = d => validerIdentite({ prenom: 'A', nom: 'B', dateNaissance: d }, { aujourdhui: AUJ }).erreurs.dateNaissance
  assert.equal(date('1980-02-30'), 'Date invalide.')
  assert.equal(date('12/06/1979'), 'Date invalide.')
  assert.equal(date(''), 'Date invalide.')
  assert.equal(date('2026-10-23'), 'Cette date est dans le futur.')
  assert.equal(date('1890-01-01'), 'Cette date paraît invraisemblable.')
  assert.equal(date('2026-10-22'), undefined)
})

test('verrouCorrection : billets émis, puis J-30', () => {
  assert.equal(verrouCorrection({ billetsAchetes: '||Oui||', depart: '2027-06-01', aujourdhui: AUJ }), 'billets')
  assert.equal(verrouCorrection({ billetsAchetes: true, depart: null, aujourdhui: AUJ }), 'billets')
  assert.equal(verrouCorrection({ billetsAchetes: 'Non', depart: '2026-11-21', aujourdhui: AUJ }), null) // J-30 : encore possible
  assert.equal(verrouCorrection({ billetsAchetes: null, depart: '2026-11-20', aujourdhui: AUJ }), 'depart_proche') // J-29
  assert.equal(verrouCorrection({ billetsAchetes: null, depart: '2026-10-23', aujourdhui: AUJ }), 'depart_proche') // demain
  assert.equal(verrouCorrection({ billetsAchetes: false, depart: AUJ, aujourdhui: AUJ }), 'parti')
  assert.equal(verrouCorrection({ billetsAchetes: false, depart: '2025-05-12', aujourdhui: AUJ }), 'parti')
  assert.equal(verrouCorrection({ billetsAchetes: false, depart: null, aujourdhui: AUJ }), null)
})

test('caseCochee : formats AC et miroir', () => {
  assert.equal(caseCochee('||Oui||'), true)
  assert.equal(caseCochee(['Oui']), true)
  assert.equal(caseCochee('Non'), false)
  assert.equal(caseCochee(undefined), false)
  assert.equal(caseCochee(false), false)
})

test('champAc : format du tunnel, ISO et suite recopiés tels quels', () => {
  const id = { prenom: 'Camille', nom: 'Rousseau-Martin', dateNaissance: '1979-06-12' }
  assert.equal(champAc('Camile_Rousseau_12/06/1979_FR', id), 'Camille_Rousseau-Martin_12/06/1979_FR')
  assert.equal(champAc('Camille_Rousseau_12/06/1979_', id), 'Camille_Rousseau-Martin_12/06/1979_')
  assert.equal(champAc('Camille_Rousseau_1979-06-12_be', id), 'Camille_Rousseau-Martin_12/06/1979_be')
  // Saisie à la main sans date : l'ISO final est gardé, un nom ne l'est pas.
  assert.equal(champAc('Camille_Rousseau_FR', id), 'Camille_Rousseau-Martin_12/06/1979_FR')
  assert.equal(champAc('Camille_Rousseau', id), 'Camille_Rousseau-Martin_12/06/1979_')
  // Relu par l'espace et par Chapka (split('_') : prénom [0], nom [1]).
  const relu = champAc('X_Y_01/01/1990_FR', { prenom: 'Jean Marc', nom: 'de La Tour', dateNaissance: '1960-02-01' })
  assert.deepEqual(lireVoyageur(relu), { firstname: 'Jean Marc', lastname: 'de La Tour', birthdate: '1960-02-01', iso: 'FR' })
  assert.deepEqual(relu.split('_').slice(0, 2), ['Jean Marc', 'de La Tour'])
})

test('identiteDe et memeIdentite : ce que la page affichait contre ce qu’AC contient', () => {
  const ac = identiteDe('Camille_Rousseau_12/06/1979_FR')
  assert.deepEqual(ac, { prenom: 'Camille', nom: 'Rousseau', dateNaissance: '1979-06-12' })
  assert.equal(memeIdentite(ac, { prenom: 'Camille ', nom: 'Rousseau', dateNaissance: '1979-06-12' }), true)
  assert.equal(memeIdentite(ac, { prenom: 'Camille', nom: 'Rousseau', dateNaissance: '1979-06-13' }), false)
  assert.equal(memeIdentite(ac, { prenom: 'camille', nom: 'Rousseau', dateNaissance: '1979-06-12' }), false)
  assert.equal(memeIdentite(identiteDe('Paul_Durand'), { prenom: 'Paul', nom: 'Durand', dateNaissance: null }), true)
  assert.deepEqual(identiteDe(null), { prenom: null, nom: null, dateNaissance: null })
})

test('personneChangee : prénom ET nom différents, accents et casse ignorés', () => {
  const avant = { prenom: 'Hélène', nom: 'Lefèvre' }
  assert.equal(personneChangee(avant, { prenom: 'Helene', nom: 'Lefevre-Martin' }), false)
  assert.equal(personneChangee(avant, { prenom: 'HÉLÈNE', nom: 'LEFÈVRE' }), false)
  assert.equal(personneChangee(avant, { prenom: 'Paul', nom: 'Durand' }), true)
})

test('ageEnJeu : une date qui touche un mineur au départ revient à l’équipe', () => {
  const depart = '2027-03-14'
  const adulte = { dateNaissance: '1979-06-12' }
  assert.equal(ageEnJeu({ avant: adulte, apres: { dateNaissance: '1979-06-21' }, depart, aujourdhui: AUJ }), false)
  assert.equal(ageEnJeu({ avant: { dateNaissance: '2015-04-03' }, apres: { dateNaissance: '2015-04-03' }, depart, aujourdhui: AUJ }), false)
  assert.equal(ageEnJeu({ avant: { dateNaissance: '2015-04-03' }, apres: { dateNaissance: '2015-05-03' }, depart, aujourdhui: AUJ }), true)
  assert.equal(ageEnJeu({ avant: adulte, apres: { dateNaissance: '2010-01-01' }, depart, aujourdhui: AUJ }), true)
  // 18 ans la veille du départ : majeur ; le lendemain : mineur.
  assert.equal(ageEnJeu({ avant: adulte, apres: { dateNaissance: '2009-03-13' }, depart, aujourdhui: AUJ }), false)
  assert.equal(ageEnJeu({ avant: adulte, apres: { dateNaissance: '2009-03-15' }, depart, aujourdhui: AUJ }), true)
  assert.equal(ageEnJeu({ avant: { dateNaissance: null }, apres: { dateNaissance: '1980-01-01' }, depart, aujourdhui: AUJ }), false)
})

test('assuranceSouscrite et note AC', () => {
  assert.equal(assuranceSouscrite('Multirisque'), true)
  assert.equal(assuranceSouscrite('Aucune Assurance'), false)
  assert.equal(assuranceSouscrite(''), false)
  assert.equal(assuranceSouscrite(undefined), false)
  assert.equal(
    noteCorrection({ slot: 3, avant: 'A_B_01/01/1990_FR', apres: 'A_C_01/01/1990_FR', auteur: 'camille@x.fr' }),
    'Correction depuis l\'Espace Voyageur par camille@x.fr : Voyageur 3 « A_B_01/01/1990_FR » → « A_C_01/01/1990_FR »',
  )
})

test('slotTitulaireChoisi : la place désignée l’emporte sur le nom, si elle existe encore', () => {
  const v = voyageursDuDeal({ traveler1: 'Camille_Rousseau-Martin_12/06/1979_FR', traveler2: 'Camille_Rousseau_01/01/1950_FR' })
  const contact = { firstname: 'Camille', lastname: 'Rousseau' }
  assert.equal(slotTitulaireChoisi(v, contact, null), 2)
  assert.equal(slotTitulaireChoisi(v, contact, 1), 1)
  assert.equal(slotTitulaireChoisi(v, contact, 9), 2) // place retirée dans AC
  assert.equal(slotTitulaireChoisi(v, { firstname: 'X', lastname: 'Y' }, undefined), null)
})

test('peutSeDesigner : pas la place d’un autre compte ni d’une autre adresse invitée', () => {
  const c = { clientId: 'u1', clientEmail: 'Camille@X.fr ' }
  assert.equal(peutSeDesigner({ place: { user_id: null, email: null }, ...c }), true)
  assert.equal(peutSeDesigner({ place: { user_id: 'u1', email: null }, ...c }), true)
  assert.equal(peutSeDesigner({ place: { user_id: null, email: 'camille@x.fr' }, ...c }), true)
  assert.equal(peutSeDesigner({ place: { user_id: 'u2', email: null }, ...c }), false)
  assert.equal(peutSeDesigner({ place: { user_id: null, email: 'lea@x.fr' }, ...c }), false)
  assert.equal(peutSeDesigner({ place: null, ...c }), false)
})
