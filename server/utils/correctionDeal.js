// Corrections d'un deal AC demandées par le Docteur d'Ulysse, et encaissements
// hors ligne (chèque vacances, chèque, virement direct…).
//
// Ulysse échange des valeurs dans SES unités (euros, dates 'YYYY-MM-DD',
// booléens) ; les particularités d'AC (centimes, 'Oui'/'Non') restent ici.
// Seuls les champs listés se corrigent : une clé inconnue est refusée, jamais
// transmise à AC.
//
// PUR (tests/unit/correctionDeal.test.mjs).

const vide = v => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

// type : euros | date | booleen | texte | entier | id | statut
// natif : champ du deal lui-même (et non un champ personnalisé).
const CHAMPS = {
  stage: { type: 'id', natif: true, libelle: 'Étape' },
  group: { type: 'id', natif: true, libelle: 'Pipeline' },
  status: { type: 'statut', natif: true, libelle: 'Statut' },
  departureDate: { type: 'date', libelle: 'Date de départ' },
  returnDate: { type: 'date', libelle: 'Date de retour' },
  conversionDate: { type: 'date', libelle: 'Date de conversion' },
  slug: { type: 'texte', libelle: 'Voyage (slug)' },
  iso: { type: 'texte', libelle: 'ISO du pays' },
  country: { type: 'texte', libelle: 'Pays' },
  travelType: { type: 'texte', libelle: 'Type de voyage' },
  acquisitionSource: { type: 'texte', libelle: 'Source d\'acquisition' },
  promoCode: { type: 'texte', libelle: 'Code promo' },
  includeFlight: { type: 'booleen', libelle: 'Vol inclus' },
  gotEarlybird: { type: 'booleen', libelle: 'Early bird' },
  gotLastMinute: { type: 'booleen', libelle: 'Last minute' },
  basePricePerTraveler: { type: 'euros', libelle: 'Prix de base par voyageur' },
  marginPerTraveler: { type: 'euros', libelle: 'Marge par voyageur' },
  totalMargin: { type: 'euros', libelle: 'Marge totale' },
  flightMargin: { type: 'euros', libelle: 'Marge vol' },
  insuranceCommissionPerTraveler: { type: 'euros', libelle: 'Commission d\'assurance par voyageur' },
  cancellationFee: { type: 'euros', libelle: 'Frais d\'annulation' },
  nbTravelers: { type: 'entier', libelle: 'Voyageurs' },
  nbAdults: { type: 'entier', libelle: 'Adultes' },
  nbChildren: { type: 'entier', libelle: 'Enfants' },
}

// Statuts qu'Ulysse peut poser : rouvrir ou gagner. « Perdu » demande une raison
// que le Docteur ne connaît pas : il se pose dans AC.
const STATUTS_POSABLES = new Set([0, 1])

const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Une valeur au format d'Ulysse est-elle acceptable pour ce champ ? */
const valeurValide = (cle, v) => {
  const def = CHAMPS[cle]
  if (!def) return false
  if (v === null) return !def.natif // un champ personnalisé peut se vider, pas l'étape
  switch (def.type) {
    case 'euros': return typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e7
    case 'date': return typeof v === 'string' && DATE.test(v)
    case 'booleen': return typeof v === 'boolean'
    case 'texte': return typeof v === 'string' && v.trim().length > 0 && v.length <= 200
    case 'entier': return Number.isInteger(v) && v >= 0 && v < 1000
    case 'id': return (typeof v === 'string' || typeof v === 'number') && /^\d+$/.test(String(v))
    case 'statut': return STATUTS_POSABLES.has(v)
    default: return false
  }
}

/** Valeur au format d'AC, pour l'écriture. */
const versAc = (cle, v) => {
  const def = CHAMPS[cle]
  if (v === null) return ''
  switch (def.type) {
    case 'euros': return Math.round(v * 100)
    case 'booleen': return v ? 'Oui' : 'Non'
    case 'texte': return v.trim()
    case 'id': return String(v)
    default: return v
  }
}

