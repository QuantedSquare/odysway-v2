// Règles du mot de passe de l'Espace Voyageur (app/utils/espaceMotDePasse.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chargeJeton, connexionRecente, messageErreurAuth, reglesNonRespectees } from '../../app/utils/espaceMotDePasse.js'

const jeton = charge => `x.${Buffer.from(JSON.stringify(charge)).toString('base64url')}.y`

test('reglesNonRespectees : longueur, variété, email, espaces', () => {
  assert.deepEqual(reglesNonRespectees('Montagne-Lukla-2027', 'camille@email.fr'), [])
  assert.ok(reglesNonRespectees('court', '').includes('Au moins 12 caractères'))
  assert.ok(reglesNonRespectees('aaaaaaaaaaaaaaaa', '').includes('Au moins 5 caractères différents'))
  assert.ok(reglesNonRespectees('camille.rousseau-2027!', 'camille.rousseau@email.fr').includes('Ne pas reprendre votre adresse email'))
  assert.ok(reglesNonRespectees(' Montagne-Lukla-2027', '').includes('Pas d\'espace au début ni à la fin'))
  assert.ok(reglesNonRespectees('é'.repeat(40), '').includes('Pas plus de 72 caractères'))
})

test('chargeJeton lit un JWT, y compris des caractères accentués', () => {
  assert.deepEqual(chargeJeton(jeton({ nom: 'Hélène' })), { nom: 'Hélène' })
  assert.equal(chargeJeton('abc'), null)
  assert.equal(chargeJeton(null), null)
})

test('connexionRecente : âge de la dernière authentification, pas du jeton', () => {
  const maintenant = 1_800_000_000_000
  const il_y_a = min => Math.floor((maintenant - min * 60_000) / 1000)
  assert.equal(connexionRecente(jeton({ amr: [{ method: 'otp', timestamp: il_y_a(3) }] }), maintenant), true)
  assert.equal(connexionRecente(jeton({ amr: [{ method: 'oauth', timestamp: il_y_a(30) }] }), maintenant), false)
  assert.equal(connexionRecente(jeton({ amr: [{ method: 'oauth', timestamp: il_y_a(30) }, { method: 'otp', timestamp: il_y_a(2) }] }), maintenant), true)
  assert.equal(connexionRecente(jeton({}), maintenant), false)
})

test('messageErreurAuth traduit les codes de Supabase Auth', () => {
  assert.match(messageErreurAuth({ code: 'weak_password', reasons: ['pwned'] }), /fuites/)
  assert.match(messageErreurAuth({ code: 'weak_password', reasons: ['length'] }), /12 caractères/)
  assert.match(messageErreurAuth({ code: 'weak_password', reasons: ['characters'] }), /minuscules, majuscules, chiffres et symboles/)
  assert.equal(messageErreurAuth({ code: 'invalid_credentials' }), 'Email ou mot de passe incorrect.')
  assert.match(messageErreurAuth({ status: 429 }), /Trop de tentatives/)
  assert.match(messageErreurAuth({ code: 'reauthentication_needed' }), /confirmez/)
})

test('dePrenom : élision devant voyelle et h', async () => {
  const { dePrenom } = await import('../../app/utils/espaceTexte.js')
  assert.equal(dePrenom('Inès'), 'd\'Inès')
  assert.equal(dePrenom('Hélène'), 'd\'Hélène')
  assert.equal(dePrenom('Paul'), 'de Paul')
  assert.equal(dePrenom(''), 'de ce voyageur')
})
