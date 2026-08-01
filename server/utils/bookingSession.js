import { createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

// Single source of truth for "is BMS auth enforced right now".
//
// `import.meta.dev` is a build-time constant: it is statically false in any
// built bundle, so the bypass is dead code on Vercel whatever VERCEL_ENV says.
// This is deliberate — the previous VERCEL_ENV-derived check left preprod and
// every preview deployment wide open. Set BMS_AUTH_STRICT=true to exercise the
// real Google login flow locally.
export const isBookingAuthBypassed = () =>
  import.meta.dev && process.env.BMS_AUTH_STRICT !== 'true'

// Cookies must be Secure on every deployed environment, not just production.
export const useSecureCookies = () => !import.meta.dev

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
