/**
 * Jeton de lecture des données d'achat (page /confirmation).
 *
 * Le problème qu'il résout : `booked_id` est un UUID stable qui circule dans
 * tous les liens de paiement envoyés par e-mail (`/checkout?booked_id=…`) et
 * qu'AC stocke en clair sur le deal. Tant que sa seule possession suffisait,
 * n'importe qui remontant un de ces liens pouvait relire l'e-mail et le
 * téléphone du client via `/api/v1/booking/purchase-data`.
 *
 * Le jeton est frappé au moment où l'on construit la `success_url` de la
 * session de paiement (Stripe / Alma) et n'existe donc que dans l'URL de
 * retour après paiement — jamais dans un e-mail, jamais sur le deal.
 *
 * Il est lié au `booked_id` : un jeton valide pour une réservation ne dit rien
 * d'une autre. Aucune ligne en base, tout est dans la signature.
 */

import crypto from 'node:crypto'

const TOKEN_PURPOSE = 'purchase-data'
const TOKEN_VERSION = 'v1'

/**
 * Le jeton est frappé à la création de la session de paiement, pas au retour :
 * il doit couvrir toute la durée de vie de cette session, sinon un payeur lent
 * atterrit sur /confirmation avec un jeton déjà expiré et le purchase GTM ne
 * part pas. Stripe expire ses sessions à 24 h, Alma à 2880 min (48 h) — on
 * cale sur la plus longue des deux.
 */
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000

/**
 * Pas de secret dédié requis : `BOOKING_JWT_SECRET` est déjà provisionné
 * partout (l'auth du back-office en dépend), ce qui évite qu'un environnement
 * oublie une variable et casse le tracking en silence. `PURCHASE_TOKEN_SECRET`
 * permet de séparer les clés plus tard sans toucher au code appelant.
 *
 * Le préfixe de domaine dans la signature garantit qu'un jeton d'achat ne peut
 * jamais être rejoué comme un jeton d'une autre famille partageant ce secret.
 */
const getSecret = () => process.env.PURCHASE_TOKEN_SECRET || process.env.BOOKING_JWT_SECRET || null

const sign = (bookedId, expiresAt, secret) => crypto
  .createHmac('sha256', secret)
  .update(`${TOKEN_PURPOSE}:${TOKEN_VERSION}:${bookedId}:${expiresAt}`)
  .digest('base64url')

/**
 * Frappe un jeton lié à une réservation.
 *
 * @param {string} bookedId  id de la ligne `booked_dates`
 * @param {number} [ttlMs]   durée de validité
 * @returns {string|null} `<expiration base36>.<signature>`, ou null si aucun
 *                        secret n'est configuré (l'appelant construit alors une
 *                        URL sans jeton, et l'endpoint refusera — jamais l'inverse)
 */
export const createPurchaseToken = (bookedId, ttlMs = TOKEN_TTL_MS) => {
  const secret = getSecret()
  if (!secret || !bookedId) return null

  const expiresAt = Date.now() + ttlMs
  return `${expiresAt.toString(36)}.${sign(bookedId, expiresAt, secret)}`
}

/**
 * Vérifie un jeton pour une réservation donnée.
 *
 * Échoue systématiquement fermé : secret absent, jeton absent, forme invalide,
 * expiration dépassée ou signature fausse renvoient tous `false`.
 *
 * @param {string} token
 * @param {string} bookedId
 * @returns {boolean}
 */
export const verifyPurchaseToken = (token, bookedId) => {
  const secret = getSecret()
  if (!secret || !token || !bookedId || typeof token !== 'string') return false

  const separator = token.indexOf('.')
  if (separator < 1) return false

  const rawExpiresAt = token.slice(0, separator)
  const expiresAt = parseInt(rawExpiresAt, 36)

  // `parseInt` est laxiste (il s'arrête au premier caractère invalide) : on
  // exige la forme canonique pour qu'un jeton n'ait qu'une seule écriture.
  if (!Number.isSafeInteger(expiresAt) || expiresAt.toString(36) !== rawExpiresAt) return false
  if (expiresAt < Date.now()) return false

  const provided = Buffer.from(token.slice(separator + 1))
  const expected = Buffer.from(sign(bookedId, expiresAt, secret))
  if (provided.length !== expected.length) return false

  return crypto.timingSafeEqual(provided, expected)
}
