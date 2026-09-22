// Projection publique des deals ActiveCampaign.
//
// Ces tests verrouillent le contrat de server/utils/dealVisibility.js : la
// liste des champs qu'un anonyme peut lire sur /api/v1/ac/deals/<dealId>.
// Ils échouent dès qu'une clé sensible y entre par inadvertance — c'est leur
// seule raison d'être.
//
// Exécution : `npm test` (node --test, aucune dépendance).

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { PUBLIC_DEAL_FIELDS, toPublicDeal } from '../server/utils/dealVisibility.js'

// Un deal tel que la route le fusionne : champs natifs AC + champs
// personnalisés mappés par customFieldsMapDeal.
const dealComplet = {
  id: '16447',
  title: 'Pérou — Dupont',
  value: 480000,
  currency: 'eur',
  contact: '9821',
  group: '1',
  stage: '12',
  owner: '3',
  status: '0',
  slug: 'perou-communautes-andines',
  departureDate: '2026-04-12',
  returnDate: '2026-04-27',
  basePricePerTraveler: 240000,
  flightPrice: 90000,
  includeFlight: 'Oui',
  gotEarlybird: 'Oui',
  gotLastMinute: 'Non',
  // Tout ce qui suit doit rester interne.
  agentCost: 130000,
  marginPerTraveler: 55000,
  totalMargin: 110000,
  flightMargin: 8000,
  insuranceCommissionPerTraveler: 4200,
  insuranceCommissionPrice: 8400,
  extraMarginPerTraveler: 3000,
  alreadyPaid: 144000,
  restToPay: 336000,
  restToPayPerTraveler: 168000,
  depositPrice: 72000,
  promoCode: 'PRINTEMPS26',
  promoValue: 10000,
  utm: 'google/cpc/perou',
  acquisitionSource: 'Google Ads',
  paiementLink: 'https://odysway.com/checkout?booked_id=...',
  linkBms: 'https://odysway.com/booking-management/...',
  traveler1: 'Dupont Jean 1980-03-04',
  specialRequest: 'Régime sans gluten',
}

// Ce que la route renvoyait avant le correctif, en plus des champs ci-dessus.
const contactExpose = {
  email: 'jean.dupont@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '+33600000000',
}

describe('PUBLIC_DEAL_FIELDS', () => {
  it('ne contient aucun champ financier interne, marketing ou d\'identité', () => {
    const interdits = [
      'agentCost', 'marginPerTraveler', 'totalMargin', 'flightMargin',
      'extraMarginPerTraveler', 'insuranceCommissionPerTraveler',
      'insuranceCommissionPrice', 'alreadyPaid', 'restToPay',
      'restToPayPerTraveler', 'depositPrice', 'value', 'promoCode', 'promoValue',
      'utm', 'acquisitionSource', 'otherAcquisitionSource', 'paiementLink',
      'linkBms', 'contact', 'email', 'phone', 'firstName', 'lastName', 'title',
      'specialRequest', 'traveler1', 'traveler2', 'traveler3', 'traveler4',
      'traveler5', 'traveler6', 'traveler7', 'traveler8', 'owner', 'stage',
    ]
    for (const cle of interdits) {
      assert.ok(
        !PUBLIC_DEAL_FIELDS.includes(cle),
        `"${cle}" ne doit pas être publié sur la projection anonyme`,
      )
    }
  })

  it('est figée, pour qu\'aucun appelant ne l\'étende à chaud', () => {
    assert.ok(Object.isFrozen(PUBLIC_DEAL_FIELDS))
  })
})

describe('toPublicDeal', () => {
  it('ne laisse passer que les champs de la liste blanche', () => {
    const publie = toPublicDeal({ ...dealComplet, contact: contactExpose })
    assert.deepEqual(Object.keys(publie).sort(), [...PUBLIC_DEAL_FIELDS].sort())
  })

  it('retient marges, coût d\'achat, montants payés et identité du client', () => {
    const publie = toPublicDeal({ ...dealComplet, contact: contactExpose })
    for (const cle of ['agentCost', 'totalMargin', 'marginPerTraveler', 'alreadyPaid', 'restToPay', 'value', 'contact', 'utm', 'promoCode']) {
      assert.equal(publie[cle], undefined, `"${cle}" a fuité`)
    }
    assert.ok(!JSON.stringify(publie).includes('jean.dupont@example.com'))
    assert.ok(!JSON.stringify(publie).includes('+33600000000'))
  })

  it('conserve exactement ce dont la redirection des anciens liens a besoin', () => {
    // app/middleware/oldPayementLinkRedirection.js — resolution puis creation
    // de la travel_date à partir du deal.
    const publie = toPublicDeal(dealComplet)
    assert.equal(publie.slug, 'perou-communautes-andines')
    assert.equal(publie.departureDate, '2026-04-12')
    assert.equal(publie.returnDate, '2026-04-27')
    assert.equal(publie.basePricePerTraveler, 240000)
    assert.equal(publie.flightPrice, 90000)
    assert.equal(publie.includeFlight, 'Oui')
    assert.equal(publie.gotEarlybird, 'Oui')
    assert.equal(publie.gotLastMinute, 'Non')
  })

  it('n\'invente pas les clés absentes du deal source', () => {
    const publie = toPublicDeal({ id: '42', slug: 'islande-hiver' })
    assert.deepEqual(publie, { id: '42', slug: 'islande-hiver' })
  })

  it('renvoie un objet vide sur une entrée vide ou non-objet', () => {
    assert.deepEqual(toPublicDeal(null), {})
    assert.deepEqual(toPublicDeal(undefined), {})
    assert.deepEqual(toPublicDeal('16447'), {})
  })

  it('ne renvoie jamais une référence au deal source', () => {
    const publie = toPublicDeal(dealComplet)
    publie.slug = 'modifie'
    assert.equal(dealComplet.slug, 'perou-communautes-andines')
  })
})
