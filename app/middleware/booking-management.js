import { defineNuxtRouteMiddleware, navigateTo } from '#app'

// Client-side companion to server/middleware/bms-auth.js.
//
// The Nitro middleware is the actual enforcement point: it redirects
// unauthenticated requests to /booking-login before the page is ever rendered,
// and 401s every BMS endpoint. This middleware only covers client-side
// navigations — an SPA transition into the backoffice, or a session that expired
// while the tab stayed open — so it must never be treated as the line of defence.
//
// It carries no environment logic on purpose: /api/v1/auth/check owns the
// decision (including the `nuxt dev` bypass), and this just follows it.
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

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
})
