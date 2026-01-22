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
        config.plugins.push(vuetify({
          autoImport: true,
        }))
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
        // Critical: Preconnect to Sanity CDN for LCP image (must be first)
        { rel: 'preconnect', href: 'https://nu6yntji.apicdn.sanity.io', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://cdn.sanity.io', crossorigin: 'anonymous' },
        // Resource hints for external domains (defer actual script loading)
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
        { rel: 'dns-prefetch', href: 'https://connect.facebook.net' },
        // { rel: 'dns-prefetch', href: 'https://static.hotjar.com' },
      ],
      script: [
        {
          id: 'gtm-script',
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NP63ZR5');`,
        },
      ],
      noscript: [
        {
          id: 'gtm-noscript',
          tagPosition: 'bodyOpen',
          innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NP63ZR5" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
        },
      ],

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
      algolia: {
        applicationId: process.env.ALGOLIA_ID,
        apiKey: process.env.ALGOLIA_API_READ_ID,
      },
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  routeRules: {
    // Homepage and main sections
    '/': { isr: 60 * 60 * 24 }, // 1 day
    '/voyages': { isr: 60 * 60 * 24 },
    '/prochains-departs': { isr: 60 * 60 * 24 },
    // Redirect legacy or non-existent index to listing page
    '/search': { redirect: { to: '/voyages', statusCode: 301 } },

    // Dynamic content pages with slugs
    '/voyages/**': { isr: 60 * 60 * 24 }, // 1 day
    '/destinations/**': { isr: 60 * 60 * 24 },
    '/thematiques/**': { isr: 60 * 60 * 24 }, // 1 day
    '/experiences/**': { isr: 60 * 60 * 24 }, // 1 day
    '/blog/**': { isr: 60 * 60 * 24 }, // 1 day

    // Singleton pages (static content)
    '/entreprise': { isr: 60 * 60 * 24 * 5 }, // 5 days - less frequently updated
    '/sur-mesure': { isr: 60 * 60 * 24 * 5 },
    '/vision-voyage-odysway': { isr: 60 * 60 * 24 * 5 },
    '/contact': { isr: 60 * 60 * 24 * 5 },
    '/faq': { isr: 60 * 60 * 24 * 5 },
    '/avis-voyageurs': { isr: 60 * 60 * 24 * 5 },
    '/offre-cadeau': { isr: 60 * 60 * 24 * 5 },
    '/nous-recrutons': { isr: 60 * 60 * 24 * 5 },
    '/devis': { isr: 60 * 60 * 24 * 5 },
    '/checkout': { isr: 60 * 60 * 24 * 5 },

    // Legal pages (rarely updated)
    '/politique-de-confidentialite': { isr: 60 * 60 * 24 * 5 }, // 5 days
    '/mentions-legales': { isr: 60 * 60 * 24 * 5 },
    '/conditions-generales-de-vente': { isr: 60 * 60 * 24 * 5 },
    '/cheques-vacances': { isr: 60 * 60 * 24 * 5 },
    '/confirmation': { isr: 60 * 60 * 24 * 5 },

    // API routes
    '/api/**': { cors: true },
  },
  // Inline critical CSS for better performance
  features: {
    inlineStyles: true, // Inline critical CSS to eliminate render-blocking CSS request
  },
  experimental: {
    payloadExtraction: true,
    appManifest: false,
  },
  compatibilityDate: '2024-11-01',
  nitro: {
    compressPublicAssets: true,
    imports: {
      dirs: [
        'server/utils/**',
      ],
    },
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      },
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    // Uncomment for Nuxt4 upgrade
    // optimizeDeps: {
    //   include: ['minimatch', 'brace-expansion', '@sanity/visual-editing'],
    // },
    // resolve: {
    //   alias: {
    //     'react-compiler-runtime': 'react-compiler-runtime',
    //     react: 'react',
    //   },
    // },
    build: {
      sourcemap: process.env.VERCEL_ENV !== 'production', // Disable sourcemaps in production to reduce payload
      cssCodeSplit: false, // Disable CSS code splitting to reduce the number of blocking requests
      minify: 'esbuild', // Use esbuild for fast minification (also handles CSS)
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Optimize SCSS compilation
          quietDeps: true,
        },
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
    useCdn: true, // Disable CDN for instant updates (recommended for webhooks)
    withCredentials: false,
    visualEditing: {
      token: process.env.SANITY_VIEWER_TOKEN,
      studioUrl: process.env.SANITY_STUDIO_URL,
      stega: process.env.VERCEL_ENV !== 'production',
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
  sitemap: {
    // Use our runtime source that fetches dynamic URLs from Sanity
    sources: [
      '/api/__sitemap__/urls',
    ],
  },
})
