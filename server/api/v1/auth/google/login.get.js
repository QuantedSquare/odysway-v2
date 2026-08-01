import { randomUUID } from 'node:crypto'
import { defineEventHandler, sendRedirect, setCookie } from 'h3'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export default defineEventHandler((event) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  // Previously keyed on VERCEL_ENV, which sent preprod through the localhost
  // callback and made Google login impossible there.
  const redirectUri = getGoogleRedirectUri()

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
    // Was `secure: isDev` — inverted, so the state cookie was dropped by the
    // browser on http://localhost (login could never complete locally) and sent
    // without the Secure attribute in production.
    secure: useSecureCookies(),
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
