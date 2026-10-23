// Règles du compte de l'Espace Voyageur : changement d'email, suppression.
//
// PUR (tests/unit/espaceCompte.test.mjs). La double confirmation de
// suppression est la règle du serveur (server/utils/espaceCompte.js), importée
// telle quelle : le serveur la revérifie.

import espaceCompte from '../../server/utils/espaceCompte.js'

// Mot à saisir pour confirmer la suppression : la seconde confirmation,
// après la case « je comprends ce qui est conservé ».
export const MOT_SUPPRESSION = espaceCompte.MOT_SUPPRESSION

/** Double confirmation : case cochée ET mot saisi (casse et espaces de bordure indifférents). */
export const suppressionConfirmee = corps => espaceCompte.confirmationValide(corps)

const normaliser = v => String(v || '').trim().toLowerCase()
// Validation volontairement simple, comme côté serveur : Supabase refuse le reste.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Message d'erreur pour la nouvelle adresse, ou null si elle peut être envoyée. */
export const erreurNouvelEmail = (nouveau, actuel) => {
  const n = normaliser(nouveau)
  if (!n) return 'Saisissez votre nouvelle adresse.'
  if (!EMAIL.test(n)) return 'Cette adresse email n\'est pas valide.'
  if (n === normaliser(actuel)) return 'C\'est déjà l\'adresse de votre compte.'
  return null
}

/**
 * Le changement est-il terminé ? Avec « Secure email change », Supabase exige
 * le code de l'ancienne ET de la nouvelle adresse ; l'email du compte ne
 * change qu'au second.
 */
export const changementEmailTermine = (user, nouveau) => !!user?.email && normaliser(user.email) === normaliser(nouveau)

/** Erreur Supabase Auth propre au changement d'email → message, sinon null. */
export const messageErreurEmail = (err) => {
  const code = err?.code || ''
  const m = String(err?.message || '').toLowerCase()
  if (code === 'email_exists' || m.includes('already been registered')) {
    return 'Cette adresse est déjà celle d\'un autre compte Odysway. Pour retrouver ici les dossiers réservés avec elle, utilisez plutôt « Retrouver un dossier ».'
  }
  if (code === 'email_address_invalid' || code === 'validation_failed') return 'Cette adresse email n\'est pas valide.'
  return null
}
