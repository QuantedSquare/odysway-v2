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
    const path = route.path
    // Homepage
    if (path === '/') {
      return 'Homepage'
    }
    // Blog pages
    if (path.startsWith('/blog') || (path.match(/^\/[^/]+$/) && route.name?.toString().includes('blog'))) {
      return 'Blog'
    }
    // Avis (Reviews) page
    if (path === '/avis-voyageurs' || path.startsWith('/avis')) {
      return 'Page Avis'
    }
    // Voyage pages (individual trip pages)
    if (route.name === 'voyages-voyageSlug') {
      return 'Page Voyage'
    }
    console.log('route.path', route.path)
    if (path.startsWith('/voyages')) {
      return 'Page Recherche'
    }
    // Destination pages
    if (path.startsWith('/destinations') || path === '/destinations') {
      return 'Destination'
    }
    // Experience pages
    if (path.startsWith('/experiences') || path === '/experiences') {
      return 'Experience'
    }
    // Thematique pages
    if (path.startsWith('/thematiques') || path === '/thematiques') {
      return 'Thematique'
    }
    // Devis page
    if (path === '/devis') {
      return 'Devis'
    }
    // Checkout page
    if (path === '/checkout') {
      return 'Checkout'
    }
    // Confirmation page
    if (path === '/confirmation') {
      return 'Confirmation'
    }
    // Offre cadeau page
    if (path === '/offre-cadeau') {
      return 'Offre Cadeau'
    }
    // Sur mesure page
    if (path === '/sur-mesure') {
      return 'Sur Mesure'
    }
    // Vision voyage Odysway page
    if (path === '/vision-voyage-odysway') {
      return 'Vision Voyage Odysway'
    }
    // Entreprise page
    if (path === '/entreprise') {
      return 'Entreprise'
    }
    // Mentions légales page
    if (path === '/mentions-legales') {
      return 'Mentions Légales'
    }
    // Conditions générales de vente page
    if (path === '/conditions-generales-de-vente') {
      return 'Conditions Générales de Vente'
    }
    // FAQ page
    if (path === '/faq') {
      return 'FAQ'
    }
    // Avis voyageurs page
    if (path === '/avis-voyageurs') {
      return 'Avis Voyageurs'
    }
    // Chèques vacances page
    if (path === '/cheques-vacances') {
      return 'Chèques Vacances'
    }
    // All other pages
    return 'Autres'
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
