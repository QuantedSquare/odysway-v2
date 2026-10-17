import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig, useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware(async () => {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()

  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const isLocalHost = import.meta.client
    ? ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
    : false

  // Skip auth in non-production or when running on localhost
  const isDevSsr = nuxtApp?.isHydrating === false && nuxtApp?.ssrContext?.event?.context?.dev
  if (!isProdEnv || isLocalHost || isDevSsr) {
    return
  }

  // Skip auth in non-production environments to ease local development
  if (import.meta.client) {
    try {
      const res = await fetch('/api/v1/auth/check', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return navigateTo('/booking-login')
      }
    }
    catch {
      return navigateTo('/booking-login')
    }
  }
})
