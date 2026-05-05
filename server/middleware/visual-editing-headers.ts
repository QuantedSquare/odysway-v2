export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  if (config.public.environment === 'production') return

  const studioUrl = process.env.SANITY_STUDIO_URL || 'http://localhost:3333'
  setResponseHeader(event, 'Content-Security-Policy', `frame-ancestors 'self' ${studioUrl}`)
  removeResponseHeader(event, 'X-Frame-Options')
})
