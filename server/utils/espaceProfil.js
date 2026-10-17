// Règles du profil voyageur de l'Espace Voyageur (pièce d'identité, régime,
// contact d'urgence).
//
// PUR (tests/unit/espaceProfil.test.mjs).

// Puces de la maquette. `tout` exclut les autres.
const REGIMES = [
  { valeur: 'tout', libelle: 'Je mange de tout' },
  { valeur: 'vegetarien', libelle: 'Végétarien' },
  { valeur: 'vegetalien', libelle: 'Végétalien' },
  { valeur: 'sans_porc', libelle: 'Sans porc' },
  { valeur: 'sans_alcool', libelle: 'Sans alcool' },
  { valeur: 'sans_gluten', libelle: 'Sans gluten' },
  { valeur: 'sans_lactose', libelle: 'Sans lactose' },
  { valeur: 'halal', libelle: 'Halal' },
  { valeur: 'casher', libelle: 'Casher' },
]
const VALEURS_REGIMES = REGIMES.map(r => r.valeur)

// La plupart des pays exigent une pièce valable 6 mois après le retour.
const VALIDITE_MOIS_APRES_RETOUR = 6
// Copie de la pièce gardée 30 jours après le retour, puis purgée.
const CONSERVATION_SCAN_JOURS = 30

/** "20 ab 45678" → "20AB45678" ; null si vide. */
const normaliserNumero = (v) => {
  const s = String(v ?? '').toUpperCase().replace(/[\s-]/g, '')
  return s || null
}
const numeroValide = n => /^[A-Z0-9]{5,20}$/.test(n || '')

/** Régimes connus, sans doublon ; « tout » seul s'il est coché. */
const normaliserRegimes = (liste) => {
  const r = [...new Set((Array.isArray(liste) ? liste : []).filter(v => VALEURS_REGIMES.includes(v)))]
  return r.includes('tout') ? ['tout'] : r
}

const ajouterMois = (iso, mois) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + mois)
  return d.toISOString().slice(0, 10)
}

/**
 * Ce qui manque au profil, et si la pièce expire trop tôt.
 * @param {object|null} p ligne traveler_profiles (ou null)
 * @param {{ retour?: string|null }} [voyage]
 */
const completude = (p, { retour = null } = {}) => {
  const piece = !!(p?.piece_type && p?.piece_numero_chiffre && p?.piece_expiration)
  const regime = !!(p?.regimes?.length)
  const urgence = !!(p?.urgence_nom && p?.urgence_telephone)
  const manques = []
  if (!piece) manques.push('piece')
  if (!regime) manques.push('regime')
  if (!urgence) manques.push('urgence')
  const limite = retour ? ajouterMois(String(retour).slice(0, 10), VALIDITE_MOIS_APRES_RETOUR) : null
  const expireTropTot = !!(piece && limite && String(p.piece_expiration).slice(0, 10) < limite)
  return { piece, regime, urgence, complet: manques.length === 0, manques, expireTropTot, validiteRequise: limite }
}

/**
 * Qui peut lire et modifier le profil d'une place : la personne elle-même si
 * elle a un compte ; sinon le titulaire du dossier pour elle (enfant, voyageur
 * sans email, et sa propre place). Un adulte invité garde ses données pour lui.
 */
const peutModifier = ({ place, clientId, role }) => {
  if (!place) return false
  if (place.user_id) return place.user_id === clientId
  return role === 'titulaire'
}

/** Ce que le navigateur reçoit : jamais le numéro, seulement sa fin. */
const vueProfil = (p, voyage) => ({
  pieceType: p?.piece_type || null,
  pieceNumeroFin: p?.piece_numero_fin || null,
  pieceExpiration: p?.piece_expiration ? String(p.piece_expiration).slice(0, 10) : null,
  piecePays: p?.piece_pays || null,
  scan: p?.scan_path ? { type: p.scan_type, taille: p.scan_taille, deposeLe: p.scan_depose_le } : null,
  regimes: p?.regimes || [],
  allergies: p?.allergies || '',
  urgenceNom: p?.urgence_nom || '',
  urgenceLien: p?.urgence_lien || '',
  urgenceTelephone: p?.urgence_telephone || '',
  notes: p?.notes || '',
  misAJourLe: p?.updated_at || null,
  completude: completude(p, voyage),
})

const libelleRegime = v => REGIMES.find(r => r.valeur === v)?.libelle || v

/**
 * Ce que l'ÉQUIPE reçoit (Ulysse) : le numéro de pièce en clair — il sert à
 * émettre les billets —, les libellés des régimes, la complétude. `numero` est
 * déchiffré par l'appelant ; `null` si absent ou illisible.
 */
const vueEquipe = (p, { numero = null, numeroIllisible = false, retour = null } = {}) => ({
  pieceType: p?.piece_type || null,
  pieceNumero: numero,
  pieceNumeroFin: p?.piece_numero_fin || null,
  pieceNumeroIllisible: numeroIllisible,
  pieceExpiration: p?.piece_expiration ? String(p.piece_expiration).slice(0, 10) : null,
  piecePays: p?.piece_pays || null,
  scan: p?.scan_path ? { type: p.scan_type, deposeLe: p.scan_depose_le } : null,
  regimes: (p?.regimes || []).map(libelleRegime),
  allergies: p?.allergies || null,
  urgence: p?.urgence_nom || p?.urgence_telephone
    ? { nom: p.urgence_nom || null, lien: p.urgence_lien || null, telephone: p.urgence_telephone || null }
    : null,
  notes: p?.notes || null,
  misAJourLe: p?.updated_at || null,
  completude: completude(p, { retour }),
})

// Signatures des fichiers acceptés : le type annoncé par le navigateur ne
// prouve rien, on lit les premiers octets.
const detecterType = (octets) => {
  const b = octets instanceof Uint8Array ? octets : new Uint8Array(octets || [])
  const debut = (...sig) => sig.every((v, i) => b[i] === v)
  if (debut(0x25, 0x50, 0x44, 0x46, 0x2D)) return { mime: 'application/pdf', ext: 'pdf' }
  if (debut(0xFF, 0xD8, 0xFF)) return { mime: 'image/jpeg', ext: 'jpg' }
  if (debut(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) return { mime: 'image/png', ext: 'png' }
  // HEIC/HEIF (photos d'iPhone) : boîte « ftyp » à l'octet 4.
  const marque = String.fromCharCode(...b.slice(4, 12))
  if (/^ftyp(heic|heix|hevc|heim|heis|mif1|msf1)/.test(marque)) return { mime: 'image/heic', ext: 'heic' }
  return null
}

/** La copie doit-elle être purgée ? (retour + 30 jours dépassé) */
const scanAPurger = ({ retour, aujourdhui }) => {
  if (!retour) return false
  const d = new Date(`${String(retour).slice(0, 10)}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + CONSERVATION_SCAN_JOURS)
  return aujourdhui > d.toISOString().slice(0, 10)
}

export default {
  REGIMES,
  VALEURS_REGIMES,
  VALIDITE_MOIS_APRES_RETOUR,
  CONSERVATION_SCAN_JOURS,
  normaliserNumero,
  numeroValide,
  normaliserRegimes,
  completude,
  peutModifier,
  vueProfil,
  vueEquipe,
  detecterType,
  scanAPurger,
}
