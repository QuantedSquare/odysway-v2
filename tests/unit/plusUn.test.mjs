// « +1 qui fait baisser la marge » (shared/plusUn.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import plusUn from '../../shared/plusUn.js'

const { margeGroupe, evaluerAjout, decider, supplementActif, aLever, messageTunnel, nettoyerReglage } = plusUn

// Grille du Pérou trek immersion (prod, 29/10/2026), marge par voyageur.
const perou = { 2: -149, 3: 4, 4: 412, 5: 260, 6: 547, 7: 351, 8: 621 }

test('marge du groupe : marge par voyageur × voyageurs, null hors grille', () => {
  assert.equal(margeGroupe(perou, 4), 1648)
  assert.equal(margeGroupe(perou, 5), 1300)
  assert.equal(margeGroupe(perou, 0), 0)
  assert.equal(margeGroupe(perou, 9), null)
})

test('le +1 qui fait baisser la marge du groupe, et ce qui la rétablit', () => {
  assert.deepEqual(evaluerAjout({ margesParPax: perou, payes: 4, ajout: 1, max: 8 }), { baisse: true, perte: 348, minimum: 2, seuil: 6 })
  assert.deepEqual(evaluerAjout({ margesParPax: perou, payes: 6, ajout: 1, max: 8 }), { baisse: true, perte: 825, minimum: 2, seuil: 8 })
  // 4 → 7 rapporte plus que 4 : rien à bloquer.
  assert.equal(evaluerAjout({ margesParPax: perou, payes: 4, ajout: 3, max: 8 }).baisse, false)
  assert.equal(evaluerAjout({ margesParPax: perou, payes: 3, ajout: 1, max: 8 }).baisse, false)
})

test('rien ne bloque sans voyageur payé, sans marge à protéger ou sans grille', () => {
  assert.equal(evaluerAjout({ margesParPax: perou, payes: 0, ajout: 1 }).baisse, false)
  assert.equal(evaluerAjout({ margesParPax: perou, payes: 2, ajout: 1 }).baisse, false)
  assert.equal(evaluerAjout({ margesParPax: {}, payes: 4, ajout: 1 }).baisse, false)
  assert.equal(evaluerAjout({ margesParPax: { 4: 412 }, payes: 4, ajout: 1 }).baisse, false)
})

test('aucun nombre de places ne rétablit la marge dans la capacité : seuil inconnu', () => {
  assert.deepEqual(evaluerAjout({ margesParPax: perou, payes: 6, ajout: 1, max: 7 }), { baisse: true, perte: 825, minimum: null, seuil: null })
})

test('règle « par deux » : refus avec le minimum, jamais quand rien ne le rétablit', () => {
  assert.deepEqual(decider({ regle: 'par_deux', margesParPax: perou, payes: 4, ajout: 1, max: 8 }), { action: 'refus', minimum: 2 })
  assert.deepEqual(decider({ regle: 'par_deux', margesParPax: perou, payes: 4, ajout: 2, max: 8 }), { action: 'libre' })
  assert.deepEqual(decider({ regle: 'par_deux', margesParPax: perou, payes: 6, ajout: 1, max: 7 }), { action: 'libre' })
})

test('règle « supplément » : la marge perdue arrondie à la dizaine, ou le montant de la date', () => {
  assert.deepEqual(decider({ regle: 'supplement', margesParPax: perou, payes: 4, ajout: 1, max: 8 }), { action: 'supplement', supplement: 35000, seuil: 6 })
  assert.deepEqual(decider({ regle: 'supplement', supplementDate: 200, margesParPax: perou, payes: 6, ajout: 1, max: 8 }), { action: 'supplement', supplement: 20000, seuil: 8 })
  // Un supplément saisi à 0 € revient à laisser vendre.
  assert.deepEqual(decider({ regle: 'supplement', supplementDate: 0, margesParPax: perou, payes: 4, ajout: 1, max: 8 }), { action: 'libre' })
})

test('règle libre ou inconnue : rien ne change', () => {
  assert.deepEqual(decider({ regle: 'libre', margesParPax: perou, payes: 4, ajout: 1 }), { action: 'libre' })
  assert.deepEqual(decider({ regle: undefined, margesParPax: perou, payes: 4, ajout: 1 }), { action: 'libre' })
})

test('supplément levé quand les places payées atteignent le seuil, une seule fois', () => {
  const row = { supplement_plus_un: 35000, supplement_plus_un_seuil: 6, supplement_plus_un_leve_at: null }
  assert.equal(supplementActif(row), 35000)
  assert.equal(aLever(row, 5), false)
  assert.equal(aLever(row, 6), true)
  const leve = { ...row, supplement_plus_un_leve_at: '2026-11-02T10:00:00Z' }
  assert.equal(supplementActif(leve), 0)
  assert.equal(aLever(leve, 8), false)
  assert.equal(aLever({ ...row, supplement_plus_un_seuil: null }, 8), false)
})

test('le tunnel dit la règle sans donner la marge', () => {
  assert.equal(messageTunnel({ action: 'refus', minimum: 2 }), 'Sur ce départ, les dernières places se réservent à 2 minimum.')
  assert.match(messageTunnel({ action: 'supplement', supplement: 35000, seuil: 6 }), /supplément de 350 €.*déduit de votre solde/)
  assert.equal(messageTunnel({ action: 'libre' }), null)
})

test('réglage saisi dans le back-office', () => {
  assert.deepEqual(nettoyerReglage({ regle: 'par_deux' }), { valeur: { plus_un_regle: 'par_deux' } })
  assert.deepEqual(nettoyerReglage({ regle: 'supplement', supplement: '250' }), { valeur: { plus_un_regle: 'supplement', plus_un_supplement: 250 } })
  assert.deepEqual(nettoyerReglage({ supplement: '' }), { valeur: { plus_un_supplement: null } })
  assert.ok(nettoyerReglage({ regle: 'toujours' }).erreur)
  assert.ok(nettoyerReglage({ supplement: -5 }).erreur)
})
