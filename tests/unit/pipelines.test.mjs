// Pipelines et étapes AC posées par le code (server/utils/pipelines.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import pipelines from '../../server/utils/pipelines.js'

const { creationPortage, apresPaiement, etapePaiementNonAcheve } = pipelines

test('création : un voyage en portage naît en pipeline 7, étape « Inscription commencée »', () => {
  assert.deepEqual(creationPortage('2', true), { group: '7', stage: '87' })
  assert.deepEqual(creationPortage('27', true), { group: '7', stage: '87' })
  assert.equal(creationPortage('2', false), null)
  // Un deal de test garde l'étape DEV des prospects.
  assert.equal(creationPortage('80', true), null)
})

test('paiement : un deal en portage reste en 7, tout autre passe en Voyageurs', () => {
  assert.deepEqual(apresPaiement('7', 120000), { group: '7', stage: '84' })
  assert.deepEqual(apresPaiement('7', 0), { group: '7', stage: '85' })
  assert.deepEqual(apresPaiement('7', -500), { group: '7', stage: '85' })
  assert.deepEqual(apresPaiement('1', 120000), { group: '2', stage: '6' })
  assert.deepEqual(apresPaiement('2', 0), { group: '2', stage: '33' })
  assert.deepEqual(apresPaiement(undefined, 10), { group: '2', stage: '6' })
})

test('paiement CB non achevé : l\'étape de la pipeline du deal, rien pour un voyageur', () => {
  assert.equal(etapePaiementNonAcheve('1'), '17')
  assert.equal(etapePaiementNonAcheve('7'), '88')
  assert.equal(etapePaiementNonAcheve('2'), null)
  assert.equal(etapePaiementNonAcheve(undefined), null)
})
