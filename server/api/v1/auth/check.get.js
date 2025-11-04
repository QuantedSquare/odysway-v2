import { defineEventHandler, getCookie, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'booking_token')
  const jwtSecret = process.env.BOOKING_JWT_SECRET
  if (!token) {
    return { statusCode: 401, message: 'Non authentifié.' }
  }
  try {
    const config = useRuntimeConfig()
    const isDev = config.public.environment !== 'production'

    const payload = jwt.verify(token, jwtSecret)

    // Refresh token for another 7 days
    const refreshedToken = jwt.sign({ id: payload?.id }, jwtSecret, { expiresIn: '7d' })
    setCookie(event, 'booking_token', refreshedToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: isDev,
    })

    return { success: true, refreshed: true }
  }
  catch {
    return { statusCode: 401, message: 'Non authentifié.' }
  }
})
