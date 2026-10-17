// Règles des documents de voyage (server/utils/espaceDocument.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import espaceDocument from '../../server/utils/espaceDocument.js'

const { etatDocument, visiblePour, vueClient, nomTelechargement, trier, TYPES } = espaceDocument
const doc = (d = {}) => ({ id: 'd1', type: 'carnet', titre: 'Carnet de séjour', mime_type: 'application/pdf', taille: 1000, storage_path: 'secret/path.pdf', publie: true, publie_le: '2026-10-01T10:00:00Z', ...d })

test('etatDocument : non publié ou supprimé invisible, Bientôt avant la date', () => {
  assert.equal(etatDocument(doc({ publie: false }), '2026-10-17'), null)
  assert.equal(etatDocument(doc({ deleted_at: '2026-10-10' }), '2026-10-17'), null)
  assert.equal(etatDocument(doc({ disponible_le: '2027-02-12' }), '2026-10-17'), 'bientot')
  assert.equal(etatDocument(doc({ disponible_le: '2027-02-12' }), '2027-02-12'), 'disponible')
  assert.equal(etatDocument(doc(), '2026-10-17'), 'disponible')
})

test('visiblePour : la facture est réservée au titulaire par défaut', () => {
  assert.equal(TYPES.find(t => t.valeur === 'facture').reserveTitulaire, true)
  assert.equal(visiblePour(doc({ reserve_titulaire: true }), 'voyageur'), false)
  assert.equal(visiblePour(doc({ reserve_titulaire: true }), 'titulaire'), true)
  assert.equal(visiblePour(doc({ reserve_titulaire: false }), 'voyageur'), true)
})

test('vueClient : jamais le chemin de stockage ; Nouveau seulement si disponible et pas vu', () => {
  const v = vueClient(doc(), { aujourdhui: '2026-10-17' })
  assert.equal(JSON.stringify(v).includes('secret'), false)
  assert.equal(v.nouveau, true)
  assert.equal(v.format, 'PDF')
  assert.equal(vueClient(doc(), { aujourdhui: '2026-10-17', vu: true }).nouveau, false)
  assert.equal(vueClient(doc({ disponible_le: '2027-01-01' }), { aujourdhui: '2026-10-17' }).nouveau, false)
})

test('nomTelechargement : titre lisible, sans accent ni caractère gênant', () => {
  assert.equal(nomTelechargement(doc({ titre: 'Billets d\'avion — Népal / mars' })), 'Billets-davion-Nepal-mars.pdf')
  assert.equal(nomTelechargement(doc({ titre: '../../etc', mime_type: 'image/png' })), 'etc.png')
})

test('trier : disponibles récents en tête, puis Bientôt par date', () => {
  const l = [
    { etat: 'bientot', disponibleLe: '2027-03-01' },
    { etat: 'disponible', publieLe: '2026-09-01' },
    { etat: 'bientot', disponibleLe: '2027-02-01' },
    { etat: 'disponible', publieLe: '2026-10-01' },
  ].sort(trier)
  assert.deepEqual(l.map(x => x.publieLe || x.disponibleLe), ['2026-10-01', '2026-09-01', '2027-02-01', '2027-03-01'])
})
