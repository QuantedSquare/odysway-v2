import { defineEventHandler, getCookie, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'booking_token')
  const jwtSecret = process.env.BOOKING_JWT_SECRET

  if (!token || !jwtSecret) {
    return { statusCode: 401, message: 'Non authentifié.' }
  }

  try {
    const config = useRuntimeConfig()
    const isDev = config.public.environment !== 'production'

    const payload = jwt.verify(token, jwtSecret)
    const email = payload?.email

    if (!isAllowedEmail(email)) {
      return { statusCode: 401, message: 'Non authentifié.' }
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
      secure: isDev,
    })

    return {
      success: true,
      refreshed: true,
      user: refreshedPayload,
    }
  }
  catch {
    return { statusCode: 401, message: 'Non authentifié.' }
  }
})
