import { defineEventHandler, setCookie } from 'h3'

export default defineEventHandler((event) => {
  // Cookies `Secure` partout sauf sur un serveur de dev local (http).
  const isDev = isLocalDev()
  setCookie(event, 'booking_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: !isDev,
  })
  return { success: true }
})
