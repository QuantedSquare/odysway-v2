import { defineEventHandler, setCookie } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const isDev = config.public.environment !== 'production'
  setCookie(event, 'booking_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: isDev,
  })
  return { success: true }
})
