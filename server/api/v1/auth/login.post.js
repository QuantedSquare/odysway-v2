import { defineEventHandler, readBody, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, password } = body || {}

  const validId = process.env.BOOKINGID
  const validPassword = process.env.BOOKINGPASSWORD
  const jwtSecret = process.env.BOOKING_JWT_SECRET || 'supersecret'

  if (id === validId && password === validPassword) {
    const token = jwt.sign({ id }, jwtSecret, { expiresIn: '1h' })
    setCookie(event, 'booking_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
      secure: process.env.NODE_ENV === 'production',
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
