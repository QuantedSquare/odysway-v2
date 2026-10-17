import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// Chiffrement des données les plus sensibles de l'Espace Voyageur (numéro de
// pièce d'identité) : AES-256-GCM, clé hors base.
//
// Format stocké : "v1.<iv>.<tag>.<chiffré>" en base64url. Le préfixe de
// version permettra de changer de clé (v2) sans tout déchiffrer d'un coup.
//
// PUR hormis le hasard de l'IV (tests/unit/espaceChiffrement.test.mjs).

const cleEnv = () => {
  const brute = process.env.ESPACE_CHIFFREMENT_KEY
  if (!brute) throw new Error('ESPACE_CHIFFREMENT_KEY manquante')
  const cle = Buffer.from(brute, 'base64')
  if (cle.length !== 32) throw new Error('ESPACE_CHIFFREMENT_KEY doit faire 32 octets (base64)')
  return cle
}

const chiffrer = (texte, cle = cleEnv()) => {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', cle, iv)
  const chiffre = Buffer.concat([c.update(String(texte), 'utf8'), c.final()])
  return ['v1', iv, c.getAuthTag(), chiffre].map(p => (typeof p === 'string' ? p : p.toString('base64url'))).join('.')
}

/** Rend le texte, ou lève si la valeur a été altérée ou chiffrée avec une autre clé. */
const dechiffrer = (valeur, cle = cleEnv()) => {
  const [version, iv, tag, chiffre] = String(valeur || '').split('.')
  if (version !== 'v1' || !iv || !tag || chiffre === undefined) throw new Error('Valeur chiffrée illisible')
  const d = createDecipheriv('aes-256-gcm', cle, Buffer.from(iv, 'base64url'))
  d.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([d.update(Buffer.from(chiffre, 'base64url')), d.final()]).toString('utf8')
}

export default { chiffrer, dechiffrer }
