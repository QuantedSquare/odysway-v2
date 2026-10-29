// « +1 qui fait baisser la marge » (retours des admins d'Ulysse, 28/10/2026).
//
// Sur certains voyages, la grille de marge d'un palier fait baisser la marge
// TOTALE du groupe : au Pérou chaman, 4 voyageurs rapportent 1 648 €, 5 n'en
// rapportent plus que 1 300 € (un véhicule ou un guide de plus). Vendre la
// 5e place seule fait perdre de l'argent ; la vendre avec la 6e en fait gagner.
//
// Chaque date porte une règle (`travel_dates.plus_un_regle`) :
//   - 'libre'      : rien ne change (défaut) ;
//   - 'par_deux'   : une réservation qui ferait baisser la marge du groupe est
//                    refusée, le site propose le nombre minimum de places qui la
//                    rétablit (« ces 2 dernières places se prennent à 2 ») ;
//   - 'supplement' : elle est acceptée avec un supplément — la marge perdue, ou
//                    le montant saisi sur la date —, déduit du solde si d'autres
//                    voyageurs arrivent et rétablissent la marge du groupe.
//
// Les places comptées sont les places PAYÉES : une option ne rapporte rien
// tant qu'elle n'est pas réglée (même règle que computeMarginForDate).
//
// PUR et partagé (serveur + navigateur, tests/unit/plusUn.test.mjs). Les marges
// ne sortent jamais vers le navigateur : seule la décision lui est envoyée.

const REGLES = ['libre', 'par_deux', 'supplement']
const REGLE_DEFAUT = 'libre'
// Le supplément calculé est arrondi à la dizaine d'euros supérieure.
const ARRONDI_SUPPLEMENT_EUROS = 10

const absent = v => v === null || v === undefined || v === ''

const regleValide = v => REGLES.includes(v)

/** Marge totale du groupe à `pax` voyageurs, ou null si la grille ne la donne pas. */
const margeGroupe = (margesParPax, pax) => {
  if (pax <= 0) return 0
  const parPax = margesParPax?.[pax]
  if (absent(parPax) || !Number.isFinite(Number(parPax))) return null
  return Number(parPax) * pax
}

/**
 * Effet d'une réservation de `ajout` places sur une date qui en compte `payes`.
 *   - baisse  : la marge du groupe après la réservation est inférieure à celle
 *               d'avant ;
 *   - perte   : de combien (euros) ;
 *   - minimum : le plus petit nombre de places, réservées ensemble, qui la
 *               maintient (null : aucun dans la capacité) ;
 *   - seuil   : le nombre de places payées à partir duquel la marge est
 *               rétablie (null : jamais dans la capacité).
 * Sans voyageur payé, ou sans marge à protéger, ou sans grille, rien ne baisse :
 * on ne bloque jamais une vente sur une marge qu'on ne connaît pas.
 */
const evaluerAjout = ({ margesParPax, payes, ajout, max = null }) => {
  const rien = { baisse: false, perte: 0, minimum: null, seuil: null }
  const n = Number(payes) || 0
  const k = Number(ajout) || 0
  if (n <= 0 || k <= 0) return rien
  const avant = margeGroupe(margesParPax, n)
  const apres = margeGroupe(margesParPax, n + k)
  if (avant === null || apres === null || avant <= 0 || apres >= avant) return rien

  const plafond = Number(max) > 0 ? Number(max) : null
  let seuil = null
  for (let p = n + k + 1; plafond === null ? p <= n + k + 50 : p <= plafond; p++) {
    const m = margeGroupe(margesParPax, p)
    if (m === null) break
    if (m >= avant) {
      seuil = p
      break
    }
  }
  return { baisse: true, perte: avant - apres, minimum: seuil === null ? null : seuil - n, seuil }
}

/** Supplément en CENTIMES : le montant saisi sur la date, sinon la marge perdue arrondie. */
const montantSupplement = ({ perte, supplementDate }) => {
  if (!absent(supplementDate) && Number(supplementDate) >= 0) return Math.round(Number(supplementDate) * 100)
  return Math.ceil(perte / ARRONDI_SUPPLEMENT_EUROS) * ARRONDI_SUPPLEMENT_EUROS * 100
}

/**
 * Décision du tunnel pour une réservation de `ajout` places :
 *   { action: 'libre' }
 *   { action: 'refus', minimum }              (règle 'par_deux')
 *   { action: 'supplement', supplement, seuil } (règle 'supplement', centimes)
 * 'par_deux' sans nombre de places qui rétablisse la marge laisse vendre : la
 * refuser fermerait la date sans rien protéger.
 */
const decider = ({ regle, supplementDate = null, margesParPax, payes, ajout, max = null }) => {
  if (!regleValide(regle) || regle === 'libre') return { action: 'libre' }
  const effet = evaluerAjout({ margesParPax, payes, ajout, max })
  if (!effet.baisse) return { action: 'libre' }
  if (regle === 'par_deux') {
    return effet.minimum === null ? { action: 'libre' } : { action: 'refus', minimum: effet.minimum }
  }
  const supplement = montantSupplement({ perte: effet.perte, supplementDate })
  return supplement > 0 ? { action: 'supplement', supplement, seuil: effet.seuil } : { action: 'libre' }
}

/** Supplément encore dû par une réservation (centimes) : 0 s'il a été levé. */
const supplementActif = row =>
  row && Number(row.supplement_plus_un) > 0 && !row.supplement_plus_un_leve_at ? Number(row.supplement_plus_un) : 0

/** Le supplément se lève quand les places payées atteignent le seuil. */
const aLever = (row, payes) =>
  supplementActif(row) > 0 && !absent(row.supplement_plus_un_seuil) && Number(payes) >= Number(row.supplement_plus_un_seuil)

const euros = centimes => `${(centimes / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`

/** Texte du tunnel pour une décision (null : rien à dire). */
const messageTunnel = (decision) => {
  if (decision?.action === 'refus') {
    return `Sur ce départ, les dernières places se réservent à ${decision.minimum} minimum.`
  }
  if (decision?.action === 'supplement') {
    return `Un supplément de ${euros(decision.supplement)} s'applique à cette réservation : il sera déduit de votre solde si d'autres voyageurs rejoignent le groupe d'ici là.`
  }
  return null
}

/** Nettoie la saisie du back-office : { valeur } ou { erreur }. */
const nettoyerReglage = ({ regle, supplement } = {}) => {
  const valeur = {}
  if (regle !== undefined) {
    if (!regleValide(regle)) return { erreur: `plus_un_regle doit valoir ${REGLES.join(', ')}` }
    valeur.plus_un_regle = regle
  }
  if (supplement !== undefined) {
    if (absent(supplement)) valeur.plus_un_supplement = null
    else {
      const n = Number(supplement)
      if (!Number.isFinite(n) || n < 0 || n > 100000) return { erreur: 'plus_un_supplement doit être un montant en euros entre 0 et 100 000' }
      valeur.plus_un_supplement = n
    }
  }
  return { valeur }
}

export default {
  REGLES,
  REGLE_DEFAUT,
  margeGroupe,
  evaluerAjout,
  montantSupplement,
  decider,
  supplementActif,
  aLever,
  messageTunnel,
  nettoyerReglage,
}
