import { randomUUID } from 'node:crypto'
import { defineEventHandler, sendRedirect, setCookie } from 'h3'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const isDev = config.public.environment !== 'production'

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = config.public.environment !== 'production' ? 'http://localhost:3000/api/v1/auth/google/callback' : process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return {
      statusCode: 500,
      message: 'Google OAuth is not configured.',
    }
  }

  const state = randomUUID()
  setCookie(event, 'booking_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
    secure: isDev,
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    state,
    prompt: 'select_account',
  })

  return sendRedirect(event, `${GOOGLE_AUTH_URL}?${params.toString()}`)
})
