declare global {
  interface Window {
    dataLayer: any[]
  }
}

export default defineNuxtPlugin((nuxtApp) => {
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
   */
  const getPageType = (route: any): string => {
    const path = route.path

    if (path === '/') return 'Homepage'
    if (path.startsWith('/voyages/') && !path.endsWith('/voyages')) return 'Page Voyage'
    if (path.startsWith('/blog/') || path === '/blog') return 'Blog'
    if (path === '/avis-voyageurs') return 'Page Avis'
    return 'Autres'
  }

  /**
   * Track page view for SPA navigation
   * Must push preload_data BEFORE GTM processes the page
   */
  const trackPageView = (to: any) => {
    const pageType = getPageType(to)

    // Push preload_data event
    trackPreloadData(pageType)

    console.log('📄 Page View:', {
      path: to.path,
      pageType,
    })
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
