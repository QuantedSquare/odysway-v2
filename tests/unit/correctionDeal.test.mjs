// Corrections d'un deal par le Docteur d'Ulysse et encaissements hors ligne
// (server/utils/correctionDeal.js). `npm run test:unit`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import correctionDeal from '../../server/utils/correctionDeal.js'

const { valeurValide, versAc, depuisAc, ecartsAvant, dealAPlat, noteCorrection, noteEncaissement, dejaEncaisse } = correctionDeal

// Deal AC fusionné avec ses champs mappés, comme le lit dealMirrorSync.lireDeal.
const dealAc = {
  id: '16198', group: '2', stage: '31', status: '0',
  departureDate: '2026-10-11', basePricePerTraveler: '280000', iso: '', includeFlight: 'Non', alreadyPaid: '336000',
}

test('seuls les champs listés se corrigent, avec une valeur du bon type', () => {
  assert.equal(valeurValide('departureDate', '2026-10-12'), true)
  assert.equal(valeurValide('departureDate', '12/10/2026'), false)
  assert.equal(valeurValide('basePricePerTraveler', 2790), true)
  assert.equal(valeurValide('basePricePerTraveler', '2790'), false)
  assert.equal(valeurValide('includeFlight', 'Oui'), false)
  assert.equal(valeurValide('stage', '33'), true)
  assert.equal(valeurValide('stage', null), false)
  assert.equal(valeurValide('iso', null), true)
  // « Perdu » exige une raison : il se pose dans AC.
  assert.equal(valeurValide('status', 2), false)
  assert.equal(valeurValide('status', 1), true)
  assert.equal(valeurValide('alreadyPaid', 100), false)
  assert.equal(valeurValide('inconnu', 'x'), false)
})

test('conversion : euros ↔ centimes, booléens ↔ Oui/Non, dates tronquées', () => {
  assert.equal(versAc('basePricePerTraveler', 2790.5), 279050)
  assert.equal(versAc('includeFlight', true), 'Oui')
  assert.equal(versAc('iso', ' JP '), 'JP')
  assert.equal(versAc('iso', null), '')
  assert.equal(depuisAc('basePricePerTraveler', '280000'), 2800)
  assert.equal(depuisAc('includeFlight', ['Oui']), true)
  assert.equal(depuisAc('includeFlight', '||Non||'), false)
  assert.equal(depuisAc('departureDate', '2026-10-11 00:00:00'), '2026-10-11')
  assert.equal(depuisAc('iso', ''), null)
  assert.equal(depuisAc('status', '0'), 0)
})

test('409 : un « avant » qui ne correspond plus à AC est un écart ; au centime près pour les euros', () => {
  assert.deepEqual(ecartsAvant([
    { cle: 'departureDate', avant: '2026-10-11' },
    { cle: 'basePricePerTraveler', avant: 2800 },
    { cle: 'iso', avant: null },
    { cle: 'stage', avant: '31' },
  ], dealAc), [])
  assert.deepEqual(ecartsAvant([{ cle: 'basePricePerTraveler', avant: 2790 }], dealAc), [{ cle: 'basePricePerTraveler', attendu: 2790, actuel: 2800 }])
  assert.deepEqual(ecartsAvant([{ cle: 'iso', avant: 'JP' }], dealAc), [{ cle: 'iso', attendu: 'JP', actuel: null }])
})

test('deal à plat pour updateDeal : valeurs AC, sans le statut (écrit à part)', () => {
  assert.deepEqual(dealAPlat([
    { cle: 'iso', apres: 'JP' },
    { cle: 'basePricePerTraveler', apres: 2790 },
    { cle: 'stage', apres: 33 },
    { cle: 'status', apres: 1 },
  ]), { iso: 'JP', basePricePerTraveler: 279000, stage: '33' })
})

test('note AC d\'une correction : qui, quelle règle, avant → après', () => {
  const note = noteCorrection({ auteur: 'lucie@odysway.com', regle: 'CHK-03', champs: [{ cle: 'iso', avant: null, apres: 'JP' }, { cle: 'includeFlight', avant: false, apres: true }] })
  assert.equal(note, 'Correction depuis Ulysse (Docteur, CHK-03) par lucie@odysway.com : ISO du pays — → JP ; Vol inclus Non → Oui')
})

test('encaissement : note lisible et marquée, retrouvée au rejeu', () => {
  const id = '4f1c2d3e-0000-4000-8000-000000000001'
  const note = noteEncaissement({ id, montant: 350, moyen: 'cheque_vacances', date: '2026-09-24', reference: 'ANCV 12', auteur: 'romain@odysway.com' })
  assert.match(note, /^Encaissement hors ligne – Chèque vacances – 350 € – reçu le 24\/09\/2026 – réf\. ANCV 12 – saisi dans Ulysse par romain@odysway\.com \[encaissement 4f1c2d3e-/)
  assert.equal(dejaEncaisse([{ note: 'Paiement CB' }, { note }], id), true)
  assert.equal(dejaEncaisse([{ note: 'Paiement CB' }], id), false)
})