/** Valeur lue dans AC, au format d'Ulysse. */
const depuisAc = (cle, brut) => {
  const def = CHAMPS[cle]
  const b = Array.isArray(brut) ? brut[0] : brut
  if (vide(b)) return null
  switch (def.type) {
    case 'euros': return Number.isFinite(Number(b)) ? Number(b) / 100 : null
    case 'date': return String(b).slice(0, 10)
    case 'booleen': {
      const s = String(b).replace(/\|/g, '').trim().toLowerCase()
      return s === 'oui' || s === 'true' || s === '1'
    }
    case 'texte': return String(b).trim()
    case 'entier': return Number.isFinite(Number(b)) ? Number(b) : null
    case 'id': return String(b)
    case 'statut': return Number(b)
    default: return b
  }
}

const egales = (cle, a, b) => {
  if (a === null || b === null) return a === b
  if (CHAMPS[cle].type === 'euros') return Math.abs(a - b) < 0.005
  return a === b
}

/**
 * Compare ce qu'Ulysse croit lire (`avant`) à ce qu'AC contient maintenant.
 * @param {{cle: string, avant: unknown}[]} champs
 * @param {object} dealAc  deal AC fusionné avec ses champs personnalisés mappés
 * @returns {{cle: string, attendu: unknown, actuel: unknown}[]} les écarts ; vide = rien n'a bougé
 */
const ecartsAvant = (champs, dealAc) => champs
  .map(c => ({ cle: c.cle, attendu: c.avant, actuel: depuisAc(c.cle, dealAc[c.cle]) }))
  .filter(e => !egales(e.cle, e.attendu, e.actuel))

/** Deal « à plat » pour `activecampaign.updateDeal` (sans le statut, écrit à part). */
const dealAPlat = champs => Object.fromEntries(champs
  .filter(c => c.cle !== 'status')
  .map(c => [c.cle, versAc(c.cle, c.apres)]))

const eurosTexte = v => `${v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`

const afficher = (cle, v) => {
  if (v === null || v === undefined) return '—'
  const def = CHAMPS[cle]
  if (def.type === 'euros') return eurosTexte(v)
  if (def.type === 'booleen') return v ? 'Oui' : 'Non'
  if (def.type === 'statut') return ({ 0: 'Ouvert', 1: 'Gagné', 2: 'Perdu' })[v] ?? String(v)
  return String(v)
}

/** Note AC laissée par chaque correction : les commerciaux voient qui a changé quoi. */
const noteCorrection = ({ champs, auteur, regle }) =>
  `Correction depuis Ulysse (Docteur${regle ? `, ${regle}` : ''}) par ${auteur} : `
  + champs.map(c => `${CHAMPS[c.cle].libelle} ${afficher(c.cle, c.avant)} → ${afficher(c.cle, c.apres)}`).join(' ; ')

/* ═══════════════════════════ Encaissements ═══════════════════════════ */

const MOYENS = {
  cheque_vacances: 'Chèque vacances',
  cheque: 'Chèque',
  virement: 'Virement direct',
  especes: 'Espèces',
  autre: 'Autre',
}

// Marqueur posé dans la note AC : rejouer le même encaissement ne l'ajoute pas
// deux fois au total payé.
const marqueurEncaissement = id => `[encaissement ${id}]`

const noteEncaissement = ({ id, montant, moyen, date, reference, auteur }) => [
  'Encaissement hors ligne',
  MOYENS[moyen],
  eurosTexte(montant),
  `reçu le ${date.split('-').reverse().join('/')}`,
  reference ? `réf. ${reference}` : null,
  `saisi dans Ulysse par ${auteur}`,
].filter(Boolean).join(' – ') + ` ${marqueurEncaissement(id)}`

const dejaEncaisse = (notes, id) => (notes || []).some(n => String(n?.note || '').includes(marqueurEncaissement(id)))

export default {
  CHAMPS,
  MOYENS,
  valeurValide,
  versAc,
  depuisAc,
  egales,
  ecartsAvant,
  dealAPlat,
  noteCorrection,
  noteEncaissement,
  dejaEncaisse,
}
