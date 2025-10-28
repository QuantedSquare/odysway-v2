// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineOrganization } from 'nuxt-schema-org/schema'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/mdc',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    '@nuxt/image',
    'nuxt-calendly',
    'nuxt-gtag',
    '@nuxtjs/sanity',
    'nuxt-meta-pixel',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error This come from Vuetify doc.
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  components: [
    '~/components',
    { path: '~/components/content', pathPrefix: false },
  ],
  devtools: {
    enabled: false, // to avoid build problem "Pre-transform error: spawn EBADF"
    timeline: {
      enabled: true,
    },
  },
  app: {
    head: {
      titleTemplate: '%s - Odysway',
      link: [
        // Preload critical logo for LCP optimization
        { rel: 'preload', href: '/logos/Logo-Odysway-Bleu.png', as: 'image', fetchpriority: 'high' },
        // Resource hints for external domains (defer actual script loading)
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
        { rel: 'dns-prefetch', href: 'https://connect.facebook.net' },
        { rel: 'dns-prefetch', href: 'https://static.hotjar.com' },
        // Preconnect to Sanity CDN for faster image loading
        { rel: 'preconnect', href: 'https://nu6yntji.apicdn.sanity.io', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://cdn.sanity.io', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://nu6yntji.apicdn.sanity.io' },
        { rel: 'dns-prefetch', href: 'https://cdn.sanity.io' },
      ],
      // script: [
      //   { src: 'https://embed.small.chat/TD5UA8M5KC05K7GGNJNM.js', async: true },
      // ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },

  },
  site: {
    url: process.env.BASE_URL || 'https://odysway.com', // TODO: change the first to the dev env
    name: process.env.NUXT_SITE_NAME || 'Odysway',
    indexable: process.env.VERCEL_ENV === 'production',
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      environment: process.env.VERCEL_ENV || 'development',
      siteURL: process.env.BASE_URL || 'http://localhost:3000',
      metapixel: {
        default: { id: process.env.METAPIXEL_ID || '' },
      },
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  routeRules: {
    // Homepage and main sections
    '/': { isr: 60 },
    '/search': { isr: 60 },
    '/prochains-departs': { isr: 60 },

    // Dynamic content pages with slugs
    '/voyages/**': { isr: 60 },
    '/destinations/**': { isr: 60 },
    '/thematiques/**': { isr: 60 },
    '/experiences/**': { isr: 60 },
    '/blog/**': { isr: 60 },

    // Singleton pages (static content)
    '/entreprise': { isr: 300 }, // 5 min - less frequently updated
    '/sur-mesure': { isr: 300 },
    '/vision-voyage-odysway': { isr: 300 },
    '/contact': { isr: 300 },
    '/faq': { isr: 300 },
    '/avis-voyageurs': { isr: 300 },
    '/offre-cadeau': { isr: 300 },
    '/nous-recrutons': { isr: 300 },
    '/devis': { isr: 300 },
    '/checkout': { isr: 300 },

    // Legal pages (rarely updated)
    '/politique-de-confidentialite': { isr: 3600 }, // 1 hour
    '/mentions-legales': { isr: 3600 },
    '/conditions-generales-de-vente': { isr: 3600 },
    '/cheques-vacances': { isr: 3600 },
    '/confirmation': { isr: 3600 },

    // API routes
    '/api/**': { cors: true },
  },
  // Inline critical CSS for better performance
  features: {
    inlineStyles: true, // Changed from false - inlining CSS eliminates render-blocking request
  },
  experimental: {
    payloadExtraction: true,
  },
  compatibilityDate: '2024-11-01',
  nitro: {
    imports: {
      dirs: [
        'server/utils/**',
      ],
    },
    prerender: {
      routes: ['/'],
    },
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
      },
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    build: {
      sourcemap: true,
      cssCodeSplit: false, // Combine all CSS into single file to reduce requests
    },
  },
  calendly: {
    isEnabled: true,
    loadWidgetCSS: false,
    loadWidgetCloseIconSvg: false,
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  gtag: {
    enabled: process.env.VERCEL_ENV === 'production',
    id: process.env.GTAG_ID || '',
    initMode: 'manual',
    initCommands: [
      // Setup up consent mode
      ['consent', 'default', {
        ad_user_data: process.env.VERCEL_ENV === 'production' ? 'denied' : 'granted',
        ad_personalization: process.env.VERCEL_ENV === 'production' ? 'denied' : 'granted',
        ad_storage: process.env.VERCEL_ENV === 'production' ? 'denied' : 'granted',
        analytics_storage: process.env.VERCEL_ENV === 'production' ? 'denied' : 'granted',
        wait_for_update: 500,
      }],
    ],
  },
  image: {
    screens: {
      10: 10,
      320: 320,
      640: 640,
      768: 768,
      1024: 1024,
      1280: 1280,
      1536: 1536,
      3072: 3072,
    },
    sanity: {
      projectId: process.env.SANITY_PROJECT_ID,
    },
  },
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: '2025-04-01',
    useCdn: false, // Disable CDN for instant updates (recommended for webhooks)
    withCredentials: false,
    visualEditing: {
      token: process.env.SANITY_VIEWER_TOKEN,
      studioUrl: process.env.SANITY_STUDIO_URL,
      stega: true,
    },
  },
  schemaOrg: {
    identity: defineOrganization({
      '@type': ['Organization', 'TravelAgency', 'OnlineStore'],
      // Basic Information
      'name': 'ODYSWAY',
      'alternateName': 'Odysway - Voyages en immersion',
      'description': 'Odysway est l\'agence spécialiste des voyages en immersion. Nous proposons un tourisme authentique et responsable qui vous fera voyager différemment.',
      'url': 'https://odysway.com',
      'logo': '/logos/logo_noir.png',

      // Contact Information
      'email': 'contact@odysway.com',
      'telephone': '+ 33 (0) 1 84 80 79 75',
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'contactType': 'service client',
          'telephone': '+ 33 (0) 1 84 80 79 75',
          'email': 'contact@odysway.com',
          'availableLanguage': ['French', 'English'],
          'hoursAvailable': {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'opens': '09:30:00',
            'closes': '18:30:00',
          },
        },
      ],

      // Business Details
      'foundingDate': '2018-01-01',
      'founder': {
        '@type': 'Person',
        'name': 'Alexandre Ottmann',
      },

      // Legal Information
      'legalName': 'ODYSWAY SAS',
      'priceRange': '€€',

      // Business Address
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '27 avenue Nicolas Boileau',
        'addressLocality': 'Le Plessis Trévise',
        'postalCode': '94420',
        'addressCountry': 'FR',
      },

      // Return & Cancellation Policy
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'name': 'Politique d\'annulation standard',
        'merchantReturnDays': '30',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'applicableCountry': 'FR',
      },

      // Payment Methods
      'paymentAccepted': [
        'Carte bancaire',
        'Virement bancaire',
        'Chèque',
        'Chèques-vacances',
      ],
      'currenciesAccepted': ['EUR'],

      // Social Media
      'sameAs': [
        'https://www.facebook.com/odysway',
        'https://www.instagram.com/odysway',
        'https://www.linkedin.com/company/odysway',
      ],

      // Trust Indicators
      // 'hasCredential': [
      //   {
      //     '@type': 'EducationalOccupationalCredential',
      //     'credentialCategory': 'Immatriculation Atout France',
      //     'url': 'https://registre-operateurs-de-voyages.atout-france.fr',
      //   },
      // ],

      // Business Keywords
      'slogan': 'La rencontre au cœur du voyage',
      'keywords': [
        'voyage en immersion',
        'tourisme responsable',
        'voyage authentique',
        'agence de voyage',
        'séjour immersif',
        'voyage durable',
        'voyage en petit groupe',
      ],

      // Business Hours
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '09:30:00',
          'closes': '18:30:00',
        },
      ],
    }),
  },
  seo: {
    meta: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      description: 'Odysway est une agence de voyage en ligne, qui propose des expériences de voyage différentes, loin des circuits touristiques classiques.',
      ogType: 'website',
      ogDescription: 'Odysway est une agence de voyage en ligne, qui propose des expériences de voyage différentes, loin des circuits touristiques classiques.',
      twitterCreator: '@odysway',
      twitterSite: '@odysway',
      author: 'Romain Masina',
      colorScheme: 'light',
      applicationName: 'Odysway',
      google: 'nopagereadaloud',
      googlebot: 'max-snippet',
    },
  },
})
