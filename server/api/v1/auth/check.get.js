import { defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'booking_token')
  const jwtSecret = process.env.BOOKING_JWT_SECRET || 'supersecret'
  if (!token) {
    return { statusCode: 401, message: 'Non authentifié.' }
  }
  try {
    jwt.verify(token, jwtSecret)
    return { success: true }
  }
  catch {
    return { statusCode: 401, message: 'Non authentifié.' }
  }
})
