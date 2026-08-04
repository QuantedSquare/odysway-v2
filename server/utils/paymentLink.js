import { createHmac, timingSafeEqual } from 'node:crypto'

// Lien de paiement stable, indexé sur le DEAL et non sur la ligne booked_dates.
//
// Historique du problème : le lien envoyé au client était
// `/checkout?booked_id=<uuid de booked_dates>`. Or cette ligne est supprimée
// dès que le deal part en Corbeille, passe en Perdu, est supprimé dans AC, ou
// qu'une purge BMS passe dessus. Le lien mourait avec elle, alors que le deal —
// lui — existait toujours. Voir server/utils/brokenLinks.js pour la réparation.
//
// La cible naturelle est donc le deal, mais son id est un entier séquentiel :
// exposer `/checkout?deal_id=16568` permettrait d'énumérer 1..N et de lire nom,
// email, téléphone et prix de tous les clients. D'où la signature HMAC : le
// token reste déterministe (le même deal donne toujours le même lien, à vie)
// mais n'est pas devinable.
//
// Format : `<dealId>.<signature base64url tronquée>` — ex. `16568.Ah7dK2vQ9xLm4pRt`.

const SIGNATURE_LENGTH = 22 // ~132 bits de base64url

const getSecret = () => {
  const secret = process.env.PAYMENT_LINK_SECRET || process.env.BOOKING_JWT_SECRET
  if (!secret) {
    throw new Error('Missing PAYMENT_LINK_SECRET (or BOOKING_JWT_SECRET) environment variable')
  }
  return secret
}

const computeSignature = dealId =>
  createHmac('sha256', getSecret())
    .update(`payment-link:${dealId}`)
    .digest('base64url')
    .slice(0, SIGNATURE_LENGTH)

/**
 * Signe un identifiant de deal.
 * @param {number|string} dealId
 * @returns {string} token à mettre dans l'URL de checkout
 */
const sign = (dealId) => {
  const id = String(dealId).trim()
  if (!/^\d+$/.test(id)) throw new Error(`Invalid dealId for payment link: ${dealId}`)
  return `${id}.${computeSignature(id)}`
}

/**
 * Vérifie un token et renvoie le dealId, ou null si la signature ne colle pas.
 * Comparaison à temps constant : le token est un secret d'accès au dossier.
 * @param {string} token
 * @returns {number|null}
 */
const verify = (token) => {
  if (typeof token !== 'string') return null
  const [id, signature] = token.split('.')
  if (!id || !signature || !/^\d+$/.test(id)) return null

  const expected = Buffer.from(computeSignature(id))
  const received = Buffer.from(signature)
  if (expected.length !== received.length) return null
  if (!timingSafeEqual(expected, received)) return null

  return Number(id)
}

/**
 * Construit l'URL de checkout définitive pour un deal.
 * @param {string} origin      ex. https://odysway.com
 * @param {number|string} dealId
 * @param {string} [type]      'deposit' | 'balance' | 'full' | 'custom'
 * @param {object} [extraQuery] paramètres additionnels (step, amount…)
 */
const buildCheckoutUrl = (origin, dealId, type = 'balance', extraQuery = {}) => {
  const params = new URLSearchParams({ type, d: sign(dealId), ...extraQuery })
  return `${String(origin).replace(/\/$/, '')}/checkout?${params.toString()}`
}

export default {
  sign,
  verify,
  buildCheckoutUrl,
}
