import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, password } = body || {}

  const validId = process.env.BOOKINGID
  const validPassword = process.env.BOOKINGPASSWORD

  if (id === validId && password === validPassword) {
    // For now, return a static token. Replace with JWT if needed.
    return { token: 'booking-backoffice-token' }
  }
  else {
    return {
      statusCode: 401,
      message: 'Identifiant ou mot de passe incorrect.',
    }
  }
})
