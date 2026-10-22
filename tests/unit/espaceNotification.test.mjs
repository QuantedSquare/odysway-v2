// Notifications des documents de voyage (server/utils/espaceNotification.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import espaceNotification from '../../server/utils/espaceNotification.js'

const { modeNotifications, aNotifierMaintenant, dejaTraite, listeDestinataires, regrouperAnnonce } = espaceNotification

test('modeNotifications : coupé sauf valeur explicite', () => {
  assert.deepEqual(modeNotifications(undefined), { mode: 'coupe', adresse: null })
  assert.deepEqual(modeNotifications('true'), { mode: 'coupe', adresse: null })
  assert.deepEqual(modeNotifications('actif'), { mode: 'actif', adresse: null })
  assert.deepEqual(modeNotifications('redirection: Recette@Odysway.com'), { mode: 'redirection', adresse: 'recette@odysway.com' })
  assert.deepEqual(modeNotifications('redirection:pas-un-email'), { mode: 'coupe', adresse: null })
})

test('aNotifierMaintenant : publié, disponible, pas encore annoncé', () => {
  const doc = { publie: true, notifie_le: null, disponible_le: null }
  assert.equal(aNotifierMaintenant(doc, '2026-10-17'), true)
  assert.equal(aNotifierMaintenant({ ...doc, publie: false }, '2026-10-17'), false)
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

test('dejaTraite : un envoi de recette ne vaut pas pour la production, un échec est retenté', () => {
  assert.equal(dejaTraite('envoye', 'actif'), true)
  assert.equal(dejaTraite('envoye', 'redirection'), true)
  assert.equal(dejaTraite('redirige', 'redirection'), true)
  assert.equal(dejaTraite('redirige', 'actif'), false)
  assert.equal(dejaTraite('echec', 'actif'), false)
  assert.equal(dejaTraite('ignore', 'actif'), false)
})

test('regrouperAnnonce : un email par adresse avec ses documents, couples déjà traités retirés', () => {
  const documents = [{ id: 'a', titre: 'Carnet', type: 'carnet' }, { id: 'b', titre: 'Billets', type: 'billet' }, { id: 'c', titre: 'Facture', type: 'facture' }]
  const camille = { email: 'camille@x.fr', prenom: null, dealId: 1 }
  const ines = { email: 'ines@x.fr', prenom: 'Inès', dealId: 1 }
  const destinatairesParDocument = new Map([
    ['a', [camille, ines]],
    ['b', [{ ...camille, prenom: 'Camille' }, ines]],
  ])
  const journal = [
    { document_id: 'a', email: 'ines@x.fr', statut: 'envoye' },
    { document_id: 'b', email: 'ines@x.fr', statut: 'echec' },
    { document_id: 'b', email: 'camille@x.fr', statut: 'redirige' },
  ]
  assert.deepEqual(regrouperAnnonce({ documents, destinatairesParDocument, journal, mode: 'actif' }), {
    documents: [
      { id: 'a', titre: 'Carnet', type: 'carnet', destinataires: 1 },
      { id: 'b', titre: 'Billets', type: 'billet', destinataires: 2 },
      { id: 'c', titre: 'Facture', type: 'facture', destinataires: 0 },
    ],
    destinataires: [
      { email: 'camille@x.fr', prenom: 'Camille', dealId: 1, documentIds: ['a', 'b'] },
      { email: 'ines@x.fr', prenom: 'Inès', dealId: 1, documentIds: ['b'] },
    ],
  })
  // En recette, l'envoi redirigé compte : Camille n'a plus que le carnet.
  const recette = regrouperAnnonce({ documents, destinatairesParDocument, journal, mode: 'redirection' })
  assert.deepEqual(recette.destinataires.map(d => [d.email, d.documentIds]), [['camille@x.fr', ['a']], ['ines@x.fr', ['b']]])
})

test('regrouperAnnonce : tout est déjà envoyé → personne à prévenir', () => {
  const r = regrouperAnnonce({
    documents: [{ id: 'a', titre: 'Carnet' }],
    destinatairesParDocument: new Map([['a', [{ email: 'camille@x.fr', prenom: null, dealId: 1 }]]]),
    journal: [{ document_id: 'a', email: 'camille@x.fr', statut: 'envoye' }],
    mode: 'actif',
  })
  assert.equal(r.documents[0].destinataires, 0)
  assert.deepEqual(r.destinataires, [])
})

test('nouveauxDocuments : un seul email, titres échappés, aucun jeton dans le lien', async () => {
  const { default: espaceEmails } = await import('../../server/utils/espaceEmails.js')
  const lien = 'https://odysway.com/mon-espace/documents'
  const un = espaceEmails.nouveauxDocuments({ prenom: 'Inès', titreVoyage: 'Népal & Tibet', documents: [{ titre: 'Billets <script>' }], lien })
  assert.ok(un.html.includes('Billets &lt;script&gt;'))
  assert.ok(!un.html.includes('<script>'))
  assert.ok(un.html.includes('Népal &amp; Tibet'))
  assert.ok(un.html.includes('Un nouveau document vous attend'))
  assert.equal(un.subject, 'Billets <script> — Népal & Tibet : disponible dans votre espace')

  const deux = espaceEmails.nouveauxDocuments({ prenom: null, titreVoyage: null, documents: [{ titre: 'Carnet', libelleType: 'Carnet de voyage' }, { titre: 'Billets' }], lien })
  assert.equal(deux.subject, '2 nouveaux documents : disponibles dans votre espace')
  assert.ok(deux.html.includes('De nouveaux documents vous attendent'))
  assert.equal((deux.html.match(/<li/g) || []).length, 2)
  assert.ok(deux.html.includes(`href="${lien}"`))
})
