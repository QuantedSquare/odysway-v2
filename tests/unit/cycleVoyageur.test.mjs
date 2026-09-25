// Étape d'un voyageur selon les dates de son voyage (server/utils/cycleVoyageur.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import cycleVoyageur from '../../server/utils/cycleVoyageur.js'

const { etapeVoyageurAttendue } = cycleVoyageur
const voyage = { departureDate: '2026-10-11', returnDate: '2026-10-24' }

test('soldé : « Voyage en cours » au départ, « Retour Client » le lendemain du retour', () => {
  assert.equal(etapeVoyageurAttendue({ ...voyage, stage: '33', aujourdhui: '2026-10-10' }), null)
  assert.equal(etapeVoyageurAttendue({ ...voyage, stage: '33', aujourdhui: '2026-10-11' }), '16')
  assert.equal(etapeVoyageurAttendue({ ...voyage, stage: '16', aujourdhui: '2026-10-24' }), null)
  assert.equal(etapeVoyageurAttendue({ ...voyage, stage: '16', aujourdhui: '2026-10-25' }), '11')
  // Cron manqué pendant tout le voyage : directement au retour.
  assert.equal(etapeVoyageurAttendue({ ...voyage, stage: '33', aujourdhui: '2026-11-02' }), '11')
})

test('solde dû, annulation, dates absentes ou incohérentes : on ne touche à rien', () => {
  for (const stage of ['6', '31', '7', '71', '11']) {
    assert.equal(etapeVoyageurAttendue({ ...voyage, stage, aujourdhui: '2026-10-15' }), null, stage)
  }
  assert.equal(etapeVoyageurAttendue({ stage: '33', departureDate: null, returnDate: '2026-10-24', aujourdhui: '2026-10-15' }), null)
  assert.equal(etapeVoyageurAttendue({ stage: '33', departureDate: '2026-10-24', returnDate: '2026-10-11', aujourdhui: '2026-10-15' }), null)
  assert.equal(etapeVoyageurAttendue({ stage: '33', departureDate: '2026-10-11 00:00:00', returnDate: '2026-10-24', aujourdhui: '2026-10-12' }), '16')
})
