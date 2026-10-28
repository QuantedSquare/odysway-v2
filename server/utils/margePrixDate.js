// La marge d'une date suit SON prix de vente (retour des admins d'Ulysse,
// 28/10/2026) : une date GIR privatisée pour 2 se vend 2 570 € au lieu de
// 2 265 €, et sa marge doit être « prix de la date − coût d'achat », pas la
// marge de la grille calculée au prix habituel.
//
// La grille stocke, par palier, la marge dérivée ET ses entrées (coût d'achat,
// prix de vente : migration margins v4). La marge au prix de la date se déduit
// donc de la ligne sans refaire la dérivation (qui vit dans Ulysse) :
//
//   GIR      : marge = prix × (1 − frais) − coût  →  + (prix date − prix grille) × (1 − frais)
//   privatif : frais sur le coût                  →  + (prix date − prix grille)
//
// Une ligne sans coût d'achat (marge saisie à la main) n'a pas de prix de
// référence : sa marge reste celle de la grille, et Ulysse le signale.
//
// PUR (tests/unit/margePrixDate.test.mjs).

const nombre = v => (v === null || v === undefined || v === '' ? null : Number(v))

/**
 * Écart à appliquer à la marge par voyageur d'une ligne de grille pour une date
 * vendue `prixDate`. `null` quand la ligne ne permet pas de le calculer.
 *
 * @param {{ sale_price_per_traveler?: number|null, purchase_cost_per_traveler?: number|null }} ligne
 * @param {number|null} prixDate  travel_dates.starting_price
 * @param {{ grid_model?: string|null, bank_fees_pct?: number|null }} reglages  voyage_margin_settings
 */
const ecartPrixDate = (ligne, prixDate, reglages = {}) => {
  const prix = nombre(prixDate)
  const prixGrille = nombre(ligne?.sale_price_per_traveler)
  if (prix === null || !(prix > 0) || prixGrille === null || nombre(ligne?.purchase_cost_per_traveler) === null) return null
  const ecart = prix - prixGrille
  if (ecart === 0) return { ecart: 0, prixDate: prix, prixGrille }
  const frais = reglages?.grid_model === 'privatif' ? 0 : (nombre(reglages?.bank_fees_pct) ?? 0) / 100
  return { ecart: ecart * (1 - frais), prixDate: prix, prixGrille }
}

/** Marge par voyageur au prix de la date, arrondie à l'euro comme la grille. */
const margeAuPrixDate = (marge, ligne, prixDate, reglages) => {
  if (marge === null || marge === undefined) return { value: null, prix: null }
  const e = ecartPrixDate(ligne, prixDate, reglages)
  if (!e || e.ecart === 0) return { value: Number(marge), prix: e }
  return { value: Math.round(Number(marge) + e.ecart), prix: e }
}

export default {
  ecartPrixDate,
  margeAuPrixDate,
}
