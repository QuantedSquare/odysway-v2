// File des webhooks dealUpdate (server/utils/fileDeals.js) : délais et tri des erreurs.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fileDeals from '../../server/utils/fileDeals.js'

const { delaiAvantEssai, classer, MAX_ESSAIS } = fileDeals
const axiosErr = (statut, code) => Object.assign(new Error('x'), { isAxiosError: true, code }, statut ? { response: { status: statut } } : {})
const h3Err = (statusCode, cause) => Object.assign(new Error('h3'), { statusCode, cause })

test('délais croissants, plafonnés à une heure au-delà du dernier palier', () => {
  assert.equal(delaiAvantEssai(1), 60)
  assert.equal(delaiAvantEssai(2), 120)
  assert.equal(delaiAvantEssai(MAX_ESSAIS), 3600)
  assert.equal(delaiAvantEssai(MAX_ESSAIS + 5), 3600)
})

test('panne AC (590, 5xx, 429, délai) : passagère ; 404 AC : définitive', () => {
  assert.equal(classer(axiosErr(590)), 'passagere')
  assert.equal(classer(axiosErr(503)), 'passagere')
  assert.equal(classer(axiosErr(429)), 'passagere')
  assert.equal(classer(axiosErr(null, 'ECONNABORTED')), 'passagere')
  assert.equal(classer(axiosErr(404)), 'definitive')
  assert.equal(classer(axiosErr(422)), 'definitive')
})

test('panne AC enveloppée par createError : passagère malgré un statut 400', () => {
  assert.equal(classer(h3Err(400, axiosErr(590))), 'passagere')
  assert.equal(classer(h3Err(400, axiosErr(404))), 'definitive')
  assert.equal(classer(h3Err(404)), 'definitive')
  assert.equal(classer(h3Err(500)), 'passagere') // upsert Supabase en échec
  assert.equal(classer(new Error('fetch failed')), 'passagere')
})
