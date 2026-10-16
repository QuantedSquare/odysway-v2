// Codes de rattachement de l'Espace Voyageur (server/utils/espaceCodes.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import espaceCodes from '../../server/utils/espaceCodes.js'

const { nouveauCode, hacher, verifier } = espaceCodes
const cle = 'secret-de-test'
const demande = { userId: 'u1', email: 'autre@exemple.fr' }

test('nouveauCode : toujours 6 chiffres', () => {
  for (let i = 0; i < 200; i++) assert.match(nouveauCode(), /^\d{6}$/)
})

test('verifier : le bon code, pour le même compte et la même adresse seulement', () => {
  const hash = hacher({ ...demande, code: '042817' }, cle)
  assert.equal(verifier({ ...demande, code: '042817', hash }, cle), true)
  assert.equal(verifier({ ...demande, code: '042818', hash }, cle), false)
  assert.equal(verifier({ ...demande, userId: 'u2', code: '042817', hash }, cle), false)
  assert.equal(verifier({ ...demande, email: 'x@exemple.fr', code: '042817', hash }, cle), false)
  assert.equal(verifier({ ...demande, code: '42817', hash }, cle), false)
  assert.equal(verifier({ ...demande, code: null, hash }, cle), false)
})
