// La marge d'une date suit son prix de vente (server/utils/margePrixDate.js).
// `npm run test:unit`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import margePrixDate from '../../server/utils/margePrixDate.js'

const { ecartPrixDate, margeAuPrixDate } = margePrixDate

// Trek Pérou, 2 voyageurs : 2 265 € dans la grille, coût 2 379 €, frais 1,55 %.
const ligne = { margin_per_traveler: -149, sale_price_per_traveler: 2265, purchase_cost_per_traveler: 2379 }
const gir = { grid_model: 'gir', bank_fees_pct: 1.55 }

test('GIR : une date vendue plus cher gagne l\'écart de prix, moins les frais sur cet écart', () => {
  // (2 570 − 2 265) × (1 − 0,0155) = 300,27 → −149 + 300 = 151.
  assert.deepEqual(margeAuPrixDate(-149, ligne, 2570, gir).value, 151)
  assert.equal(margeAuPrixDate(-149, ligne, 2265, gir).value, -149)
  assert.equal(margeAuPrixDate(-149, ligne, 2165, gir).value, -247)
})

test('privatif : les frais portent sur le coût, l\'écart de prix va tout entier à la marge', () => {
  assert.equal(margeAuPrixDate(100, ligne, 2365, { grid_model: 'privatif', bank_fees_pct: 1.55 }).value, 200)
})

test('sans coût d\'achat (marge saisie) ni prix de date, la marge de la grille reste', () => {
  assert.equal(ecartPrixDate({ sale_price_per_traveler: null, purchase_cost_per_traveler: null }, 2570, gir), null)
  assert.equal(ecartPrixDate({ sale_price_per_traveler: 2265, purchase_cost_per_traveler: null }, 2570, gir), null)
  assert.equal(ecartPrixDate(ligne, null, gir), null)
  assert.equal(ecartPrixDate(ligne, 0, gir), null)
  assert.equal(margeAuPrixDate(-149, { margin_per_traveler: -149 }, 2570, gir).value, -149)
  assert.deepEqual(margeAuPrixDate(null, ligne, 2570, gir), { value: null, prix: null })
})

test('dit d\'où vient l\'écart', () => {
  assert.deepEqual(ecartPrixDate(ligne, 2265, gir), { ecart: 0, prixDate: 2265, prixGrille: 2265 })
  assert.equal(ecartPrixDate(ligne, 2570, gir).prixGrille, 2265)
})
