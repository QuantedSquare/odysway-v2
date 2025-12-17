import { defineEventHandler, getCookie, getQuery, sendRedirect, setCookie } from 'h3'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import jwt from 'jsonwebtoken'
// import { isAllowedEmail, getSuperadmins } from '~/server/utils/bookingAuth'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isDev = config.public.environment !== 'production'

  const query = getQuery(event)
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  const jwtSecret = process.env.BOOKING_JWT_SECRET

  const redirectWithError = code => sendRedirect(event, `/booking-login?error=${code}`)

  if (!clientId || !clientSecret || !redirectUri || !jwtSecret) {
    return redirectWithError('server_config')
  }

  const stateFromCookie = getCookie(event, 'booking_oauth_state')
  const stateFromQuery = typeof query.state === 'string' ? query.state : ''

  // Clear state cookie as soon as we read it
  setCookie(event, 'booking_oauth_state', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: isDev,
  })

  if (!stateFromCookie || stateFromCookie !== stateFromQuery) {
    return redirectWithError('state')
  }

  if (query.error) {
    return redirectWithError('access_denied')
  }

  const code = typeof query.code === 'string' ? query.code : ''
  if (!code) {
    return redirectWithError('missing_code')
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      return redirectWithError('token_exchange')
    }

    const tokenJson = await tokenResponse.json()
    const idToken = tokenJson.id_token
    if (!idToken) {
      return redirectWithError('missing_token')
    }

    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    })

    const email = payload.email
    const emailVerified = payload.email_verified
    if (!emailVerified || !isAllowedEmail(email)) {
      return redirectWithError('unauthorized')
    }

    const superadmins = getSuperadmins()
    const role = superadmins.includes(email.toLowerCase()) ? 'superadmin' : 'user'

    const sessionPayload = {
      sub: payload.sub,
      email,
      name: payload.name,
      picture: payload.picture,
      role,
    }

    const sessionToken = jwt.sign(sessionPayload, jwtSecret, { expiresIn: '7d' })
    setCookie(event, 'booking_token', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: isDev,
    })

    return sendRedirect(event, '/booking-management')
  }
  catch (err) {
    console.error('Google OAuth error', err)
    return redirectWithError('verification')
  }
})
