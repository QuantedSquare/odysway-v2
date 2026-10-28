// Commercial d'une vente, changé depuis Ulysse (server/utils/commercialDeal.js).
// `npm run test:unit`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import commercialDeal from '../../server/utils/commercialDeal.js'

const { listeCommerciaux, trouverCommercial, colonnesMiroir, noteCommercial } = commercialDeal

const users = [
  { id: '7', firstName: 'Lucie', lastName: 'Crevel', email: 'lucie@odysway.com' },
  { id: '3', firstName: 'Coralie', lastName: 'Terminal', email: 'coralie@odysway.com' },
  { id: '1', firstName: '', lastName: '', email: 'api@odysway.com' },
]

test('les commerciaux attribuables ont un nom, triés, au format du miroir', () => {
  assert.deepEqual(listeCommerciaux(users).map(u => u.nom), ['Coralie Terminal', 'Lucie Crevel'])
  assert.deepEqual(listeCommerciaux(null), [])
})

test('le commercial visé existe dans AC, sinon rien', () => {
  assert.equal(trouverCommercial(users, 7).nom, 'Lucie Crevel')
  assert.equal(trouverCommercial(users, '1'), null)
  assert.equal(trouverCommercial(users, '99'), null)
})

test('le miroir reçoit l\'identifiant et le nom, comme le webhook les écrit', () => {
  assert.deepEqual(colonnesMiroir(trouverCommercial(users, '3')), { owner_id: '3', seller: 'Coralie Terminal' })
})

test('la note AC dit qui a changé quoi', () => {
  assert.equal(noteCommercial({ avant: 'Lucie Crevel', apres: 'Coralie Terminal', auteur: 'linda@odysway.com' }),
    'Commercial changé depuis Ulysse par linda@odysway.com : Lucie Crevel → Coralie Terminal')
  assert.match(noteCommercial({ avant: null, apres: 'X', auteur: 'a' }), /aucun → X/)
})
