// Rapprochement d'un RDV Cal.com capturé et du deal qu'AC crée pour lui
// (server/utils/rattachementRdv.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import rattachementRdv from '../../server/utils/rattachementRdv.js'

const { emailNormalise, uidReservation, estStageRdv, dansLaFenetre, peutAvoirUneCapture, choisirDeal, choisirCapture } = rattachementRdv

const CAPTURE = '2026-10-16T10:00:00Z'
const h = n => new Date(Date.parse(CAPTURE) + n * 3600_000).toISOString()
const deal = (id, creeA, stage = 'RDV Calendly Pris', pipeline_id = 1) => ({ id, created_at: h(creeA), stage, pipeline_id })

test('email en minuscules ; rien d\'autre ne passe', () => {
  assert.equal(emailNormalise('  Claire.Dupont@Exemple.FR '), 'claire.dupont@exemple.fr')
  assert.equal(emailNormalise('pas-un-email'), null)
  assert.equal(emailNormalise('a@b'), null)
  assert.equal(emailNormalise(''), null)
  assert.equal(emailNormalise(null), null)
  assert.equal(emailNormalise(`${'a'.repeat(250)}@b.fr`), null)
})

test('uid de réservation : lettres, chiffres, tirets', () => {
  assert.equal(uidReservation('3xQ2dN8sYgV7kLm4'), '3xQ2dN8sYgV7kLm4')
  assert.equal(uidReservation('abc'), null)
  assert.equal(uidReservation('<script>'), null)
  assert.equal(uidReservation(undefined), null)
})

test('stage RDV, casse et accents ignorés', () => {
  assert.equal(estStageRdv('RDV Calendly Pris'), true)
  assert.equal(estStageRdv('rdv calendly pris'), true)
  assert.equal(estStageRdv('Nouveaux - À contacter'), false)
  assert.equal(estStageRdv(null), false)
})

test('fenêtre : deal né de 2 h avant à 24 h après la réservation', () => {
  assert.equal(dansLaFenetre(h(0), CAPTURE), true)
  assert.equal(dansLaFenetre(h(-2), CAPTURE), true)
  assert.equal(dansLaFenetre(h(-2.1), CAPTURE), false)
  assert.equal(dansLaFenetre(h(24), CAPTURE), true)
  assert.equal(dansLaFenetre(h(25), CAPTURE), false)
  assert.equal(dansLaFenetre('n\'importe quoi', CAPTURE), false)
})

test('deal à rattacher : RDV, né dans la fenêtre, pipelines suivies ; le plus proche', () => {
  assert.equal(choisirDeal([
    deal(1, -400), // deal existant déplacé en RDV : il garde son origine
    deal(2, 0.1, 'Nouveaux - À contacter'), // né le même jour, mais pas en RDV
    deal(3, 0.2, 'RDV Calendly Pris', 6), // pipeline Test
    deal(4, 3),
    deal(5, 0.05),
  ], CAPTURE)?.id, 5)
  assert.equal(choisirDeal([deal(1, -400)], CAPTURE), null)
  assert.equal(choisirDeal([], CAPTURE), null)
  assert.equal(choisirDeal(null, CAPTURE), null)
})

test('capture d\'un deal : la plus proche de sa création, dans la fenêtre', () => {
  const d = deal(9, 0.1)
  const captures = [
    { id: 1, capture_le: h(-30) }, // trop ancienne
    { id: 2, capture_le: h(-3) },
    { id: 3, capture_le: CAPTURE },
  ]
  assert.equal(choisirCapture(captures, d)?.id, 3)
  assert.equal(choisirCapture([{ id: 1, capture_le: h(-30) }], d), null)
  // Un deal hors du stage RDV n'attend aucune capture.
  assert.equal(choisirCapture(captures, deal(9, 0.1, 'Nouveaux - À contacter')), null)
})

test('un webhook sur un vieux deal ne cherche pas de capture', () => {
  const maintenant = Date.parse('2026-10-16T10:00:00Z')
  assert.equal(peutAvoirUneCapture('2026-10-10T10:00:00Z', maintenant), true)
  assert.equal(peutAvoirUneCapture('2026-08-01T10:00:00Z', maintenant), false)
  assert.equal(peutAvoirUneCapture(undefined, maintenant), false)
})
