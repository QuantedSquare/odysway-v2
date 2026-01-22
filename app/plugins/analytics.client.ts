import type { RouteLocationNormalized } from 'vue-router'

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>
  }
}
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const environment = config.public.environment
  const cookie = useCookie('odysway_employee_optout')
  const isEmployee = cookie.value === '1'

  if (isEmployee) {
    return // stop initializing GA/Algolia/other trackers
  }

  // Initialize dataLayer if not exists
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
  }

  const router = useRouter()

  const { trackPreloadData } = useGtmTracking()

  /**
   * Determine page type based on route
   * Returns: 'Homepage', 'Page Voyage', 'Blog', 'Page Avis', or 'Autres'
   */
  const getPageType = (route: RouteLocationNormalized): string => {
    return route.path as string
  }

  /**
   * Track page view for SPA navigation
   * Must push preload_data BEFORE GTM processes the page
   */
  const trackPageView = (to: RouteLocationNormalized) => {
    const pageType = getPageType(to)

    // Push preload_data event
    trackPreloadData(pageType)
    if (environment === 'development') {
      console.log('📄 Page View:', {
        path: to.path,
        pageType,
      })
    }
  }

  // Track initial page load
  nuxtApp.hook('app:mounted', () => {
    const route = router.currentRoute.value
    trackPageView(route)
  })

  // Track route changes in SPA
  router.afterEach((to, from) => {
    // Only track if it's a different page (not just hash or query changes)
    if (to.path !== from.path) {
      trackPageView(to)
    }
  })
})
