// Règles du profil voyageur (server/utils/espaceProfil.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import espaceProfil from '../../server/utils/espaceProfil.js'

const { normaliserNumero, numeroValide, normaliserRegimes, completude, peutModifier, vueProfil, detecterType, scanAPurger } = espaceProfil

test('numéro de pièce : normalisé et contrôlé', () => {
  assert.equal(normaliserNumero(' 20 ab-45678 '), '20AB45678')
  assert.equal(normaliserNumero(''), null)
  assert.equal(numeroValide('20AB45678'), true)
  assert.equal(numeroValide('12'), false)
  assert.equal(numeroValide('20AB<script>'), false)
})

test('régimes : valeurs connues, « tout » exclusif', () => {
  assert.deepEqual(normaliserRegimes(['vegetarien', 'sans_gluten', 'vegetarien', 'pizza']), ['vegetarien', 'sans_gluten'])
  assert.deepEqual(normaliserRegimes(['tout', 'halal']), ['tout'])
  assert.deepEqual(normaliserRegimes(null), [])
})

test('complétude et validité 6 mois après le retour', () => {
  assert.deepEqual(completude(null).manques, ['piece', 'regime', 'urgence'])
  const p = { piece_type: 'passeport', piece_numero_chiffre: 'v1.x', piece_expiration: '2027-08-01', regimes: ['tout'], urgence_nom: 'Julien', urgence_telephone: '0600000000' }
  const c = completude(p, { retour: '2027-03-25' })
  assert.equal(c.complet, true)
  assert.equal(c.validiteRequise, '2027-09-25')
  assert.equal(c.expireTropTot, true)
  assert.equal(completude({ ...p, piece_expiration: '2030-01-01' }, { retour: '2027-03-25' }).expireTropTot, false)
})

test('peutModifier : la personne avec compte, sinon le titulaire', () => {
  assert.equal(peutModifier({ place: { user_id: 'u1' }, clientId: 'u1', role: 'voyageur' }), true)
  assert.equal(peutModifier({ place: { user_id: 'u1' }, clientId: 'u2', role: 'titulaire' }), false)
  assert.equal(peutModifier({ place: { user_id: null }, clientId: 'u2', role: 'titulaire' }), true)
  assert.equal(peutModifier({ place: { user_id: null }, clientId: 'u3', role: 'voyageur' }), false)
  assert.equal(peutModifier({ place: null, clientId: 'u1', role: 'titulaire' }), false)
})

test('vueProfil ne transmet jamais le numéro chiffré', () => {
  const v = vueProfil({ piece_type: 'passeport', piece_numero_chiffre: 'v1.secret', piece_numero_fin: '5678' })
  assert.equal(JSON.stringify(v).includes('secret'), false)
  assert.equal(v.pieceNumeroFin, '5678')
})

test('detecterType lit les octets, pas le nom', () => {
  assert.equal(detecterType(Buffer.from('%PDF-1.7 ...')).mime, 'application/pdf')
  assert.equal(detecterType(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0])).ext, 'jpg')
  assert.equal(detecterType(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])).ext, 'png')
  assert.equal(detecterType(Buffer.from([0, 0, 0, 0x18, ...Buffer.from('ftypheic')])).ext, 'heic')
  assert.equal(detecterType(Buffer.from('<html><script>')), null)
  assert.equal(detecterType(Buffer.from('MZ\x90\x00')), null)
})

test('scanAPurger : 30 jours après le retour', () => {
  assert.equal(scanAPurger({ retour: '2026-09-01', aujourdhui: '2026-10-01' }), false)
  assert.equal(scanAPurger({ retour: '2026-09-01', aujourdhui: '2026-10-02' }), true)
  assert.equal(scanAPurger({ retour: null, aujourdhui: '2030-01-01' }), false)
})

test('vueEquipe : numéro fourni en clair, libellés des régimes, urgence regroupée', () => {
  const { vueEquipe } = espaceProfil
  const p = { piece_type: 'passeport', piece_numero_chiffre: 'v1.x', piece_numero_fin: '5678', piece_expiration: '2027-08-01', regimes: ['vegetarien', 'sans_gluten'], urgence_nom: 'Julien', urgence_telephone: '06' }
  const v = vueEquipe(p, { numero: '20AB45678', retour: '2027-03-25' })
  assert.equal(v.pieceNumero, '20AB45678')
  assert.equal(JSON.stringify(v).includes('v1.x'), false)
  assert.deepEqual(v.regimes, ['Végétarien', 'Sans gluten'])
  assert.deepEqual(v.urgence, { nom: 'Julien', lien: null, telephone: '06' })
  assert.equal(v.completude.expireTropTot, true)
  assert.equal(vueEquipe(null).urgence, null)
})
