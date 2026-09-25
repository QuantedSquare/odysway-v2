// Délai et nouvelles tentatives des appels à AC (server/utils/acReessais.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import acReessais from '../../server/utils/acReessais.js'

const { reessaisPermis, avecReessais } = acReessais
const erreur = (statut, code) => Object.assign(new Error('x'), statut ? { response: { status: statut } } : { code })

test('429 : rejoué quelle que soit la méthode ; 503 et délai : GET et PUT seulement', () => {
  assert.equal(reessaisPermis('post', erreur(429)), 3)
  assert.equal(reessaisPermis('get', erreur(503)), 2)
  assert.equal(reessaisPermis('put', erreur(504)), 2)
  assert.equal(reessaisPermis('put', erreur(null, 'ECONNABORTED')), 2)
  assert.equal(reessaisPermis('post', erreur(503)), 0)
  assert.equal(reessaisPermis('post', erreur(null, 'ECONNABORTED')), 0)
  assert.equal(reessaisPermis('get', erreur(404)), 0)
  assert.equal(reessaisPermis('get', erreur(422)), 0)
})

// Un appel qui échoue `echecs` fois avec `err`, puis réussit ; compte ses exécutions.
const appelQuiEchoue = (echecs, err) => {
  const appel = () => {
    appel.n += 1
    return appel.n <= echecs ? Promise.reject(err) : Promise.resolve('ok')
  }
  appel.n = 0
  return appel
}

test('un 503 passager est absorbé ; un 404 remonte aussitôt ; au-delà des essais, l\'erreur remonte', async () => {
  const attentes = []
  const pause = (ms) => {
    attentes.push(ms)
    return Promise.resolve()
  }
  assert.equal(await avecReessais(appelQuiEchoue(2, erreur(503)), 'get', pause), 'ok')
  assert.deepEqual(attentes, [400, 800])

  const introuvable = appelQuiEchoue(9, erreur(404))
  await assert.rejects(avecReessais(introuvable, 'get', pause))
  assert.equal(introuvable.n, 1)

  const panneGet = appelQuiEchoue(9, erreur(503))
  await assert.rejects(avecReessais(panneGet, 'put', pause))
  assert.equal(panneGet.n, 3)

  const pannePost = appelQuiEchoue(9, erreur(503))
  await assert.rejects(avecReessais(pannePost, 'post', pause))
  assert.equal(pannePost.n, 1)
})
