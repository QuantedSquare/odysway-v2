// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineOrganization } from 'nuxt-schema-org/schema'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/mdc',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxt/image',
    'nuxt-calendly',
    'nuxt-gtag',
    // 'nuxt-security',
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
  devtools: { enabled: true },
  app: {
    head: {
      titleTemplate: '%s • Odysway',
      link: [
        // Google Analytics
        { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        { rel: 'preconnect', href: 'https://www.google-analytics.com' },
        { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
        // Meta Pixel
        { rel: 'preconnect', href: 'https://connect.facebook.net' },
        { rel: 'dns-prefetch', href: 'https://connect.facebook.net' },
        { rel: 'preconnect', href: 'https://www.facebook.com' },
        { rel: 'dns-prefetch', href: 'https://www.facebook.com' },
      ],
      // script: [
      //   { src: 'https://embed.small.chat/TD5UA8M5KC05K7GGNJNM.js', async: true },
      // ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },

  },
  site: {
    url: process.env.NUXT_SITE_URL || 'https://odysway.com', // TODO: change the first to the dev env
    name: process.env.NUXT_SITE_NAME || 'Odysway',
    indexable: process.env.NUXT_SITE_ENV === 'production',
  },
  content: {
    preview: {
      api: 'https://api.nuxt.studio',
      dev: true,
    },
    // database: {
    //   type: 'postgres',
    //   url: process.env.POSTGRES_URL || 'postgres://localhost:5432/nuxt',
    // },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      environment: process.env.VERCEL_ENV || 'development',
      siteURL: process.env.VERCEL_URL || 'http://localhost:3000',
      metapixel: {
        default: { id: process.env.METAPIXEL_ID || '', pageView: 'false' },
      },
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  routeRules: {
    '/': { prerender: true },
    '/api/**': { cors: true },
  },
  // ot sure this improve a lot.
  features: {
    inlineStyles: false,
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
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
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
    enabled: true, // process.env.NUXT_SITE_ENV === 'production',
    id: process.env.GTAG_ID || '',
    initMode: 'manual',
    initCommands: [
      // Setup up consent mode
      ['consent', 'default', {
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        ad_storage: 'denied',
        analytics_storage: 'denied',
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
  // security: {
  //   headers: {
  //     contentSecurityPolicy: {
  //       'default-src': ['\'self\''],
  //       'script-src': [
  //         '\'self\'',
  //         '\'unsafe-inline\'',
  //         '\'unsafe-eval\'', // Required for WebAssembly
  //         '\'wasm-unsafe-eval\'', // Required for WebAssembly
  //         'https://www.googletagmanager.com',
  //         'https://www.google-analytics.com',
  //         'https://region1.google-analytics.com',
  //         'https://connect.facebook.net',
  //         'https://static.hotjar.com',
  //         'https://script.hotjar.com',
  //         'https://assets.calendly.com',
  //       ],
  //       'img-src': [
  //         '\'self\'',
  //         'data:',
  //         'https://www.google-analytics.com',
  //         'https://region1.google-analytics.com',
  //         'https://www.googletagmanager.com',
  //         'https://connect.facebook.net',
  //         'https://static.hotjar.com',
  //         'https://script.hotjar.com',
  //         'https://assets.calendly.com',
  //       ],
  //       'connect-src': [
  //         '\'self\'',
  //         'ws://localhost:4000', // Allow WebSocket connections in development
  //         'wss://localhost:4000', // Allow secure WebSocket connections in development
  //         'https://www.google-analytics.com',
  //         'https://region1.google-analytics.com',
  //         'https://www.googletagmanager.com',
  //         'https://connect.facebook.net',
  //         'https://static.hotjar.com',
  //         'https://script.hotjar.com',
  //         'https://assets.calendly.com',
  //       ],
  //       'frame-src': [
  //         '\'self\'',
  //         'https://www.googletagmanager.com',
  //         'https://connect.facebook.net',
  //         'https://calendly.com',
  //       ],
  //       'style-src': [
  //         '\'self\'',
  //         '\'unsafe-inline\'',
  //         'https://assets.calendly.com',
  //       ],
  //       'worker-src': ['\'self\'', 'blob:'], // Required for WebAssembly workers
  //       'child-src': ['\'self\'', 'blob:'], // Required for WebAssembly workers
  //     },
  //     crossOriginEmbedderPolicy: 'require-corp',
  //     crossOriginOpenerPolicy: 'same-origin',
  //     crossOriginResourcePolicy: 'same-origin',
  //     xContentTypeOptions: 'nosniff',
  //     xFrameOptions: 'SAMEORIGIN',
  //     xXSSProtection: '1; mode=block',
  //     referrerPolicy: 'strict-origin-when-cross-origin',
  //     permissionsPolicy: {
  //       camera: ['self'],
  //       microphone: ['self'],
  //       geolocation: ['self'],
  //       payment: ['self'],
  //     },
  //   },
  //   // csrf: {
  //   //   https: process.env.NODE_ENV === 'production',
  //   // },
  //   rateLimiter: {
  //     tokensPerInterval: 150,
  //     interval: 'hour',
  //   },
  //   // cors: {
  //   //   origin: process.env.NUXT_SITE_URL || 'https://odysway.com',
  //   //   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  //   //   credentials: true,
  //   // },
  // },
  seo: {
    meta: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      description: 'Odysway est une agence de voyage en ligne, qui propose des expériences de voyage différentes, loin des circuits touristiques classiques.',
      ogTitle: process.env.npm_package_name,
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
