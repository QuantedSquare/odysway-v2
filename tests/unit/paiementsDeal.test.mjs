// Résumé des paiements Stripe et Alma d'un deal (server/utils/paiementsDeal.js).
// `npm run test:unit`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import paiementsDeal from '../../server/utils/paiementsDeal.js'

const { resumerStripe, resumerAlma, dealDuPaiementAlma } = paiementsDeal

const pi = (o = {}) => ({
  id: 'pi_1', status: 'succeeded', amount: 336000, amount_received: 336000, created: 1758700000,
  payment_method_types: ['customer_balance', 'card'],
  latest_charge: { amount_refunded: 0, payment_method_details: { type: 'card' }, billing_details: { email: 'payeur@example.fr' } },
  ...o,
})

test('Stripe : carte payée, encaissée en euros', () => {
  const r = resumerStripe([pi()])
  assert.equal(r.paiements[0].statut, 'paye')
  assert.equal(r.paiements[0].moyen, 'carte')
  assert.equal(r.paiements[0].payeur, 'payeur@example.fr')
  assert.equal(r.encaisse, 3360)
  assert.equal(r.enAttente, 0)
})

test('Stripe : virement en attente de fonds (deal 16198), compté à part', () => {
  const r = resumerStripe([
    pi(),
    pi({
      id: 'pi_2', status: 'requires_action', amount: 851000, amount_received: 0, latest_charge: null,
      next_action: { type: 'display_bank_transfer_instructions', display_bank_transfer_instructions: { amount_remaining: 851000 } },
    }),
  ])
  const virement = r.paiements.find(p => p.id === 'pi_2')
  assert.equal(virement.statut, 'en_attente')
  assert.equal(virement.moyen, 'virement')
  assert.equal(virement.resteAVirer, 8510)
  assert.equal(r.encaisse, 3360)
  assert.equal(r.enAttente, 8510)
})

test('Stripe : un remboursement se déduit de l\'encaissé ; abandonné et annulé ne comptent pas', () => {
  const r = resumerStripe([
    pi({ latest_charge: { amount_refunded: 50000, payment_method_details: { type: 'card' } } }),
    pi({ id: 'pi_3', status: 'requires_payment_method', amount_received: 0, latest_charge: null }),
    pi({ id: 'pi_4', status: 'canceled', amount_received: 0, latest_charge: null }),
  ])
  assert.deepEqual(r.paiements.map(p => p.statut), ['paye', 'abandonne', 'annule'])
  assert.equal(r.paiements[0].rembourse, 500)
  assert.equal(r.encaisse, 2860)
  assert.equal(r.enAttente, 0)
})

test('Alma : capturé = encaissé d\'un coup, remboursement déduit ; non démarré = abandonné', () => {
  const r = resumerAlma([
    { id: 'payment_1', state: 'in_progress', processing_status: 'captured', purchase_amount: 250000, installments_count: 3, created: 1758700000, refunds: [{ amount: 10000 }], customer: { email: 'alma@example.fr' } },
    { id: 'payment_2', state: 'not_started', processing_status: 'not_started', purchase_amount: 250000, installments_count: 3, created: 1758600000 },
  ])
  assert.deepEqual(r.paiements.map(p => [p.id, p.statut]), [['payment_2', 'abandonne'], ['payment_1', 'paye']])
  assert.equal(r.paiements[1].moyen, 'alma 3x')
  assert.equal(r.paiements[1].payeur, 'alma@example.fr')
  assert.equal(r.encaisse, 2400)
})

test('aucun paiement : zéro encaissé, rien en attente', () => {
  assert.deepEqual(resumerStripe([]), { paiements: [], encaisse: 0, enAttente: 0 })
  assert.deepEqual(resumerAlma(null), { paiements: [], encaisse: 0, enAttente: 0 })
})

test('deal d\'un paiement Alma : `id` du deal AC, ou les clés d\'anciens formats ; rien sinon', () => {
  assert.equal(dealDuPaiementAlma({ custom_data: { id: '16198', slug: 'japon' } }), 16198)
  assert.equal(dealDuPaiementAlma({ custom_data: { dealId: 15001 } }), 15001)
  assert.equal(dealDuPaiementAlma({ custom_data: { deal_id: '14002' } }), 14002)
  assert.equal(dealDuPaiementAlma({ custom_data: { email: 'x@example.fr' } }), null)
  assert.equal(dealDuPaiementAlma({ custom_data: 'texte' }), null)
  assert.equal(dealDuPaiementAlma({}), null)
})
