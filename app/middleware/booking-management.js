import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig } from '#app'

export default defineNuxtRouteMiddleware(async () => {
  const config = useRuntimeConfig()
  const isProd = config.public.environment === 'production'

  // Skip auth in non-production environments to ease local development
  if (!isProd) {
    return
  }

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
