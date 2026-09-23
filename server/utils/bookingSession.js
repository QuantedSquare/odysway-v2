import { timingSafeEqual } from 'node:crypto'
import { createError, getCookie, getHeader } from 'h3'
import jwt from 'jsonwebtoken'

export const getBookingUserOrNull = (event) => {
  const token = getCookie(event, 'booking_token')
  const jwtSecret = process.env.BOOKING_JWT_SECRET
  if (!token || !jwtSecret) return null

  try {
    const payload = jwt.verify(token, jwtSecret)
    const email = payload?.email
    if (!isAllowedEmail(email)) return null

    const normalized = email.toLowerCase()
    const role = payload?.role || (getSuperadmins().includes(normalized) ? 'superadmin' : 'user')
    return {
      sub: payload?.sub,
      email,
      name: payload?.name,
      picture: payload?.picture,
      role,
    }
  }
  catch {
    return null
  }
}

/**
 * Appel machine émis par Ulysse, le back-office qui remplace
 * /booking-management.
 *
 * Ulysse authentifie ses propres utilisateurs (Supabase + Google, avec une
 * whitelist en base) et n'a donc pas de cookie booking_token à présenter. Il
 * s'annonce avec un jeton de service dédié, révocable indépendamment, et
 * transmet l'email de l'utilisateur réel pour que le journal d'activité
 * attribue l'action à une personne et non à « la machine ».
 *
 * Ce jeton ouvre l'ensemble du back-office : toute route derrière
 * requireCrmAccess, et tout /api/v1/booking/** et /api/v1/ac/** hors de la liste
 * publique de server/middleware/backoffice-auth.js. Le restreindre endpoint par
 * endpoint protégerait peu : Ulysse détient déjà la clé service_role de la même
 * base Supabase. Il passe par ces endpoints pour ses écritures parce que c'est
 * ici que vivent le mapping AC, la cascade soft-delete et le journal.
 */
export const getUlysseServiceUser = (event) => {
  const attendu = process.env.ULYSSE_SERVICE_TOKEN
  if (!attendu) return null

  const fourni = getHeader(event, 'x-ulysse-service-token')
  if (!fourni) return null

  // Comparaison à temps constant : une comparaison naïve fuit la longueur du
  // préfixe correct et rend le jeton devinable octet par octet.
  const a = Buffer.from(fourni)
  const b = Buffer.from(attendu)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const email = getHeader(event, 'x-ulysse-user') || 'ulysse@odysway.com'
  return { sub: 'ulysse-service', email, name: `Ulysse · ${email}`, role: 'service' }
}

/**
 * Garde du back-office : endpoints qui exposent ou modifient des données CRM ou
 * opérationnelles (identité client, prix d'achat, marges, commissions, montants
 * payés, dates, factures).
 *
 * Deux porteurs sont acceptés :
 *  - la session `booking_token` (cookie signé + email @odysway.com/superadmin) ;
 *  - le jeton de service `x-ulysse-service-token` émis par Ulysse.
 *
 * La seule dérogation est un serveur de dev local. Nitro fige
 * `process.env.NODE_ENV` à "production" dans tout build : un déploiement Vercel
 * — preview comme production — exige donc l'authentification. Ne jamais
 * dériver cette dérogation de VERCEL_ENV : les previews sont des URL publiques.
 */
export const isLocalDev = () => process.env.NODE_ENV !== 'production'

export const requireCrmAccess = (event) => {
  const user = getUlysseServiceUser(event) ?? getBookingUserOrNull(event)
  if (user) return user
  if (isLocalDev()) return null
  // `data.code` : un refus d'accès n'est pas un incident du tunnel de commande,
  // server/plugins/funnelErrorHook.ts ne le remonte donc pas en alerte.
  throw createError({ statusCode: 401, statusMessage: 'Non authentifié.', data: { code: 'BACKOFFICE_AUTH_REQUIRED' } })
}

/**
 * Variante non bloquante : renvoie l'utilisateur CRM s'il y en a un, `null`
 * sinon. Sert aux routes qui dégradent la réponse au lieu de la refuser
 * (voir toPublicDeal dans server/utils/dealVisibility.js).
 */
export const getCrmAccessOrNull = (event) => {
  const user = getUlysseServiceUser(event) ?? getBookingUserOrNull(event)
  if (user) return user
  return isLocalDev() ? { sub: 'local-dev', email: 'dev@localhost', role: 'dev' } : null
}
