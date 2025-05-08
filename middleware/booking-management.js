import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    const token = localStorage.getItem('booking_token')
    if (token !== 'booking-backoffice-token') {
      return navigateTo('/booking-login')
    }
  }
})
