// Paiements d'un deal, lus chez Stripe et chez Alma, pour le Docteur d'Ulysse.
//
// Ulysse rapproche « Total payé » d'AC de ce que les prestataires ont vraiment
// encaissé (règle ARG-04), et signale un paiement en attente (CHK-06), par
// exemple un virement Stripe dont les fonds ne sont pas arrivés.
//
// PUR : ces fonctions résument des objets déjà lus (tests/unit/paiementsDeal.test.mjs).
// Montants rendus en EUROS ; Stripe et Alma comptent en centimes.

const euros = cents => (Number.isFinite(Number(cents)) ? Math.round(Number(cents)) / 100 : 0)

// PaymentIntent → paiement. `latest_charge` doit être développée (expand) pour
// connaître le remboursé.
const paiementStripe = (pi) => {
  const charge = pi.latest_charge && typeof pi.latest_charge === 'object' ? pi.latest_charge : null
  const virement = pi.next_action?.type === 'display_bank_transfer_instructions'
    ? pi.next_action.display_bank_transfer_instructions
    : null
  const type = charge?.payment_method_details?.type
  const moyen = virement || type === 'customer_balance' ? 'virement' : type === 'card' ? 'carte' : (type || null)

  let statut
  if (pi.status === 'succeeded') statut = 'paye'
  else if (pi.status === 'processing' || (pi.status === 'requires_action' && virement)) statut = 'en_attente'
  else if (pi.status === 'canceled') statut = 'annule'
  else statut = 'abandonne' // requires_payment_method, requires_confirmation, requires_action sans virement

  return {
    id: pi.id,
    statut,
    moyen,
    montant: euros(pi.amount),
    encaisse: statut === 'paye' ? euros(pi.amount_received) : 0,
    rembourse: euros(charge?.amount_refunded || 0),
    // Virement en attente : ce qui reste à recevoir sur le compte de virement.
    resteAVirer: virement ? euros(virement.amount_remaining) : null,
    le: pi.created ? new Date(pi.created * 1000).toISOString() : null,
    // Qui a payé : le Docteur le compare au contact du deal (PRE-06).
    payeur: charge?.billing_details?.email || pi.receipt_email || null,
  }
}

// Paiement Alma → paiement. Alma verse le montant d'un coup au marchand dès la
// capture ; les échéances ne regardent que le client.
const paiementAlma = (p) => {
  const rembourse = (p.refunds || []).reduce((t, r) => t + (Number(r.amount) || 0), 0)
  let statut
  if (p.processing_status === 'captured' || ['in_progress', 'paid'].includes(p.state)) statut = 'paye'
  else if (['canceled', 'cancelled'].includes(p.processing_status) || p.state === 'canceled') statut = 'annule'
  else if (['not_started', 'scored_no'].includes(p.state) || p.processing_status === 'failed') statut = 'abandonne'
  else statut = 'en_attente'
  return {
    id: p.id,
    statut,
    moyen: `alma ${p.installments_count || '?'}x`,
    montant: euros(p.purchase_amount),
    encaisse: statut === 'paye' ? euros(p.purchase_amount) : 0,
    rembourse: euros(rembourse),
    resteAVirer: null,
    le: p.created ? new Date(p.created * 1000).toISOString() : null,
    payeur: p.customer?.email || null,
    etat: { state: p.state ?? null, processing_status: p.processing_status ?? null },
  }
}

const totaliser = paiements => ({
  // Encaissé net : ce que le prestataire a reçu, moins ce qu'il a rendu.
  encaisse: Math.round(paiements.reduce((t, p) => t + p.encaisse - p.rembourse, 0) * 100) / 100,
  enAttente: Math.round(paiements.filter(p => p.statut === 'en_attente').reduce((t, p) => t + (p.resteAVirer ?? p.montant), 0) * 100) / 100,
})

const resumerStripe = (intents) => {
  const paiements = (intents || []).map(paiementStripe).sort((a, b) => String(a.le).localeCompare(String(b.le)))
  return { paiements, ...totaliser(paiements) }
}

const resumerAlma = (payments) => {
  const paiements = (payments || []).map(paiementAlma).sort((a, b) => String(a.le).localeCompare(String(b.le)))
  return { paiements, ...totaliser(paiements) }
}

export default {
  resumerStripe,
  resumerAlma,
}
