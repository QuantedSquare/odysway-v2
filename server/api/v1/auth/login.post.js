import { defineEventHandler, readBody, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isDev = config.public.environment !== 'production'
  const body = await readBody(event)
  const { id, password } = body || {}

  const validId = process.env.BOOKINGID
  const validPassword = process.env.BOOKINGPASSWORD
  const jwtSecret = process.env.BOOKING_JWT_SECRET

  if (id === validId && password === validPassword) {
    const token = jwt.sign({ id }, jwtSecret, { expiresIn: '7d' })
    setCookie(event, 'booking_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: isDev,
    })
    return { success: true }
  }
  else {
    return {
      statusCode: 401,
      message: 'Identifiant ou mot de passe incorrect.',
    }
  }
})
