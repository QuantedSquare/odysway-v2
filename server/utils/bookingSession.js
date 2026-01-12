import { createError, getCookie } from 'h3'
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

export const requireBookingUser = (event) => {
  const user = getBookingUserOrNull(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié.' })
  }
  return user
}
