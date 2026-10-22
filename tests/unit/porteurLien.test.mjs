// Jeton du lien magique de l'Espace porteur (server/utils/porteurLien.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import porteurLien from '../../server/utils/porteurLien.js'

const { signer, verifier, DUREE_S } = porteurLien
const cle = 'secret-de-test'
const porteurId = '3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b'
const t0 = Date.UTC(2026, 9, 21, 12)

test('signer puis verifier : rend le porteur et l\'expiration', () => {
  const jeton = signer(porteurId, { cle, maintenant: t0 })
  assert.match(jeton, /^[0-9a-f-]{36}\.\d+\.[A-Za-z0-9_-]{32}$/)
  assert.deepEqual(verifier(jeton, { cle, maintenant: t0 }), { porteurId, exp: t0 / 1000 + DUREE_S })
})

test('signer : l\'identifiant est normalisé, et doit être un uuid', () => {
  const jeton = signer(porteurId.toUpperCase(), { cle, maintenant: t0 })
  assert.equal(verifier(jeton, { cle, maintenant: t0 }).porteurId, porteurId)
  assert.throws(() => signer('42', { cle }))
  assert.throws(() => signer(null, { cle }))
})

test('verifier : expiré, refusé', () => {
  const jeton = signer(porteurId, { cle, maintenant: t0, dureeS: 60 })
  assert.ok(verifier(jeton, { cle, maintenant: t0 + 59_000 }))
  assert.equal(verifier(jeton, { cle, maintenant: t0 + 60_000 }), null)
})

test('verifier : une autre clé, refusé', () => {
  const jeton = signer(porteurId, { cle, maintenant: t0 })
  assert.equal(verifier(jeton, { cle: 'autre-secret', maintenant: t0 }), null)
})

test('verifier : on ne change ni le porteur ni l\'expiration sans casser la signature', () => {
  const [id, exp, sig] = signer(porteurId, { cle, maintenant: t0 }).split('.')
  const autre = '00000000-0000-4000-8000-000000000000'
  assert.equal(verifier(`${autre}.${exp}.${sig}`, { cle, maintenant: t0 }), null)
  assert.equal(verifier(`${id}.${Number(exp) + 86400}.${sig}`, { cle, maintenant: t0 }), null)
  const alteree = sig.slice(0, -1) + (sig.endsWith('A') ? 'B' : 'A')
  assert.equal(verifier(`${id}.${exp}.${alteree}`, { cle, maintenant: t0 }), null)
})

test('verifier : formes invalides, null sans lever', () => {
  for (const jeton of [undefined, null, '', 42, 'abc', `${porteurId}.123`, `${porteurId}.abc.sig`, 'x'.repeat(500), `${porteurId}.1.2.3`]) {
    assert.equal(verifier(jeton, { cle, maintenant: t0 }), null)
  }
})
