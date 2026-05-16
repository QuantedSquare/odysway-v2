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
    'nuxt-vitalizer',
    '@nuxtjs/sanity',
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
      titleTemplate: '%s | Odysway',
      link: [
        { rel: 'preconnect', href: 'https://cdn.sanity.io', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://nu6yntji.apicdn.sanity.io', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://nu6yntji.api.sanity.io', crossorigin: 'anonymous' },
        // SST/GTM is loaded on first user interaction (see app.vue), so we
        // only need DNS resolution warm — preconnect would waste the slot
        // since we don't open a TLS connection until the user interacts.
        { rel: 'dns-prefetch', href: 'https://load.sst.odysway.com' },
        { rel: 'dns-prefetch', href: 'https://sst.odysway.com' },
      ],
      htmlAttrs: {
        lang: 'fr',
      },
      noscript: [
        {
          id: 'gtm-noscript',
          tagPosition: 'bodyOpen',
          innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NP63ZR5" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
        },
      ],

    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  site: {
    url: process.env.BASE_URL || 'https://odysway.com', // TODO: change the first to the dev env
    name: process.env.NUXT_SITE_NAME || 'Odysway',
    indexable: process.env.VERCEL_ENV === 'production',
    trailingSlash: false,
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      environment: process.env.VERCEL_ENV || 'development',
      siteURL: process.env.BASE_URL || 'http://localhost:3000',
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
    // ISR caching is only enabled on production. On preview/dev we want every
    // request to hit the live Sanity perspective so visual editing reflects
    // drafts in real time.
    ...(process.env.VERCEL_ENV === 'production' && {
      // Homepage and main sections
      '/': { isr: 60 * 60 * 24 }, // 1 day
      '/voyages': { isr: 60 * 60 * 24 },
      '/prochains-departs': { isr: 60 * 60 * 24 },

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
      '/rdv-projet-voyage': { prerender: true },

      // Legal pages (rarely updated)
      '/politique-de-confidentialite': { isr: 60 * 60 * 24 * 5 }, // 5 days
      '/mentions-legales': { isr: 60 * 60 * 24 * 5 },
      '/conditions-generales-de-vente': { isr: 60 * 60 * 24 * 5 },
      '/cheques-vacances': { isr: 60 * 60 * 24 * 5 },
      '/confirmation': { isr: 60 * 60 * 24 * 5 },
    }),

    // Redirect legacy or non-existent index to listing page
    '/search': { redirect: { to: '/voyages', statusCode: 301 } },
    '/calendly': { redirect: { to: '/rdv-projet-voyage', statusCode: 301 } },
    '/concept': { redirect: { to: '/vision-voyage-odysway', statusCode: 301 } },

    // Legacy blog redirects
    '/blog/le-top-10-des-pays-a-visiter-en-2020': { redirect: { to: '/blog/le-top-10-des-pays-a-visiter', statusCode: 301 } },
    '/blog/sejour-hiver-laponie-2024': { redirect: { to: '/blog/sejour-hiver-laponie', statusCode: 301 } },
    '/blog/top-10-des-destinations-pour-un-voyage-immersif-en-2024': { redirect: { to: '/blog/top-10-des-destinations-pour-un-voyage-immersif', statusCode: 301 } },

    // API routes
    '/api/**': { cors: true },
  },
  // Inline critical CSS for better performance
  features: {
    inlineStyles: true, // Inline critical CSS to eliminate render-blocking CSS request
  },
  experimental: {
    // Inline payloads in SSR HTML rather than emitting a separate _payload.json per route.
    // The separate file is served as a static asset on Vercel and can't be busted by the ISR bypass token,
    // which caused hydration to overwrite freshly-revalidated HTML with stale data.
    payloadExtraction: process.env.VERCEL_ENV !== 'production',
    appManifest: false,
    inlineRouteRules: true,
    serverAppConfig: false,
  },
  compatibilityDate: '2024-11-01',
  nitro: {
    devStorage: { cache: { driver: 'memory' } },
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
    optimizeDeps: {
      include: [
        '@sanity/client',
        '@nuxtjs/sanity > @sanity/client > @sanity/visual-editing',
        'vue-dompurify-html',
        '@date-io/dayjs',
        'dayjs', // CJS
        'dayjs/locale/fr', // CJS
        '@mdi/js',
        'lodash', // CJS
        'search-insights',
        '@sanity/client/stega',
        '@vueuse/core',
      ],
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    build: {
      sourcemap: process.env.VERCEL_ENV !== 'production', // Disable sourcemaps in production to reduce payload
      cssCodeSplit: true, // Enable CSS code splitting so inlineStyles can inline critical CSS per-route
      minify: 'esbuild', // Use esbuild for fast minification (also handles CSS)
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vue core is extremely stable — split it for long-term cache hits
            if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
              return 'vendor-vue'
            }
            // Vuetify is large (~600KB) and changes only on version bumps
            if (id.includes('node_modules/vuetify/')) {
              return 'vendor-vuetify'
            }
          },
        },
      },
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
  hooks: {
    'build:manifest': (manifest) => {
      // find the app entry, css list
      const css = manifest['node_modules/nuxt/dist/app/entry.js']?.css
      if (css) {
        // start from the end of the array and go to the beginning
        for (let i = css.length - 1; i >= 0; i--) {
          // if it starts with 'entry', remove it from the list
          if (css[i].startsWith('entry')) css.splice(i, 1)
        }
      }
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  image: {
    // Include the small breakpoints actually used by the header logo
    // and inline icons so NuxtImg generates exact-size URLs instead of
    // rounding up to 320w (was the source of the ssr:warn flood).
    screens: {
      10: 10,
      20: 20,
      32: 32,
      64: 64,
      110: 110,
      130: 130,
      150: 150,
      180: 180,
      320: 320,
      640: 640,
      768: 768,
      1024: 1024,
      1280: 1280,
      1536: 1536,
      3072: 3072,
    },
    sanity: {
      projectId: process.env.SANITY_PROJECT_ID || '',
    },
  },
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: '2025-04-01',
    useCdn: process.env.VERCEL_ENV === 'production', // CDN is ~30-60s stale; ISR regeneration must read strongly-consistent data
    withCredentials: false,

    // Visual editing (+ stega) pulls in React + ReactDOM + styled-components (~120KB).
    // Only enable on non-production deployments where editors actually preview.
    ...(process.env.VERCEL_ENV !== 'production' && {
      stega: {
        enabled: true,
        studioUrl: process.env.SANITY_STUDIO_URL || 'http://localhost:3333',
      },
      token: process.env.SANITY_VIEWER_TOKEN,
      perspective: 'drafts',
      liveContent: {
        serverToken: process.env.SANITY_VIEWER_TOKEN || '',
        browserToken: process.env.SANITY_VIEWER_TOKEN || '',
      },
      // Visual editing only allow on preprod and via the sanity app
      visualEditing: {
        studioUrl: process.env.SANITY_STUDIO_URL || 'http://localhost:3333',
        token: process.env.SANITY_VIEWER_TOKEN || '',
        stega: true,
        mode: 'live-visual-editing',
      },
    }),
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
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://odysway.com/voyage?destination={search_term_string}',
        'query-input': 'required name=search_term_string',
      },

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
        'name': 'Romain Masina',
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
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Voyages immersifs',
        'itemListElement': [
          {
            '@type': 'OfferCatalog',
            'name': 'Destinations',
            'url': 'https://odysway.com/destinations',
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Voyages',
            'url': 'https://odysway.com/voyages',
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Expériences',
            'url': 'https://odysway.com/experiences',
          },
          {
            '@type': 'OfferCatalog',
            'name': 'Thématiques',
            'url': 'https://odysway.com/thematiques',
          },
        ],
      },

      // Return & Cancellation Policy
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'name': 'Politique d\'annulation standard',
        'merchantReturnDays': '30',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'returnPolicyCountry': 'FR',
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
      description: 'Odysway est l\'agence spécialiste des voyages en immersion. Nous proposons un tourisme authentique et responsable qui vous fera voyager différemment.',
      ogType: 'website',
      ogDescription: 'Odysway est l\'agence spécialiste des voyages en immersion. Nous proposons un tourisme authentique et responsable qui vous fera voyager différemment.',
      twitterCreator: '@odysway',
      twitterSite: '@odysway',
      author: 'Odysway',
      colorScheme: 'light',
      applicationName: 'Odysway',
      google: 'nopagereadaloud',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      googlebot: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' as any,
    },
  },
  sitemap: {
    // Use our runtime source that fetches dynamic URLs from Sanity
    sources: [
      '/api/__sitemap__/urls',
    ],
  },
  vitalizer: {
    // Remove the render-blocking entry CSS
    disableStylesheets: 'entry',

  },
})
