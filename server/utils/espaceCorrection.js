// Correction de l'identité d'un voyageur (prénom, nom, date de naissance) par
// le titulaire du dossier, depuis l'Espace Voyageur.
//
// Le champ AC « Voyageur N » garde le format du tunnel,
// "Prénom_Nom_JJ/MM/AAAA_ISO" : Chapka le découpe sur `_`. D'où l'interdiction
// du `_` dans les noms, et l'ISO recopié tel qu'il était.
//
// PUR (tests/unit/espaceCorrection.test.mjs).

import espaceVoyageur from './espaceVoyageur.js'

// Au-delà, billets et listes de rooming sont en cours : l'équipe corrige.
// Validé par Alex le 22/10/2026.
const DELAI_CORRECTION_JOURS = 30

const LONGUEUR_PRENOM = 50
const LONGUEUR_NOM = 80
const AGE_MAX = 120
// Une date de naissance qui touche un mineur peut changer le tarif (promo
// enfant, âge maximal du voyage dans Sanity) : l'équipe la corrige.
const MAJORITE = 18

const MESSAGES_VERROU = {
  billets: 'Les billets de ce voyage sont déjà émis : contactez-nous pour toute correction.',
  depart_proche: `À moins de ${DELAI_CORRECTION_JOURS} jours du départ, contactez-nous pour toute correction.`,
  parti: 'Ce voyage a déjà commencé : contactez-nous pour toute correction.',
}

