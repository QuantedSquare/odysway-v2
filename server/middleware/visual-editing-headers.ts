export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  if (config.public.environment === 'production') return

  const origins = new Set(['http://localhost:3333', 'https://www.sanity.io/', 'https://odysway-studio.sanity.studio/'])
  if (process.env.SANITY_STUDIO_URL) origins.add(process.env.SANITY_STUDIO_URL)
  setResponseHeader(event, 'Content-Security-Policy', `frame-ancestors 'self' ${[...origins].join(' ')}`)
  removeResponseHeader(event, 'X-Frame-Options')
})
