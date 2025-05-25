import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async () => {
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
