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
 * l'ensemble du back-office.
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
