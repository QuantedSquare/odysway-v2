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
 * Ce jeton n'ouvre QUE les endpoints qui l'acceptent explicitement — pas
 * l'ensemble du back-office. Ce sont les écritures des écrans « Dates GIR »,
 * « Corbeille » et de la grille tarifaire d'Ulysse :
 *
 *   - assign-departure-deal (POST, DELETE) — rattrapage du dossier de départ
 *   - add-date (POST), [dateId] (PUT, DELETE) — création, publication, suppression
 *   - [dateId]/restore, booked/[bookedId]/restore, trash/deal/[dealId]/restore
 *   - [dateId]/notes (POST), notes/[noteId] (DELETE) — notes de la fiche date
 *   - [dateId]/invoices (POST), invoices/upload-url (POST), invoices/[invoiceId]
 *     (DELETE) — factures fournisseur de la fiche date
 *   - margins/[slug]/pricing (PUT), margins/[slug]/basis (PUT) — coût d'achat,
 *     marge dérivée, bascule (server/utils/marginPricing.js)
 *   - margins/[slug]/seasons (PUT), margins/[slug]/settings (PUT) — saisons et
 *     mode de configuration, par les fonctions existantes de margins.js
 *
 * Les lectures n'en ont pas besoin : Ulysse lit la même base Supabase.
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

export const requireBookingUser = (event) => {
  const user = getBookingUserOrNull(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié.' })
  }
  return user
}

/**
 * Garde des endpoints qui exposent ou modifient des données CRM brutes
 * (identité client, prix d'achat, marges, commissions, montants payés).
 *
 * Deux porteurs sont acceptés, comme ailleurs dans le back-office :
 *  - la session `booking_token` (cookie signé + email @odysway.com/superadmin) ;
 *  - le jeton de service `x-ulysse-service-token` émis par Ulysse.
 *
 * Contrairement au `isProdEnv` des routes /booking (qui vaut
 * `VERCEL_ENV === 'production'`), la seule dérogation ici est un serveur de dev
 * local : Vercel construit les *previews* comme la prod avec
 * NODE_ENV=production, donc un déploiement de preview — URL publique — exige la
 * session au même titre que la prod. Même choix que
 * server/api/v1/ac/deals/[dealId]/inspect.get.js.
 */
const isLocalDev = () => process.env.NODE_ENV !== 'production'

export const requireCrmAccess = (event) => {
  const user = getUlysseServiceUser(event) ?? getBookingUserOrNull(event)
  if (user) return user
  if (isLocalDev()) return null
  throw createError({ statusCode: 401, statusMessage: 'Non authentifié.' })
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
