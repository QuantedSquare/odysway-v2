// Chiffrement des numéros de pièce (server/utils/espaceChiffrement.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import espaceChiffrement from '../../server/utils/espaceChiffrement.js'

const { chiffrer, dechiffrer } = espaceChiffrement
const cle = randomBytes(32)

test('aller-retour, et un IV différent à chaque fois', () => {
  const a = chiffrer('20AB45678', cle)
  const b = chiffrer('20AB45678', cle)
  assert.notEqual(a, b)
  assert.ok(a.startsWith('v1.'))
  assert.equal(dechiffrer(a, cle), '20AB45678')
})

test('refuse une valeur altérée ou une autre clé', () => {
  const v = chiffrer('20AB45678', cle)
  const morceaux = v.split('.')
  const dernier = morceaux[3]
  morceaux[3] = (dernier[0] === 'A' ? 'B' : 'A') + dernier.slice(1)
  assert.throws(() => dechiffrer(morceaux.join('.'), cle))
  assert.throws(() => dechiffrer(v, randomBytes(32)))
  assert.throws(() => dechiffrer('n-importe-quoi', cle))
})
