// Règles du mot de passe de l'Espace Voyageur, côté navigateur.
//
// PUR (tests/unit/espaceMotDePasse.test.mjs). Supabase Auth refait ses propres
// contrôles (longueur minimale, mots de passe ayant fuité) : ceux-ci servent à
// expliquer AVANT l'envoi, en français.

import { ESPACE_INDISPONIBLE } from './espaceConfig.js'

export const LONGUEUR_MIN = 12
// bcrypt, utilisé par Supabase, ignore tout ce qui dépasse 72 octets.
export const OCTETS_MAX = 72
// Définir un mot de passe exige une connexion récente : sur un ordinateur
// resté ouvert, un tiers ne doit pas pouvoir en poser un.
export const FRAICHEUR_MINUTES = 10
// « Password requirements » de Supabase Auth (BackOffice-PROD) : une minuscule,
// une majuscule, un chiffre et un symbole, avec SES jeux de caractères — une
// lettre accentuée ou une espace ne compte dans aucune famille.
export const REGLE_FAMILLES = 'Une minuscule, une majuscule, un chiffre et un symbole'
const FAMILLES = [/[a-z]/, /[A-Z]/, /[0-9]/, /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/]

/** Règles non respectées, dans l'ordre d'affichage. Tableau vide = valide. */
export const reglesNonRespectees = (motDePasse, email = '') => {
  const mdp = String(motDePasse || '')
  const manques = []
  if (mdp.length < LONGUEUR_MIN) manques.push(`Au moins ${LONGUEUR_MIN} caractères`)
  if (new TextEncoder().encode(mdp).length > OCTETS_MAX) manques.push('Pas plus de 72 caractères')
  if (mdp && mdp.trim() !== mdp) manques.push('Pas d\'espace au début ni à la fin')
  if (mdp && new Set(mdp).size < 5) manques.push('Au moins 5 caractères différents')
  if (!FAMILLES.every(f => f.test(mdp))) manques.push(REGLE_FAMILLES)
  const identifiant = String(email || '').split('@')[0].toLowerCase()
  if (identifiant.length >= 4 && mdp.toLowerCase().includes(identifiant)) manques.push('Ne pas reprendre votre adresse email')
  return manques
}

/** Charge utile d'un JWT, sans vérification (le serveur d'auth l'a émis). */
export const chargeJeton = (jeton) => {
  const partie = String(jeton || '').split('.')[1]
  if (!partie) return null
  try {
    const b64 = partie.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(Array.from(atob(b64), c => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''))
    return JSON.parse(json)
  }
  catch {
    return null
  }
}

/**
 * La session vient-elle d'être ouverte ? Lit `amr` (méthodes d'authentification
 * et leur horodatage, en secondes), qui survit aux rafraîchissements du jeton :
 * c'est l'âge de la CONNEXION, pas celui du jeton.
 */
export const connexionRecente = (jeton, maintenantMs = Date.now(), minutes = FRAICHEUR_MINUTES) => {
  const amr = chargeJeton(jeton)?.amr
  if (!Array.isArray(amr) || !amr.length) return false
  const derniere = Math.max(...amr.map(e => Number(e?.timestamp) || 0))
  return derniere > 0 && maintenantMs - derniere * 1000 <= minutes * 60 * 1000
}

/** Erreur Supabase Auth → message pour le client. */
export const messageErreurAuth = (err) => {
  const code = err?.code || ''
  const m = String(err?.message || '').toLowerCase()
  if (code === ESPACE_INDISPONIBLE) return 'Espace voyageur momentanément indisponible. Réessayez un peu plus tard.'
  if (code === 'weak_password') {
    const raisons = err?.reasons || err?.weakPassword?.reasons || []
    if (raisons.includes('pwned')) return 'Ce mot de passe figure dans des fuites de données connues. Choisissez-en un autre.'
    // « Password requirements » du tableau de bord Supabase, s'il impose des familles de caractères.
    if (raisons.includes('characters')) return 'Mot de passe trop simple : mêlez minuscules, majuscules, chiffres et symboles.'
    return `Mot de passe trop faible : au moins ${LONGUEUR_MIN} caractères.`
  }
  if (code === 'same_password') return 'C\'est déjà votre mot de passe actuel.'
  if (code === 'reauthentication_needed' || code === 'reauthentication_not_valid') return 'Pour votre sécurité, confirmez d\'abord votre identité avec un code.'
  if (code === 'invalid_credentials' || m.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.'
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || err?.status === 429 || m.includes('rate limit') || m.includes('security purposes')) {
    return 'Trop de tentatives rapprochées. Patientez une minute avant de réessayer.'
  }
  if (code === 'otp_expired' || m.includes('expired') || m.includes('invalid')) return 'Ce code est incorrect ou a expiré. Demandez-en un nouveau.'
  return 'Une erreur est survenue. Réessayez dans un instant.'
}
