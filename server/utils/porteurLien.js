import { createHmac, timingSafeEqual } from 'node:crypto'

// Jeton de l'Espace porteur (/espace-porteur) : `<porteurId>.<exp>.<signature>`.
//
// Même principe que le lien de paiement signé `?d=<id>.<hmac>` : l'identifiant
// voyage en clair, la signature empêche d'en fabriquer un autre. `porteurId` est
// `ulysse.porteurs.id` (uuid), `exp` une date d'expiration en secondes. Le jeton
// part par email dans le lien magique, puis vit dans un cookie httpOnly,
// renouvelé à chaque visite (server/utils/espacePorteur.js).
//
// PUR (tests/unit/porteurLien.test.mjs) : la clé et l'heure se passent en
// paramètres, `secret()` ne sert qu'aux appelants Nitro.

const DUREE_S = 30 * 24 * 60 * 60

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
// 192 bits de HMAC-SHA256 en base64url : assez pour qu'aucun jeton ne se devine.
const LONGUEUR_SIGNATURE = 32

const secret = () => {
  const s = process.env.PORTEUR_LINK_SECRET || process.env.BOOKING_JWT_SECRET
  if (!s) throw new Error('PORTEUR_LINK_SECRET (ou BOOKING_JWT_SECRET) manquant')
  return s
}

// Le préfixe `porteur:` sépare ces signatures de toute autre faite avec la même
// clé de repli (BOOKING_JWT_SECRET).
const signature = (porteurId, exp, cle) =>
  createHmac('sha256', cle).update(`porteur:${porteurId}:${exp}`).digest('base64url').slice(0, LONGUEUR_SIGNATURE)

const signer = (porteurId, { cle, maintenant = Date.now(), dureeS = DUREE_S } = {}) => {
  const id = String(porteurId || '').toLowerCase()
  if (!UUID.test(id)) throw new Error('Identifiant de porteur invalide')
  const exp = Math.floor(maintenant / 1000) + dureeS
  return `${id}.${exp}.${signature(id, exp, cle)}`
}

/** `{ porteurId, exp }` si le jeton est intact et non expiré, `null` sinon. */
const verifier = (jeton, { cle, maintenant = Date.now() } = {}) => {
  if (typeof jeton !== 'string' || jeton.length > 200) return null
  const parties = jeton.split('.')
  if (parties.length !== 3) return null
  const [porteurId, expTexte, recue] = parties
  if (!UUID.test(porteurId) || !/^\d{1,12}$/.test(expTexte)) return null

  const exp = Number(expTexte)
  const attendue = Buffer.from(signature(porteurId, exp, cle))
  const fournie = Buffer.from(recue)
  if (attendue.length !== fournie.length || !timingSafeEqual(attendue, fournie)) return null
  if (exp * 1000 <= maintenant) return null
  return { porteurId, exp }
}

export default { DUREE_S, secret, signer, verifier }
