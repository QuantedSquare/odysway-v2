import { defineEventHandler, getCookie, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

// Under `nuxt dev` the BMS is served without auth (see isBookingAuthBypassed),
// so tell the client not to bounce to /booking-login. No user is returned: the
// layout renders as anonymous, exactly as it did before.
const unauthenticated = () =>
  isBookingAuthBypassed()
    ? { success: true, bypassed: true, user: null }
    : { statusCode: 401, message: 'Non authentifié.' }

export default defineEventHandler((event) => {
  const token = getCookie(event, 'booking_token')
  const jwtSecret = process.env.BOOKING_JWT_SECRET

  if (!token || !jwtSecret) {
    return unauthenticated()
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    const email = payload?.email

    if (!isAllowedEmail(email)) {
      return unauthenticated()
    }

    const superadmins = getSuperadmins()
    const role = payload?.role || (superadmins.includes(email.toLowerCase()) ? 'superadmin' : 'user')

    const refreshedPayload = {
      sub: payload?.sub,
      email,
      name: payload?.name,
      picture: payload?.picture,
      role,
    }

    const refreshedToken = jwt.sign(refreshedPayload, jwtSecret, { expiresIn: '7d' })
    setCookie(event, 'booking_token', refreshedToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: useSecureCookies(),
    })

    return {
      success: true,
      refreshed: true,
      user: refreshedPayload,
    }
  }
  catch {
    return unauthenticated()
  }
})
