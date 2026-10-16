import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

// Codes à 6 chiffres du rattachement d'une seconde adresse (Espace Voyageur).
// Stockés hachés : une fuite de la table ne livre aucun code utilisable.
//
// PUR hormis le hasard (tests/unit/espaceCodes.test.mjs).

const DUREE_MS = 15 * 60 * 1000
const ESSAIS_MAX = 5

const secret = () => {
  const s = process.env.ESPACE_CODE_SECRET || process.env.BOOKING_JWT_SECRET
  if (!s) throw new Error('ESPACE_CODE_SECRET (ou BOOKING_JWT_SECRET) manquant')
  return s
}

const nouveauCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0')

// Le hachage lie le code au compte et à l'adresse : un code valable pour une
// autre demande ne passe pas.
const hacher = ({ userId, email, code }, cle = secret()) =>
  createHmac('sha256', cle).update(`${userId}:${email}:${code}`).digest('hex')

const verifier = ({ userId, email, code, hash }, cle = secret()) => {
  if (!/^\d{6}$/.test(String(code || ''))) return false
  const attendu = Buffer.from(hash, 'hex')
  const recu = Buffer.from(hacher({ userId, email, code: String(code) }, cle), 'hex')
  return attendu.length === recu.length && timingSafeEqual(attendu, recu)
}

export default { DUREE_MS, ESSAIS_MAX, nouveauCode, hacher, verifier }