// Lettres (accents compris), espaces, tirets, apostrophes, points.
// Ni chiffre ni `_` (séparateur du champ AC).
const NOM = /^\p{L}[\p{L}\p{M} '’.-]*$/u
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const normaliserNom = v => (typeof v === 'string' ? v.normalize('NFC').replace(/\s+/g, ' ').trim() : '')

const dateReelle = (s) => {
  const m = DATE.exec(String(s || ''))
  if (!m) return false
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
}

/** Âge révolu au jour `jour` ('YYYY-MM-DD'). */
const ageAu = (naissance, jour) => {
  const [an, mn, jn] = naissance.split('-').map(Number)
  const [a, m, j] = jour.split('-').map(Number)
  return a - an - (m < mn || (m === mn && j < jn) ? 1 : 0)
}

const verifierNom = (v, max) => {
  if (!v) return 'Champ requis.'
  if (v.length > max) return `${max} caractères au plus.`
  if (!NOM.test(v)) return 'Lettres, espaces, tirets et apostrophes uniquement.'
  return null
}

/**
 * Valide ce que le titulaire a saisi.
 * @param {{ prenom?: unknown, nom?: unknown, dateNaissance?: unknown }} saisie  date au format 'YYYY-MM-DD'
 * @param {{ aujourdhui: string }} p
 * @returns {{ identite: { prenom: string, nom: string, dateNaissance: string }|null, erreurs: Record<string, string> }}
 */
const validerIdentite = (saisie, { aujourdhui }) => {
  const prenom = normaliserNom(saisie?.prenom)
  const nom = normaliserNom(saisie?.nom)
  const dateNaissance = typeof saisie?.dateNaissance === 'string' ? saisie.dateNaissance.trim() : ''
  const erreurs = {}

  const ep = verifierNom(prenom, LONGUEUR_PRENOM)
  if (ep) erreurs.prenom = ep
  const en = verifierNom(nom, LONGUEUR_NOM)
  if (en) erreurs.nom = en
  if (!dateReelle(dateNaissance)) erreurs.dateNaissance = 'Date invalide.'
  else if (dateNaissance > aujourdhui) erreurs.dateNaissance = 'Cette date est dans le futur.'
  else if (ageAu(dateNaissance, aujourdhui) > AGE_MAX) erreurs.dateNaissance = 'Cette date paraît invraisemblable.'

  return Object.keys(erreurs).length
    ? { identite: null, erreurs }
    : { identite: { prenom, nom, dateNaissance }, erreurs }
}

/** Valeur AC d'une case « Oui » (`||Oui||`, `Oui`, booléen du miroir). */
const caseCochee = (v) => {
  if (typeof v === 'boolean') return v
  const s = String(Array.isArray(v) ? v[0] : v ?? '').replace(/\|/g, '').trim().toLowerCase()
  return s === 'oui' || s === 'true' || s === '1'
}

/**
 * La correction est-elle fermée au client ? 'billets' | 'parti' | 'depart_proche' | null.
 */
const verrouCorrection = ({ billetsAchetes, depart, aujourdhui }) => {
  if (caseCochee(billetsAchetes)) return 'billets'
  if (!depart) return null
  const jours = espaceVoyageur.ecartJours(aujourdhui, String(depart).slice(0, 10))
  if (jours <= 0) return 'parti'
  if (jours < DELAI_CORRECTION_JOURS) return 'depart_proche'
  return null
}

/** Ce que l'espace montre d'un champ AC, au format de la saisie. */
const identiteDe = (raw) => {
  const v = espaceVoyageur.lireVoyageur(raw)
  return { prenom: v?.firstname || null, nom: v?.lastname || null, dateNaissance: v?.birthdate || null }
}

const memeIdentite = (a, b) =>
  normaliserNom(a?.prenom) === normaliserNom(b?.prenom)
  && normaliserNom(a?.nom) === normaliserNom(b?.nom)
  && (a?.dateNaissance || null) === (b?.dateNaissance || null)

/** Prénom ET nom changent : probablement une autre personne (cession de place). */
const personneChangee = (avant, apres) => {
  const { cleNom } = espaceVoyageur
  return cleNom(avant?.prenom) !== cleNom(apres?.prenom) && cleNom(avant?.nom) !== cleNom(apres?.nom)
}

/**
 * La date de naissance change et touche un mineur au départ (avant ou après) :
 * le tarif peut en dépendre, la correction revient à l'équipe.
 */
const ageEnJeu = ({ avant, apres, depart, aujourdhui }) => {
  if ((avant?.dateNaissance || null) === apres.dateNaissance) return false
  const jour = depart ? String(depart).slice(0, 10) : aujourdhui
  return [avant?.dateNaissance, apres.dateNaissance].filter(Boolean).some(d => ageAu(d, jour) < MAJORITE)
}

// Ce qui suit la date dans le champ AC (l'ISO, en général) est recopié tel quel.
const DATE_AC = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/
const queueAc = (raw) => {
  const parts = String(raw || '').split('_').map(p => p.trim())
  const iDate = parts.findIndex(p => DATE_AC.test(p))
  if (iDate !== -1) return parts.slice(iDate + 1).join('_')
  // Saisie à la main sans date : "Paul_Durand_FR".
  const dernier = parts[parts.length - 1]
  return parts.length >= 3 && /^[A-Z]{2,3}$/.test(dernier) ? dernier : ''
}

/** Nouveau champ AC « Voyageur N », au format du tunnel, ISO conservé. */
const champAc = (rawActuel, { prenom, nom, dateNaissance }) => {
  const [a, m, j] = dateNaissance.split('-')
  return `${prenom}_${nom}_${j}/${m}/${a}_${queueAc(rawActuel)}`
}

/** Une assurance a été choisie sur le deal (champ AC 12). */
const assuranceSouscrite = v => Boolean(v) && String(v).trim() !== '' && String(v).trim() !== 'Aucune Assurance'

/** Note AC laissée à chaque correction : l'équipe voit qui a changé quoi. */
const noteCorrection = ({ slot, avant, apres, auteur }) =>
  `Correction depuis l'Espace Voyageur par ${auteur} : Voyageur ${slot} « ${avant || '—'} » → « ${apres} »`

export default {
  DELAI_CORRECTION_JOURS,
  LONGUEUR_PRENOM,
  LONGUEUR_NOM,
  MESSAGES_VERROU,
  normaliserNom,
  validerIdentite,
  caseCochee,
  verrouCorrection,
  identiteDe,
  memeIdentite,
  personneChangee,
  ageEnJeu,
  champAc,
  assuranceSouscrite,
  noteCorrection,
}
