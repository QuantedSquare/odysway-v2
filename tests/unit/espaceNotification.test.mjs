// Notifications des documents de voyage (server/utils/espaceNotification.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import espaceNotification from '../../server/utils/espaceNotification.js'

const { modeNotifications, aNotifierMaintenant, listeDestinataires } = espaceNotification

test('modeNotifications : coupé sauf valeur explicite', () => {
  assert.deepEqual(modeNotifications(undefined), { mode: 'coupe', adresse: null })
  assert.deepEqual(modeNotifications('true'), { mode: 'coupe', adresse: null })
  assert.deepEqual(modeNotifications('actif'), { mode: 'actif', adresse: null })
  assert.deepEqual(modeNotifications('redirection: Recette@Odysway.com'), { mode: 'redirection', adresse: 'recette@odysway.com' })
  assert.deepEqual(modeNotifications('redirection:pas-un-email'), { mode: 'coupe', adresse: null })
})

test('aNotifierMaintenant : publié, disponible, à annoncer, pas encore annoncé', () => {
  const doc = { publie: true, notifier_clients: true, notifie_le: null, disponible_le: null }
  assert.equal(aNotifierMaintenant(doc, '2026-10-17'), true)
  assert.equal(aNotifierMaintenant({ ...doc, publie: false }, '2026-10-17'), false)
  assert.equal(aNotifierMaintenant({ ...doc, notifier_clients: false }, '2026-10-17'), false)
  assert.equal(aNotifierMaintenant({ ...doc, notifie_le: '2026-10-16T10:00:00Z' }, '2026-10-17'), false)
  assert.equal(aNotifierMaintenant({ ...doc, deleted_at: '2026-10-16' }, '2026-10-17'), false)
  assert.equal(aNotifierMaintenant({ ...doc, disponible_le: '2027-02-12' }, '2026-10-17'), false)
  assert.equal(aNotifierMaintenant({ ...doc, disponible_le: '2027-02-12' }, '2027-02-12'), true)
})

test('listeDestinataires : titulaires, invités sauf facture, sans doublon ni adresse invalide', () => {
  const deals = [{ id: 1, contact: 10 }, { id: 2, contact: 20 }, { id: 3, contact: 30 }]
  const fiches = new Map([[10, { email: 'Camille@x.fr', firstname: 'Camille' }], [20, { email: 'camille@x.fr', firstname: 'Camille' }], [30, { email: 'pas-un-email' }]])
  const voyageurs = [{ deal_id: 1, email: 'ines@x.fr', firstname: 'Inès' }, { deal_id: 9, email: 'autre@x.fr' }, { deal_id: 1, email: null }]
  assert.deepEqual(listeDestinataires({ deals, fiches, voyageurs, reserveTitulaire: false }), [
    { email: 'camille@x.fr', prenom: 'Camille', dealId: 1 },
    { email: 'ines@x.fr', prenom: 'Inès', dealId: 1 },
  ])
  assert.deepEqual(listeDestinataires({ deals, fiches, voyageurs, reserveTitulaire: true }).map(d => d.email), ['camille@x.fr'])
})

test('nouveauDocument : titres échappés, aucun jeton dans le lien', async () => {
  const { default: espaceEmails } = await import('../../server/utils/espaceEmails.js')
  const e = espaceEmails.nouveauDocument({ prenom: 'Inès', titreDocument: 'Billets <script>', titreVoyage: 'Népal & Tibet', lien: 'https://odysway.com/mon-espace/documents' })
  assert.ok(e.html.includes('Billets &lt;script&gt;'))
  assert.ok(!e.html.includes('<script>'))
  assert.ok(e.html.includes('Népal &amp; Tibet'))
  assert.equal(e.subject, 'Billets <script> — Népal & Tibet : disponible dans votre espace')
})
